import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

test('asset generation cleans stale files, serves source photos and versions changed photos', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'homepage-assets-'));
  const script = fileURLToPath(new URL('./prepare-assets.mjs', import.meta.url));
  const generate = () => execFileSync(process.execPath, [script], { cwd: directory });
  const manifest = async () => JSON.parse(await readFile(join(directory, 'src/generated/photos.json'), 'utf8'));
  const cacheManifest = async () => JSON.parse(await readFile(join(directory, '.cache/prepare-assets/manifest.json'), 'utf8'));
  const photo = join(directory, 'assets/images/Background/test.png');
  const png = color => sharp({ create: { width: 32, height: 24, channels: 3, background: color } }).png().toBuffer();
  try {
    for (const path of ['assets/icons', 'assets/images/Background', 'assets/vendor', 'public/photos', 'public/assets/images']) {
      await mkdir(join(directory, path), { recursive: true });
    }
    await writeFile(join(directory, 'assets/images/avatar.png'), await png('white'));
    await writeFile(join(directory, 'assets/vendor/error-pages-l10n.min.js'), 'window.l10n = {};');
    for (const page of ['404', '502']) {
      await writeFile(join(directory, `${page}.html`), `<h1>${page}</h1><script>s.src = 'https://cdn.jsdelivr.net/gh/tarampampam/error-pages@2/l10n/l10n.min.js';</script>`);
    }
    await writeFile(join(directory, 'public/photos/old.webp'), 'stale');
    await writeFile(join(directory, 'public/assets/images/avatar_new.png'), 'stale');
    generate();
    assert.deepEqual(await manifest(), []);
    assert.equal(existsSync(join(directory, 'public/photos')), false, 'stale WebP derivative directory should be removed');
    assert.equal((await readdir(join(directory, 'public/assets/images'))).includes('avatar_new.png'), false);
    for (const page of ['404', '502']) {
      const html = await readFile(join(directory, `public/${page}.html`), 'utf8');
      assert.equal(html.includes('cdn.jsdelivr.net'), false, 'error page should not load a third-party CDN at runtime');
      assert.ok(html.includes('/assets/vendor/error-pages-l10n.min.js'), 'error page should reference the self-hosted l10n script');
    }
    assert.equal(await readFile(join(directory, 'public/assets/vendor/error-pages-l10n.min.js'), 'utf8'), 'window.l10n = {};');

    await writeFile(photo, await png('red'));
    generate();
    const [first] = await manifest();
    assert.equal(first.id, 'test.png');
    assert.deepEqual(first.lines, []);
    assert.equal(first.src, '/assets/images/Background/test.png', 'photos are served from their untouched source file');
    assert.equal('srcSet' in first, false, 'no re-encoded derivatives are referenced');
    assert.equal((await readdir(join(directory, 'public/assets/images/Background'))).includes('test.png'), true);
    const firstSourceHash = (await cacheManifest()).photos['test.png'].sourceHash;

    generate();
    assert.equal((await cacheManifest()).photos['test.png'].sourceHash, firstSourceHash, 'unchanged source photo should reuse its cached EXIF data');

    await writeFile(photo, await png('blue'));
    generate();
    const updated = await cacheManifest();
    assert.notEqual(updated.photos['test.png'].sourceHash, firstSourceHash, 'changed source photo should be re-read');

    const cacheStore = join(directory, '.cache/prepare-assets/store');
    assert.deepEqual(await readdir(cacheStore), [`${updated.avatar.hash}.webp`], 'store should only retain the avatar derivative');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
