import { mkdir, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';

// Run manually to refresh the vendored fonts. Normal builds remain offline.
const stylesheetUrl = 'https://fonts.googleapis.com/css2?family=Noto+Serif+JP:wght@200..900&family=Noto+Serif+TC:wght@200..900&display=swap';
const userAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36';
const fetchChecked = async (url, options) => {
  const response = await fetch(url, options);
  if (!response.ok) throw new Error(`${response.status}: ${url}`);
  return response;
};

let css = await (await fetchChecked(stylesheetUrl, { headers: { 'User-Agent': userAgent } })).text();
const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+\.woff2)\)/g)].map(match => match[1]))];
if (!urls.length || /format\('truetype'\)/.test(css)) throw new Error('Expected Unicode-split WOFF2 variable fonts.');
await mkdir('assets/fonts', { recursive: true });
await mkdir('public/fonts', { recursive: true });

let totalBytes = 0;
const pending = urls.slice();
await Promise.all(Array.from({ length: 8 }, async () => {
  while (pending.length) {
    const url = pending.shift();
    const family = url.includes('/notoserifjp/') ? 'noto-serif-jp' : 'noto-serif-tc';
    const hash = createHash('sha256').update(url).digest('hex').slice(0, 12);
    const filename = `${family}-${hash}.woff2`;
    const bytes = Buffer.from(await (await fetchChecked(url)).arrayBuffer());
    await writeFile(`assets/fonts/${filename}`, bytes);
    totalBytes += bytes.length;
    css = css.replaceAll(url, `./${filename}`);
  }
}));
await writeFile('assets/fonts/noto-serif.css', `/* Vendored from ${stylesheetUrl}. See /fonts/OFL-Noto-Serif-{TC,JP}.txt. */\n${css}`);
for (const language of ['TC', 'JP']) {
  const license = await (await fetchChecked(`https://raw.githubusercontent.com/google/fonts/main/ofl/notoserif${language.toLowerCase()}/OFL.txt`)).text();
  await writeFile(`public/fonts/OFL-Noto-Serif-${language}.txt`, license);
}
console.log(`Vendored ${urls.length} WOFF2 files (${(totalBytes / 1024 / 1024).toFixed(2)} MiB). Only matching Unicode ranges load in the browser.`);
