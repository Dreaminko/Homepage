import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

test('asset generation cleans stale files, handles empty albums and versions changed photos', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'homepage-assets-'));
  const script = fileURLToPath(new URL('./prepare-assets.mjs', import.meta.url));
  const generate = () => execFileSync(process.execPath, [script], { cwd: directory });
  const manifest = async () => JSON.parse(await readFile(join(directory, 'src/generated/photos.json'), 'utf8'));
  const photo = join(directory, 'assets/images/Background/test.png');
  const png = color => sharp({ create: { width: 32, height: 24, channels: 3, background: color } }).png().toBuffer();
  try {
    for (const path of ['assets/icons', 'assets/images/Background', 'public/photos', 'public/assets/images']) {
      await mkdir(join(directory, path), { recursive: true });
    }
    await writeFile(join(directory, 'assets/images/avatar.png'), await png('white'));
    for (const page of ['404', '502']) await writeFile(join(directory, `${page}.html`), `<h1>${page}</h1>`);
    await writeFile(join(directory, 'public/photos/old.webp'), 'stale');
    await writeFile(join(directory, 'public/assets/images/avatar_new.png'), 'stale');
    generate();
    assert.deepEqual(await manifest(), []);
    assert.deepEqual(await readdir(join(directory, 'public/photos')), []);
    assert.equal((await readdir(join(directory, 'public/assets/images'))).includes('avatar_new.png'), false);

    await writeFile(photo, await png('red'));
    generate();
    const [first] = await manifest();
    assert.equal(first.id, 'test.png');
    assert.deepEqual(first.lines, []);
    assert.equal(first.srcSet, `${first.src} 32w`);
    assert.match(first.src, /^\/photos\/[a-f0-9]{16}\.webp$/);

    generate();
    const [firstAgain] = await manifest();
    assert.equal(firstAgain.src, first.src, 'unchanged source photo should reuse its cached derivative');

    await writeFile(photo, await png('blue'));
    generate();
    const [second] = await manifest();
    assert.notEqual(second.src, first.src);
    assert.deepEqual(await readdir(join(directory, 'public/photos')), [second.src.split('/').at(-1)]);

    const cacheStore = join(directory, '.cache/prepare-assets/store');
    const cacheManifest = JSON.parse(await readFile(join(directory, '.cache/prepare-assets/manifest.json'), 'utf8'));
    const referencedHashes = new Set([cacheManifest.avatar.hash, ...cacheManifest.photos['test.png'].sources.map(({ hash }) => hash)]);
    assert.deepEqual(new Set(await readdir(cacheStore)), new Set([...referencedHashes].map(hash => `${hash}.webp`)), 'store should only retain files referenced by the current manifest');
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
