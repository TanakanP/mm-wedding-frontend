import assert from 'node:assert/strict';
import test from 'node:test';
import { componentHarness,nodes } from './helpers/componentHarness.mjs';

test('film strips occupy the former framed-video chapter using its existing anchor',async()=>{
 const h=await componentHarness(new URL('../src/components/v4/FilmStripChapter.tsx',import.meta.url),{
  '@/components/v4/WeddingFilmStrips':{__esModule:true,default:'Strips'},
 });
 const t=h.render();
 assert.equal(nodes(t,n=>n.type==='section')[0].props.id,'framed-photo');
 assert.equal(nodes(t,n=>n.type==='Strips').length,1);
 assert.equal(nodes(t,n=>n.type==='video'||n.type==='figure').length,0);
});
