import assert from 'node:assert/strict';
import test from 'node:test';
import { stat } from 'node:fs/promises';
import sharp from 'sharp';
import * as content from '../src/content/wedding.ts';

test('60 editable film slots share one small placeholder asset until unique photographs are selected', async () => {
  const photos = content.RSVP_FILM_PHOTOS;
  assert.ok(Array.isArray(photos), 'film library must exist');
  assert.equal(photos.length, 60);
  assert.equal(new Set(photos.map(p => p.id)).size, 60);
  assert.equal(new Set(photos.map(p => p.src)).size, 1, 'do not create 60 identical downloads');
  const file = new URL(`../public${photos[0].src}`, import.meta.url);
  const meta = await sharp(file.pathname).metadata();
  assert.equal(meta.width, 640);
  assert.equal(meta.height, 360);
  assert.ok((await stat(file)).size <= 80_000);
  for (const p of photos) {
    assert.match(p.blurDataURL, /^data:image\/webp;base64,/);
    assert.equal(p.objectPosition, '50% 50%');
  }
});

test('adding prepared unique photographs populates editable slots instead of repeating only the first', async () => {
  const { readFile }=await import('node:fs/promises');
  const { default: ts }=await import('typescript');
  const source=await readFile(new URL('../src/content/wedding.ts',import.meta.url),'utf8');
  const code=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,esModuleInterop:true,target:ts.ScriptTarget.ES2022}}).outputText;
  const fixture=[{src:'/first.webp'},{src:'/second.webp'},{src:'/third.webp'}];
  const compiledModule={exports:{}};
  new Function('require','module','exports',code)(id=>{assert.equal(id,'./rsvpFilmPhotos.json');return fixture},compiledModule,compiledModule.exports);
  const slots=compiledModule.exports.RSVP_FILM_PHOTOS;
  assert.deepEqual(slots.slice(0,4).map(p=>p.src),['/first.webp','/second.webp','/third.webp','/first.webp']);
  assert.equal(slots.length,60);
});
