import assert from 'node:assert/strict';
import test from 'node:test';
import { stat } from 'node:fs/promises';
import sharp from 'sharp';
import * as content from '../src/content/wedding.ts';

test('the film library contains the six selected optimized grayscale photos', async () => {
  const photos = content.RSVP_FILM_PHOTOS;
  assert.equal(photos.length, 6);
  assert.equal(new Set(photos.map(p => p.id)).size, 6);
  assert.equal(new Set(photos.map(p => p.src)).size, 6);
  assert.deepEqual(photos.map(p=>p.src.split('/').at(-1)), ['strip-081.webp','strip-082.webp','strip-114.webp','strip-194.webp','strip-254.webp','strip-033.webp']);
  const bytes=[];
  for (const p of photos) {
    const file=new URL(`../public${p.src}`,import.meta.url);
    const meta=await sharp(file.pathname).metadata();
    assert.equal(meta.width,1280);assert.equal(meta.height,720);
    const size=(await stat(file)).size;assert.ok(size<=80_000);bytes.push(size);
    assert.match(p.blurDataURL,/^data:image\/webp;base64,/);
    assert.equal(p.objectPosition,'50% 50%');
    for(const input of [file.pathname,Buffer.from(p.blurDataURL.split(',')[1],'base64')]){
      const {data,info}=await sharp(input).removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
      // Lossy WebP's YUV-to-RGB conversion can round neutral channels by one level.
      for(let i=0;i<data.length;i+=info.channels){assert.ok(Math.abs(data[i]-data[i+1])<=1);assert.ok(Math.abs(data[i]-data[i+2])<=1)}
    }
  }
  bytes.sort((a,b)=>b-a);
  assert.ok(bytes.slice(0,16).reduce((a,b)=>a+b,0)<=800_000);
  assert.ok(bytes.slice(0,32).reduce((a,b)=>a+b,0)<=1_600_000);
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
  assert.deepEqual(slots.map(p=>p.src),['/first.webp','/second.webp','/third.webp']);
  assert.equal(slots.length,3);
});
