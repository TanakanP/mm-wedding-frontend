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
