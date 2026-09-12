import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import exifr from 'exifr';

// Persists across runs (unlike the generated dirs below) so unchanged source
// photos skip EXIF parsing and the avatar skips re-encoding on the next start/build.
const cacheDir = '.cache/prepare-assets';
const cacheStore = `${cacheDir}/store`;
const cacheManifestPath = `${cacheDir}/manifest.json`;
await mkdir(cacheStore, { recursive: true });
const cache = await readFile(cacheManifestPath, 'utf8').then(JSON.parse).catch(() => ({ avatar: null, photos: {} }));
const usedHashes = new Set();
const hashOf = buffer => createHash('sha256').update(buffer).digest('hex').slice(0, 16);
const readFromStore = hash => readFile(`${cacheStore}/${hash}.webp`).catch(() => null);
const writeToStore = (hash, buffer) => writeFile(`${cacheStore}/${hash}.webp`, buffer);

// These directories contain only generated files; never clean source assets.
for (const directory of ['public/assets', 'src/generated']) {
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}
// Photos are served from their source files now; drop any earlier WebP derivatives.
await rm('public/photos', { recursive: true, force: true });
await cp('assets/icons', 'public/assets/icons', { recursive: true });
// Self-hosted so the error pages need no third-party runtime CDN request.
await cp('assets/vendor', 'public/assets/vendor', { recursive: true });
// Originals are copied as-is: the homepage shows them directly, and historical URLs keep working.
await cp('assets/images', 'public/assets/images', { recursive: true });

const avatarSource = await readFile('assets/images/avatar.png');
const avatarSourceHash = hashOf(avatarSource);
let avatarBuffer = cache.avatar?.sourceHash === avatarSourceHash ? await readFromStore(cache.avatar.hash) : null;
if (!avatarBuffer) {
  avatarBuffer = await sharp(avatarSource).rotate().resize(280, 280).webp({ quality: 85 }).toBuffer();
  const hash = hashOf(avatarBuffer);
  await writeToStore(hash, avatarBuffer);
  cache.avatar = { sourceHash: avatarSourceHash, hash };
}
usedHashes.add(cache.avatar.hash);
await writeFile('src/generated/avatar.webp', avatarBuffer);

const photos = [];
const cachedPhotos = cache.photos ?? {};
const nextCachedPhotos = {};
for (const file of (await readdir('assets/images/Background')).filter(name => /\.(jpe?g|png|webp)$/i.test(name)).sort()) {
  const input = `assets/images/Background/${file}`;
  const sourceHash = hashOf(await readFile(input));
  let entry = cachedPhotos[file]?.sourceHash === sourceHash ? cachedPhotos[file] : null;

  if (!entry) {
    const data = await exifr.parse(input, { reviveValues: false, pick: ['Make', 'Model', 'DateTimeOriginal', 'FocalLength', 'FNumber', 'ISO', 'ExposureTime'] }) ?? {};
    const lines = [
      [data.Make, data.Model].filter(Boolean).join(' '),
      typeof data.DateTimeOriginal === 'string' && data.DateTimeOriginal,
      data.FocalLength && `${Number(data.FocalLength.toFixed(2))}mm`,
      data.FNumber && `f/${data.FNumber}`,
      data.ISO && `ISO ${data.ISO}`,
      data.ExposureTime && (data.ExposureTime < 1 ? `1/${Math.round(1 / data.ExposureTime)}s` : `${data.ExposureTime}s`),
    ].filter(Boolean);
    entry = { lines };
  }

  nextCachedPhotos[file] = { sourceHash, lines: entry.lines };
  // Serve the source photo untouched; re-encoding it to WebP visibly degrades quality.
  photos.push({ id: file, src: `/assets/images/Background/${encodeURIComponent(file)}`, lines: entry.lines });
}

// Drop cache entries for photos removed from the source directory, and prune orphaned store files.
cache.photos = nextCachedPhotos;
await writeFile(cacheManifestPath, JSON.stringify(cache, null, 2) + '\n');
for (const name of await readdir(cacheStore)) {
  if (!usedHashes.has(name.replace(/\.webp$/, ''))) await rm(`${cacheStore}/${name}`);
}

await writeFile('src/generated/photos.json', JSON.stringify(photos, null, 2) + '\n');
for (const page of ['404', '502']) {
  const html = (await readFile(`${page}.html`, 'utf8'))
    // Drop the external font requests and point the localization script at the self-hosted copy.
    .replace(/    <link[^\n]*fonts\.bunny\.net[^\n]*\n/g, '')
    .replace(/https:\/\/cdn\.jsdelivr\.net\/gh\/tarampampam\/error-pages@[^/]+\/l10n\/l10n\.min\.js/g, '/assets/vendor/error-pages-l10n.min.js');
  await writeFile(`public/${page}.html`, html);
}
console.log(`Prepared ${photos.length} photos, avatar, source images and error pages.`);
