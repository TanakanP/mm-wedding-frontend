import assert from 'node:assert/strict';
import test from 'node:test';
import { access } from 'node:fs/promises';
import { V4_SECTION_IDS, NAV_ITEMS, OPENING_PHOTOS, FRAMED_PHOTOS, GALLERY_PHOTOS, PHOTOS, WEDDING } from '../src/content/wedding.ts';

test('the nine current chapters have unique section anchors', () => {
  assert.deepEqual(V4_SECTION_IDS, ['hero','families','dress-code','framed-photo','schedule','gallery','venue','final-image','rsvp']);
  assert.equal(new Set(V4_SECTION_IDS).size, 9);
});
test('every navigation item targets a current chapter', () => {
  assert.ok(NAV_ITEMS.length > 0);
  for (const item of NAV_ITEMS) assert.ok(V4_SECTION_IDS.includes(item.id), item.id);
  assert.equal(new Set(NAV_ITEMS.map(item => item.id)).size, NAV_ITEMS.length);
});
test('active photographs exist and gallery images are distinct with accessible descriptions', async () => {
  assert.equal(new Set(GALLERY_PHOTOS.map(p => p.src)).size, 4);
  const photos = [...Object.values(OPENING_PHOTOS), ...Object.values(FRAMED_PHOTOS), ...GALLERY_PHOTOS, PHOTOS[6], PHOTOS[9]];
  for (const p of photos) {
    await access(new URL(`../public${p.src}`, import.meta.url));
    assert.match(p.blurDataURL, /^data:image\//);
  }
  for (const p of GALLERY_PHOTOS) assert.ok(p.alt.length >= 12);
});
test('final running photograph retains its description', () => {
  assert.match(PHOTOS[9].alt, /running together through the garden/);
});
test('configured song exists and palette values are valid named colors', async () => {
  assert.ok(WEDDING.song.title.length > 0);
  if (WEDDING.song.audioUrl) await access(new URL(`../public${WEDDING.song.audioUrl}`, import.meta.url));
  assert.equal(WEDDING.dressCode.colors.length, 7);
  for (const color of WEDDING.dressCode.colors) { assert.ok(color.label); assert.match(color.value, /^#[a-f0-9]{6}$/i); }
});
