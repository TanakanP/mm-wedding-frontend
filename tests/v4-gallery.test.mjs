import assert from 'node:assert/strict';
import test from 'node:test';
import { componentHarness, nodes } from './helpers/componentHarness.mjs';
import { GALLERY_PHOTOS } from '../src/content/wedding.ts';

const url = new URL('../src/components/v4/GalleryChapter.tsx', import.meta.url);
const Image = 'Photo';
const load = reduced => componentHarness(url, {
  'next/image': { __esModule: true, default: Image },
  '@/content/wedding': { GALLERY_PHOTOS },
  '@/hooks/useHydrationSafeReducedMotion': { useHydrationSafeReducedMotion: () => reduced },
});
async function photoHarness(reduced = false) {
  const chapter = await load(reduced);
  const tree = chapter.render();
  const children = nodes(tree, n => typeof n.type === 'function');
  // Load the real GalleryPhoto through its parent, with hook state owned by this harness.
  const props = children[0];
  return { render: () => chapter.renderComponent(props.type, props.props), chapter, tree, children };
}

test('gallery photographs retain their order and responsive widths', async () => {
  const { children } = await photoHarness();
  assert.deepEqual(children.map(n => n.props.photo.src), GALLERY_PHOTOS.map(p => p.src));
  assert.deepEqual(children.map(n => n.props.index), [0, 1, 2, 3]);
});

test('gallery uses a visible decorative placeholder outside the initially hidden photo', async () => {
  const { render } = await photoHarness();
  const figure = render();
  const placeholder = nodes(figure, n => n.type === 'img')[0];
  assert.ok(placeholder, 'placeholder must be present before loading');
  assert.equal(placeholder.props.alt, '');
  assert.match(placeholder.props.className, /opacity-35/);
  const motion = nodes(figure, n => n.props?.initial?.opacity === 0)[0];
  assert.ok(motion);
  assert.equal(nodes(motion, n => n === placeholder).length, 0);
  const image = nodes(figure, n => n.type === Image)[0];
  assert.equal(image.props.loading, 'eager');
  assert.equal(image.props.fetchPriority, 'low');
  assert.equal(image.props.sizes, '100vw');
});

test('gallery reveals after 35 percent enters the screen with staggered zoom and no slide', async () => {
  const { chapter, children } = await photoHarness();
  for (const [index, child] of children.entries()) {
    const figure = chapter.renderComponent(child.type, child.props);
    const motion = nodes(figure, n => n.props?.initial?.opacity === 0)[0];
    assert.deepEqual(motion.props.viewport, { once: true, amount: 0.35 });
    assert.equal(motion.props.transition.duration, 0.95);
    assert.equal(motion.props.transition.delay, [0, 0.08, 0.16, 0.24][index]);
    assert.equal(motion.props.initial.y, undefined);
    assert.equal(motion.props.initial.scale, 1.08);
    assert.equal(motion.props.whileInView.y, undefined);
    assert.equal(motion.props.whileInView.scale, 1);
    assert.equal(motion.props.initial.filter, undefined);
    assert.equal(motion.props.whileInView.filter, undefined);
  }
});

test('reduced motion reveals immediately and failed images retain a placeholder', async () => {
  const { render } = await photoHarness(true);
  let figure = render();
  const immediate = nodes(figure, n => n.props?.initial === false)[0];
  assert.equal(immediate.props.animate.opacity, 1);
  assert.equal(immediate.props.animate.y, undefined);
  assert.equal(immediate.props.animate.scale, 1);
  assert.equal(immediate.props.transition.duration, 0);
  const image = nodes(figure, n => n.type === Image)[0];
  image.props.onError();
  figure = render();
  assert.ok(nodes(figure, n => n.type === 'img').length > 0);
  assert.equal(nodes(figure, n => n.type === Image).length, 1, 'keep request element mounted');
  assert.equal(nodes(figure, n => n.props?.style?.visibility === 'hidden').length, 1);
});
