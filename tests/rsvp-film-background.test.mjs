import assert from 'node:assert/strict';
import test from 'node:test';
import { componentHarness, nodes } from './helpers/componentHarness.mjs';
import * as layout from '../src/lib/rsvpFilmLayout.ts';
const file=new URL('../src/components/v4/WeddingFilmStrips.tsx',import.meta.url);
const photos=Array.from({length:60},(_,i)=>({id:`p${i}`,src:`/${i}.webp`,blurDataURL:'data:image/webp;base64,AAAA',objectPosition:'50% 50%'}));
async function setup({reduced=false,saveData=false,width=390,observer=true,resizeObserver=true,photoCount=60}={}) {
 const names=['window','document','navigator','IntersectionObserver','ResizeObserver','setTimeout','clearTimeout'];
 const saved=Object.fromEntries(names.map(n=>[n,Object.getOwnPropertyDescriptor(globalThis,n)]));
 const events=new Map(), observers=[], timers=new Map(); let timerId=0, disconnected=0;
 const set=(n,v)=>Object.defineProperty(globalThis,n,{value:v,writable:true,configurable:true});
 let rect={width,height:1000,top:2000,bottom:3000}; const el={getBoundingClientRect:()=>rect}; el.parentElement=el;
 set('window',{innerHeight:844,addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n),requestAnimationFrame:f=>{f();return 0},cancelAnimationFrame(){}});
 set('document',{visibilityState:'visible',addEventListener:(n,f)=>events.set(n,f),removeEventListener:n=>events.delete(n)});
 set('navigator',{connection:{saveData}});
 set('ResizeObserver',resizeObserver?class{constructor(f){this.f=f;observers.push(this)}observe(){}disconnect(){disconnected++}}:undefined);
 set('IntersectionObserver',observer?class{constructor(f,options){this.f=f;this.options=options;observers.push(this)}observe(){}disconnect(){disconnected++}}:undefined);
 set('setTimeout',(f,ms)=>{timers.set(++timerId,{f,ms});return timerId});set('clearTimeout',id=>timers.delete(id));
 let h;
 try{h=await componentHarness(file,{'next/image':{__esModule:true,default:'Photo'},'@/content/wedding':{RSVP_FILM_PHOTOS:photos.slice(0,photoCount)},'@/lib/rsvpFilmLayout':layout,'@/hooks/useHydrationSafeReducedMotion':{useHydrationSafeReducedMotion:()=>reduced}})}catch(e){restore();throw e}
 function restore(){for(const n of names){if(saved[n])Object.defineProperty(globalThis,n,saved[n]);else delete globalThis[n]}}
 let paused=false;
 const render=()=>h.render({paused});
 function tick(){let tree=render();h.flushEffects();for(const [id,t] of [...timers])if(t.ms===0){timers.delete(id);t.f()}tree=render();h.flushEffects();return tree}
 let tree=render();nodes(tree,n=>n.props?.ref)[0].props.ref.current=el;h.flushEffects();
 const resize=observers.find(o=>!o.options);if(resize)resize.f([{contentRect:{width,height:1000}}]);tick();
 return {h,events,observers,timers,render,tick,setViewport(top,bottom){rect={...rect,top,bottom}},setReduced(v){reduced=v},setModal(v){paused=v},enter(){for(const o of observers.filter(o=>o.options))o.f([{isIntersecting:true}]);return tick()},leave(){for(const o of observers.filter(o=>o.options))o.f([{isIntersecting:false}]);return tick()},resize(w,hgt){rect={...rect,width:w,height:hgt};if(resize)resize.f([{contentRect:{width:w,height:hgt}}]);else events.get('resize')();return tick()},cleanup(){h.cleanup();assert.ok(disconnected>=1);restore()}};
}
const images=t=>nodes(t,n=>n.type==='Photo');
const plane=t=>nodes(t,n=>n.props?.['data-film-plane'])[0];

test('photo admission waits for the section and batches four distinct sources even with 60 records',async()=>{
 const s=await setup();try{
  assert.equal(images(s.render()).length,0);
  let tree=s.enter();assert.equal(new Set(images(tree).map(n=>n.props.src)).size,4);
  const first=images(tree);for(const n of first.slice(0,3))n.props.onLoad();tree=s.tick();
  assert.equal(new Set(images(tree).map(n=>n.props.src)).size,4,'partial batch must not start more sources');
  first[3].props.onError();tree=s.tick();s.tick();tree=s.tick();
  assert.ok(new Set(images(tree).map(n=>n.props.src)).size<=8);
  assert.ok(nodes(tree,n=>n.type==='img'&&n.props.alt==='').length>0,'failed frame retains placeholder');
 }finally{s.cleanup()}
});

test('automatic pause follows external pause, viewport and document transitions without a manual control',async()=>{
 const s=await setup();try{
  let t=s.enter();assert.equal(plane(t).props['data-paused'],false);
  assert.equal(nodes(t,n=>n.type==='button').length,0);
  s.setModal(true);assert.equal(plane(s.tick()).props['data-paused'],true);
  s.setModal(false);assert.equal(plane(s.tick()).props['data-paused'],false);
  assert.equal(plane(s.leave()).props['data-paused'],true);
  assert.equal(plane(s.enter()).props['data-paused'],false);
  globalThis.document.visibilityState='hidden';s.events.get('visibilitychange')();
  assert.equal(plane(s.tick()).props['data-paused'],true);
  globalThis.document.visibilityState='visible';s.events.get('visibilitychange')();
  assert.equal(plane(s.tick()).props['data-paused'],false);
  t=s.resize(1440,1200);assert.equal(plane(t).props['data-paused'],false);
 }finally{s.cleanup()}
});

test('reduced motion and Save-Data show the full static composition without a motion control',async()=>{
 for(const opts of [{reduced:true},{saveData:true}]){
  const s=await setup(opts);try{const t=s.enter();assert.equal(plane(t).props['data-paused'],true);assert.equal(nodes(t,n=>n.type==='button').length,0);assert.ok(nodes(t,n=>n.props?.['data-film-row']).length===layout.getFilmStripLayout(390).rowCount)}finally{s.cleanup()}
 }
 const s=await setup();try{s.enter();s.setReduced(true);assert.equal(plane(s.tick()).props['data-paused'],true)}finally{s.cleanup()}
});

test('resize preserves compact section height and updates film coverage',async()=>{
 const s=await setup();try{
  let t=s.enter(), before=nodes(t,n=>n.props?.['data-film-row']).length;
  t=s.resize(390,1800);assert.equal(nodes(t,n=>n.props?.['data-film-row']).length,before);
  t=s.resize(1440,1800);assert.equal(nodes(t,n=>n.props?.['data-film-row']).length,layout.getFilmStripLayout(1440).rowCount);
  const count=nodes(t,n=>n.props?.['data-film-row']).length;
  assert.equal(nodes(s.resize(0,0),n=>n.props?.['data-film-row']).length,count);
  for(const row of nodes(t,n=>n.props?.['data-film-row'])){
   const groups=nodes(row,n=>n.props?.['data-film-group']);assert.equal(groups.length,2);
   assert.deepEqual(nodes(groups[0],n=>n.props?.['data-photo-src']).map(n=>n.props['data-photo-src']),nodes(groups[1],n=>n.props?.['data-photo-src']).map(n=>n.props['data-photo-src']));
  }
 }finally{s.cleanup()}
});

test('stalled batches stop admission and late callbacks after cleanup are ignored',async()=>{
 const s=await setup();try{
  const t=s.enter(), first=images(t);
  for(const [id,timer] of [...s.timers])if(timer.ms>0){s.timers.delete(id);timer.f()}
  assert.equal(new Set(images(s.tick()).map(n=>n.props.src)).size,4);
  s.h.cleanup();for(const n of first)n.props.onLoad();
  assert.equal(new Set(images(s.render()).map(n=>n.props.src)).size,4);
 }finally{s.cleanup()}
});

test('expired batch retries on re-entry and ignores callbacks from the obsolete attempt', async () => {
  const realNow=Date.now; let now=1000; Date.now=()=>now;
  const s=await setup();try{
    const old=images(s.enter()); now+=15001;
    for(const [id,timer] of [...s.timers])if(timer.ms>0){s.timers.delete(id);timer.f()}
    s.tick();s.leave();const retried=images(s.enter());
    assert.ok([...s.timers.values()].some(t=>t.ms>0),'new session must get a fresh timeout');
    for(const n of old)n.props.onLoad();
    assert.equal(images(s.tick()).length,4,'old callbacks cannot settle new representatives');
    for(const n of retried)n.props.onLoad();s.tick();const tree=s.tick();
    assert.equal(new Set(images(tree).map(n=>n.props.src)).size,8,'successful retry advances to next batch');
  }finally{s.cleanup();Date.now=realNow}
});

test('missing observers use viewport and window-resize fallbacks and remove listeners', async () => {
 const scroll=await setup({observer:false});try{
  assert.equal(images(scroll.render()).length,0);
  scroll.setViewport(100,1100);scroll.events.get('scroll')();
  assert.equal(new Set(images(scroll.tick()).map(n=>n.props.src)).size,4);
  scroll.setViewport(2000,3000);scroll.events.get('scroll')();
  assert.equal(plane(scroll.tick()).props['data-paused'],true);
 }finally{scroll.cleanup();assert.equal(scroll.events.size,0)}
 const resize=await setup({resizeObserver:false});try{
  assert.equal(resize.observers.filter(o=>!o.options).length,0);
  resize.enter();const before=plane(resize.render()).props.style.height;
  const after=resize.resize(1440,1800);
  assert.equal(nodes(after,n=>n.props?.['data-film-row']).length,1);
  assert.ok(plane(after).props.style.height>before);
 }finally{resize.cleanup();assert.equal(resize.events.size,0)}
});

test('8-, 48- and 60-photo fixtures keep frame counts fixed and obey active-source caps',async()=>{
 for(const width of [390,1440]){
  const counts=[];
  for(const photoCount of [8,48,60]){
   const s=await setup({width,photoCount});try{
    let tree=s.enter();
    for(let batch=0;batch<10;batch++){for(const image of images(tree))image.props.onLoad();tree=s.tick();tree=s.tick()}
    const distinct=new Set(images(tree).map(n=>n.props.src));
    assert.ok(distinct.size<=Math.min(photoCount,width<768?16:32));
    counts.push(nodes(tree,n=>n.props?.className==='wedding-film-frame').length);
    const decorative=nodes(tree,n=>n.props?.className==='wedding-film-decoration')[0];
    assert.equal(decorative.props['aria-hidden'],'true');
    assert.equal(nodes(decorative,n=>n.type==='button'||n.type==='a'||n.props?.tabIndex>=0).length,0);
   }finally{s.cleanup()}
  }
  assert.equal(new Set(counts).size,1);
 }
});


test('each strip mixes all six photos, avoids adjacent repeats, and duplicates its seamless group', async () => {
 for (const width of [390,1440]) {
  const s=await setup({width,photoCount:6});try {
   const tree=s.enter();
   const rows=nodes(tree,n=>n.props?.['data-film-row']);
   assert.equal(rows.length,layout.getFilmStripLayout(width).rowCount);
   const sequences=rows.map(row=>{
    const groups=nodes(row,n=>n.props?.['data-film-group']);
    const sources=nodes(groups[0],n=>n.props?.['data-photo-src']).map(n=>n.props['data-photo-src']);
    assert.equal(new Set(sources).size,6);
    sources.forEach((src,index)=>assert.notEqual(src,sources[(index+1)%sources.length],'adjacent frames differ, including at the seam'));
    assert.deepEqual(sources,nodes(groups[1],n=>n.props?.['data-photo-src']).map(n=>n.props['data-photo-src']));
    return sources;
   });
   assert.ok(new Set(sequences.map(s=>s.join(','))).size===rows.length,'strips have varied orders');
   assert.deepEqual(sequences, nodes(s.tick(),n=>n.props?.['data-film-row']).map(row=>nodes(nodes(row,n=>n.props?.['data-film-group'])[0],n=>n.props?.['data-photo-src']).map(n=>n.props['data-photo-src'])),'rerenders retain photo order');
   let ready=tree;
   for(let batch=0;batch<3;batch++){for(const image of images(ready))image.props.onLoad();ready=s.tick();ready=s.tick()}
   assert.equal(new Set(images(ready).map(n=>n.props.src)).size,6);
  }finally{s.cleanup()}
 }
});
