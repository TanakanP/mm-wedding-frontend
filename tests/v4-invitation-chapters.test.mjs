import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { componentHarness, nodes } from './helpers/componentHarness.mjs';
import { FRAMED_PHOTOS } from '../src/content/wedding.ts';

const read = (name) =>
  readFile(new URL(`../src/components/v4/${name}.tsx`, import.meta.url), "utf8").catch(() => "");

test('framed portrait waits for 35 percent visibility and preserves eager loading and reduced motion', async () => {
  for (const reduced of [false, true]) {
    const h = await componentHarness(new URL('../src/components/v4/FramedPhotoChapter.tsx', import.meta.url), {
      'next/image': { __esModule: true, default: 'Photo' },
      '@/content/wedding': { FRAMED_PHOTOS },
      '@/hooks/useHydrationSafeReducedMotion': { useHydrationSafeReducedMotion: () => reduced },
    });
    const tree = h.render();
    const frame = nodes(tree, n => n.type === 'figure')[0];
    if (reduced) {
      assert.equal(frame.props.initial, false);
      assert.equal(frame.props.animate.opacity, 1);
      assert.equal(frame.props.transition.duration, 0);
    } else {
      assert.deepEqual(frame.props.viewport, { once: true, amount: 0.35 });
      assert.equal(frame.props.transition.duration, 0.95);
      assert.equal(frame.props.initial.opacity, 0);
      assert.equal(frame.props.whileInView.opacity, 1);
    }
    for (const image of nodes(tree, n => n.type === 'Photo')) {
      assert.equal(image.props.loading, 'eager');
      assert.equal(image.props.fetchPriority, 'low');
    }
  }
});

test("sections two through four remain separately editable", async () => {
  const [family, frame, dress] = await Promise.all([
    read("FamilyChapter"),
    read("FramedPhotoChapter"),
    read("DressCodeChapter"),
  ]);
  assert.match(family, /id="families"/);
  assert.match(frame, /id="framed-photo"/);
  assert.match(dress, /id="dress-code"/);
  assert.match(dress, /dressCode\.colors\.map/);
});

test("primary invitation and dress-code copy uses solid readable wine", async () => {
  const [family, dress] = await Promise.all([read("FamilyChapter"), read("DressCodeChapter")]);
  assert.match(family, /font-serif text-lg leading-relaxed text-wine md:text-xl/);
  assert.match(dress, /font-serif text-lg leading-relaxed text-wine/);
});

test("framed portrait advertises its visible image and frame widths", async () => {
  const frame = await read("FramedPhotoChapter");
  assert.match(frame, /aspect-\[834\/1200\]/);
  assert.match(frame, /w-\[min\(66vw,450px\)\]/);
  assert.match(frame, /sizes="\(max-width: 639px\) 47vw, \(max-width: 767px\) 41vw, 320px"/);
  assert.match(frame, /sizes="\(max-width: 639px\) 66vw, \(max-width: 767px\) 58.5vw, 450px"/);
  assert.match(frame, /FRAMED_PHOTOS.frame/);
});
