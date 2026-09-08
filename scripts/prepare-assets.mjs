import { cp, mkdir, readdir, readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';
import exifr from 'exifr';

await mkdir('public/photos', { recursive: true });
await mkdir('src/generated', { recursive: true });
await cp('assets/icons', 'public/assets/icons', { recursive: true });
// Keep historical image URLs working; the homepage uses optimized derivatives.
await cp('assets/images', 'public/assets/images', { recursive: true });
await sharp('assets/images/avatar_new.png').resize(280, 280).webp({ quality: 85 }).toFile('public/photos/avatar.webp');
const photos = [];
for (const file of (await readdir('assets/images/Background')).filter(name => /\.jpg$/i.test(name)).sort()) {
  const input = `assets/images/Background/${file}`;
  const id = file.replace(/\.jpg$/i, '');
  const data = await exifr.parse(input, { pick: ['Make', 'Model', 'DateTimeOriginal', 'FocalLength', 'FNumber', 'ISO', 'ExposureTime'] }) ?? {};
  const lines = [
    [data.Make, data.Model].filter(Boolean).join(' '),
    data.FocalLength && `${Number(data.FocalLength.toFixed(2))}mm`,
    data.FNumber && `f/${data.FNumber}`,
    data.ISO && `ISO ${data.ISO}`,
    data.ExposureTime && (data.ExposureTime < 1 ? `1/${Math.round(1 / data.ExposureTime)}s` : `${data.ExposureTime}s`),
  ].filter(Boolean);
  // EXIF timestamps have no reliable timezone: preserve the original string when available.
  const raw = await exifr.parse(input, { pick: ['DateTimeOriginal'], reviveValues: false });
  if (typeof raw?.DateTimeOriginal === 'string') lines.splice(1, 0, raw.DateTimeOriginal);
  for (const width of [960, 1920]) {
    await sharp(input).rotate().resize({ width, withoutEnlargement: true }).webp({ quality: 80 }).toFile(`public/photos/${id}-${width}.webp`);
  }
  photos.push({ id, src: `/photos/${id}-1920.webp`, srcSet: `/photos/${id}-960.webp 960w, /photos/${id}-1920.webp 1920w`, lines });
}
await writeFile('src/generated/photos.json', JSON.stringify(photos, null, 2) + '\n');
for (const page of ['404', '502']) {
  const html = (await readFile(`${page}.html`, 'utf8')).replace(/    <link[^\n]*fonts\.bunny\.net[^\n]*\n/g, '');
  await writeFile(`public/${page}.html`, html);
}
console.log(`Prepared ${photos.length} photos, avatar, legacy URLs and error pages.`);
