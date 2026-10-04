import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const finalImage = await readFile(
  new URL("../src/components/v4/FinalImageChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");
const rsvp = await readFile(
  new URL("../src/components/v4/RSVPChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");
const faq = await readFile(
  new URL("../src/components/FAQSection.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("V4 ends with a cinematic image and one RSVP section", () => {
  assert.match(finalImage, /id="final-image"/);
  assert.match(finalImage, /PHOTOS\[9\]/);
  assert.match(rsvp, /id="rsvp"/);
  assert.match(rsvp, /RSVPForm/);
  assert.match(rsvp, /isOpen=\{isRSVPOpen\}/);
  assert.match(rsvp, /onClose=\{\(\) => setIsRSVPOpen\(false\)\}/);
});

test("V4 RSVP action uses high-contrast invitation colors", () => {
  assert.match(
    rsvp,
    /className="[^"]*bg-wine[^"]*text-cream[^"]*"[^>]*>\s*Share your response/s
  );
});

test("V4 FAQ small copy and footer controls use readable wine ink", () => {
  assert.match(
    faq,
    /className="[^"]*text-sm[^"]*text-wine"[^>]*>\s*A few gentle answers/s
  );
  assert.match(
    faq,
    /className="[^"]*text-xs text-wine"[^>]*>[\s\S]*?Back to the top/
  );
  assert.match(
    faq,
    /className="text-wine"[^>]*>\s*Wander the garden above/s
  );
  assert.match(
    faq,
    /className="[^"]*text-\[10px\] text-wine"[^>]*>\s*©/s
  );
});

test('paper RSVP keeps its working form without a photo or film background', async () => {
  const { componentHarness, nodes } = await import('./helpers/componentHarness.mjs');
  const chapter = await componentHarness(new URL('../src/components/v4/RSVPChapter.tsx', import.meta.url), {
    '@/components/RSVPForm': { __esModule: true, default: 'Form' },
    '@/components/hero/PetalsCanvas': { __esModule: true, default: 'Confetti' },
    '@/components/v4/RSVPFilmBackground': { __esModule: true, default: 'Film' },
    '@/hooks/useHydrationSafeReducedMotion': { useHydrationSafeReducedMotion: () => false },
  });
  let tree=chapter.render();
  assert.equal(nodes(tree,n=>n.type==='Film').length,0);
  assert.equal(nodes(tree,n=>n.type==='img').length,0);
  assert.doesNotMatch(rsvp, /next\/image|PHOTOS/);
  nodes(tree,n=>n.type==='button')[0].props.onClick();
  tree=chapter.render();
  assert.equal(nodes(tree,n=>n.type==='Form')[0].props.isOpen,true);
  nodes(tree,n=>n.type==='Form')[0].props.onClose();
  assert.equal(nodes(chapter.render(),n=>n.type==='Form')[0].props.isOpen,false);
});

test('the RSVP float and glow pause offscreen, in hidden tabs, and while responding', async () => {
  const { componentHarness, nodes } = await import('./helpers/componentHarness.mjs');
  const saved = Object.getOwnPropertyDescriptor(globalThis, 'document');
  const events = new Map();
  Object.defineProperty(globalThis, 'document', { configurable: true, value: {
    hidden: false, addEventListener: (name, fn) => events.set(name, fn),
    removeEventListener: name => events.delete(name),
  } });
  const chapter = await componentHarness(new URL('../src/components/v4/RSVPChapter.tsx', import.meta.url), {
    '@/components/RSVPForm': { __esModule: true, default: 'Form' },
    '@/components/hero/PetalsCanvas': { __esModule: true, default: 'Confetti' },
    '@/hooks/useHydrationSafeReducedMotion': { useHydrationSafeReducedMotion: () => false },
  });
  const floating = () => nodes(chapter.render(), n => n.props?.className === 'rsvp-card-float')[0];
  const glow = () => nodes(chapter.render(), n => n.props?.className === 'rsvp-card-glow')[0];
  const assertPlayback = state => {
    assert.equal(floating().props.style.animationPlayState, state);
    assert.equal(glow().props.style.animationPlayState, state);
  };
  try {
    chapter.render(); chapter.flushEffects();
    assert.ok(floating(), 'card must have a floating surface');
    assert.ok(glow(), 'card must have a glowing light');
    assertPlayback('paused');
    const viewport = nodes(chapter.render(), n => n.props?.onViewportEnter)[0];
    viewport.props.onViewportEnter();
    assertPlayback('running');
    document.hidden = true; events.get('visibilitychange')();
    assertPlayback('paused');
    document.hidden = false; events.get('visibilitychange')();
    assertPlayback('running');
    nodes(chapter.render(), n => n.type === 'button')[0].props.onClick();
    assertPlayback('paused');
    nodes(chapter.render(), n => n.type === 'Form')[0].props.onClose();
    assertPlayback('running');
    viewport.props.onViewportLeave();
    assertPlayback('paused');
  } finally {
    chapter.cleanup();
    if (saved) Object.defineProperty(globalThis, 'document', saved); else delete globalThis.document;
  }
});
