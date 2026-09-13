import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const directory = new URL('../assets/fonts/', import.meta.url);
const covers = (ranges, character) => {
  const codepoint = character.codePointAt(0);
  return ranges.split(',').some(range => {
    const [first, last = first] = range.trim().replace(/^U\+/i, '').split('-');
    return codepoint >= parseInt(first, 16) && codepoint <= parseInt(last, 16);
  });
};

test('vendored Noto Serif faces have local WOFF2 sources, licenses and bilingual coverage', async () => {
  const css = await readFile(new URL('noto-serif.css', directory), 'utf8');
  const faces = [...css.matchAll(/@font-face\s*\{([^}]+)\}/g)].map(match => match[1]);
  assert.ok(faces.length, 'the stylesheet must define downloadable fonts');
  for (const face of faces) {
    const source = face.match(/src:\s*url\(([^)]+)\)\s*format\('woff2'\)/)?.[1];
    assert.ok(source?.startsWith('./'), 'fonts must load from the local deployment');
    const bytes = await readFile(new URL(source, directory));
    assert.equal(bytes.subarray(0, 4).toString('ascii'), 'wOF2');
  }
  for (const [language, text] of [['TC', '願你行善不作惡本站運行備號'], ['JP', 'ゆめ日本語']]) {
    const family = `Noto Serif ${language}`;
    const familyFaces = faces.filter(face => face.includes(`font-family: '${family}'`));
    assert.ok(familyFaces.length, `${family} must be available`);
    for (const character of text) {
      assert.ok(familyFaces.some(face => covers(face.match(/unicode-range:\s*([^;]+);/)?.[1] ?? '', character)), `${family} must cover ${character}`);
    }
    const license = await readFile(new URL(`../public/fonts/OFL-Noto-Serif-${language}.txt`, import.meta.url), 'utf8');
    assert.ok(license.includes('SIL OPEN FONT LICENSE'));
  }
});
