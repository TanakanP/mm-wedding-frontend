import assert from 'node:assert/strict';
import test from 'node:test';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import sharp from 'sharp';
import * as preparation from '../scripts/prepare-rsvp-film-photos.mjs';

test('film preparation accepts wide landscapes without extracting beyond the source', async () => {
  assert.equal(typeof preparation.prepareFilmPhoto,'function');
  const dir=await mkdtemp(join(tmpdir(),'rsvp-film-crop-'));
  try {
    const source=join(dir,'wide.png');
    await sharp({create:{width:1600,height:600,channels:3,background:'#b88b96'}}).png().toFile(source);
    const photo=await preparation.prepareFilmPhoto({name:'wide',source,cropTop:0.3},dir);
    const meta=await sharp(join(dir,'wide.webp')).metadata();
    assert.equal(meta.width,640);assert.equal(meta.height,360);
    assert.match(photo.blurDataURL,/^data:image\/webp/);
    await assert.rejects(()=>preparation.prepareFilmPhoto({name:'bad',source,cropTop:-1},dir),/cropTop/);
  }finally{await rm(dir,{recursive:true,force:true})}
});


test('grayscale preparation removes color from the display image and inline fallback', async () => {
 const dir=await mkdtemp(join(tmpdir(),'rsvp-film-gray-'));
 try {
  const source=join(dir,'color.png');
  await sharp({create:{width:1600,height:900,channels:3,background:'#c73b59'}}).png().toFile(source);
  const photo=await preparation.prepareFilmPhoto({name:'gray',source,cropTop:0.5,grayscale:true},dir);
  for(const input of [join(dir,'gray.webp'),Buffer.from(photo.blurDataURL.split(',')[1],'base64')]){
   const {data,info}=await sharp(input).removeAlpha().toColourspace('srgb').raw().toBuffer({resolveWithObject:true});
   for(let i=0;i<data.length;i+=info.channels){assert.equal(data[i],data[i+1]);assert.equal(data[i],data[i+2])}
  }
 }finally{await rm(dir,{recursive:true,force:true})}
});
