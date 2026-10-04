import assert from 'node:assert/strict';
import test from 'node:test';
const film = await import('../src/lib/rsvpFilmLayout.ts').catch(() => ({}));

test('rotated film covers all four corners on narrow, tall, desktop and ultrawide sections', () => {
  assert.equal(typeof film.getRSVPFilmLayout, 'function');
  for (const [w,h] of [[320,1000],[390,1200],[768,1024],[1440,848],[2560,1440]]) {
    const l=film.getRSVPFilmLayout(w,h), a=l.angleDeg*Math.PI/180;
    for (const x of [-w/2,w/2]) for(const y of [-h/2,h/2]) {
      const px=x*Math.cos(a)+y*Math.sin(a), py=-x*Math.sin(a)+y*Math.cos(a);
      assert.ok(l.planeWidth/2-Math.abs(px)>=47);
      assert.ok(l.planeHeight/2-Math.abs(py)>=47);
    }
    assert.ok(l.groupWidth>=l.planeWidth);
    assert.equal(l.groupWidth/l.framePitch % 8,0);
    assert.ok(l.rowCount*l.rowPitch>=l.planeHeight);
    assert.equal(l.rowPitch-((l.framePitch-12)*9/16+2*l.railHeight),2);
  }
  assert.ok(film.getRSVPFilmLayout(390,1600).rowCount>film.getRSVPFilmLayout(390,800).rowCount);
});

test('invalid layout measurements cannot replace valid geometry', () => {
  assert.equal(typeof film.getRSVPFilmLayout, 'function');
  for(const [w,h] of [[0,800],[390,0],[-1,800],[NaN,800],[Infinity,800]])assert.equal(film.getRSVPFilmLayout(w,h),null);
});

test('large libraries do not increase active sources or visible frame geometry', () => {
  assert.equal(typeof film.selectRSVPFilmPhotos, 'function');
  const photos=Array.from({length:60},(_,i)=>({id:`p${i}`,src:`/${i}.webp`}));
  assert.equal(film.selectRSVPFilmPhotos(photos,390,0,false).length,16);
  assert.equal(film.selectRSVPFilmPhotos(photos,1440,0,false).length,32);
  assert.equal(film.selectRSVPFilmPhotos(photos,1440,0,true).length,8);
  assert.deepEqual(film.selectRSVPFilmPhotos(photos,390,58,false).slice(0,3).map(p=>p.id),['p58','p59','p0']);
  assert.equal(film.selectRSVPFilmPhotos(photos.slice(0,8),390,0,false).length,8);
  assert.deepEqual(film.selectRSVPFilmPhotos([],390,0,false),[]);
});


test('mixed row assignment stays deterministic and handles short or empty libraries', () => {
 assert.equal(typeof film.getRSVPFilmRow,'function');
 assert.deepEqual(film.getRSVPFilmRow([],0,8),[]);
 assert.deepEqual(film.getRSVPFilmRow(['only'],0,8),Array(8).fill('only'));
 for(const count of [2,6,16,32])for(const row of [0,1,2,5,8,11])for(const slots of [8,16,24]){
  const photos=Array.from({length:count},(_,i)=>i);
  const before=[...photos], sequence=film.getRSVPFilmRow(photos,row,slots);
  assert.equal(sequence.length,slots);
  assert.deepEqual(photos,before);
  assert.deepEqual(sequence,film.getRSVPFilmRow(photos,row,slots));
  assert.ok(sequence.every(p=>photos.includes(p)));
  sequence.forEach((photo,index)=>assert.notEqual(photo,sequence[(index+1)%slots]));
  if(count===6)assert.equal(new Set(sequence).size,6);
 }
});


test('one large tilted strip fits fully within the taller section', () => {
 for(const width of [320,390,768,1440,2560]){
  const l=film.getFilmStripLayout(width),original=film.getRSVPFilmLayout(width,1);
  assert.equal(l.rowCount,1);
  assert.equal(l.angleDeg,width<768?-3:-6);
  assert.equal(l.planeHeight,Math.ceil(original.rowPitch*3));
  assert.equal(l.rowPitch,l.planeHeight);
  const radians=Math.abs(l.angleDeg)*Math.PI/180;
  const rotatedHeight=l.planeHeight*Math.cos(radians)+l.planeWidth*Math.sin(radians);
  assert.ok(l.stageHeight-rotatedHeight>=16);
  assert.ok(l.stageHeight-rotatedHeight<17);
  assert.ok(l.planeWidth>=width);
  const angle=l.angleDeg*Math.PI/180;
  for(const x of [-width/2,width/2])for(const y of [-l.planeHeight/2,l.planeHeight/2]){
   assert.ok(l.planeWidth/2-Math.abs(x*Math.cos(angle)+y*Math.sin(angle))>=47);
  }
  assert.ok(l.groupWidth>=l.planeWidth);
  assert.ok(Math.abs((l.framePitch-12)/(l.rowPitch-2*l.railHeight-2)-16/9)<0.001);
 }
 for(const width of [0,-1,NaN,Infinity])assert.equal(film.getFilmStripLayout(width),null);
});
