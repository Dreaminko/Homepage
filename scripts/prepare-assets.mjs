import { cp, mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';
import exifr from 'exifr';

// Persists across runs (unlike the generated dirs below) so unchanged source
// photos skip EXIF parsing and WebP compression on the next dev start/build.
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
for (const directory of ['public/photos', 'public/assets', 'src/generated']) {
  await rm(directory, { recursive: true, force: true });
  await mkdir(directory, { recursive: true });
}
await cp('assets/icons', 'public/assets/icons', { recursive: true });
// Keep historical image URLs working; the homepage uses optimized derivatives.
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

  if (entry) {
    // Fall back to reprocessing if the store was pruned or tampered with.
    const buffers = await Promise.all(entry.sources.map(({ hash }) => readFromStore(hash)));
    if (buffers.some(buffer => !buffer)) entry = null;
    else for (const [i, { hash }] of entry.sources.entries()) await writeFile(`public/photos/${hash}.webp`, buffers[i]);
  }

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
    const sources = [];
    for (const width of [960, 1920]) {
      const { data: image, info } = await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toBuffer({ resolveWithObject: true });
      if (sources.some(source => source.width === info.width)) continue;
      const hash = hashOf(image);
      sources.push({ hash, width: info.width });
      await writeToStore(hash, image);
      await writeFile(`public/photos/${hash}.webp`, image);
    }
    entry = { sourceHash, lines, sources };
  }

  nextCachedPhotos[file] = entry;
  for (const { hash } of entry.sources) usedHashes.add(hash);
  const sources = entry.sources.map(({ hash, width }) => ({ src: `/photos/${hash}.webp`, width }));
  photos.push({ id: file, src: sources.at(-1).src, srcSet: sources.map(({ src, width }) => `${src} ${width}w`).join(', '), lines: entry.lines });
}

// Drop cache entries for photos removed from the source directory, and prune orphaned store files.
cache.photos = nextCachedPhotos;
await writeFile(cacheManifestPath, JSON.stringify(cache, null, 2) + '\n');
for (const name of await readdir(cacheStore)) {
  if (!usedHashes.has(name.replace(/\.webp$/, ''))) await rm(`${cacheStore}/${name}`);
}

await writeFile('src/generated/photos.json', JSON.stringify(photos, null, 2) + '\n');
for (const page of ['404', '502']) {
  const html = (await readFile(`${page}.html`, 'utf8')).replace(/    <link[^\n]*fonts\.bunny\.net[^\n]*\n/g, '');
  await writeFile(`public/${page}.html`, html);
}
console.log(`Prepared ${photos.length} photos, avatar, legacy URLs and error pages.`);
