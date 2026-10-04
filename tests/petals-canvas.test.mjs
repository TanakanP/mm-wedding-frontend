import assert from 'node:assert/strict';
import test from 'node:test';
import { componentHarness, nodes } from './helpers/componentHarness.mjs';

async function environment(run, reduced = false) {
  const names = ['window', 'document', 'getComputedStyle', 'requestAnimationFrame', 'cancelAnimationFrame', 'IntersectionObserver'];
  const saved = names.map(name => [name, Object.getOwnPropertyDescriptor(globalThis, name)]);
  const frames = new Map(), events = new Map();
  let id = 0, intersect, draws = 0;
  const canvases = [];
  const canvasAt = index => {
    if (!canvases[index]) {
      let count = 0;
      const ctx = new Proxy({}, { get: (_, name) => name === 'fill' ? () => { draws++; count++; } : () => {} });
      canvases[index] = { width: 390, height: 848, getContext: () => ctx, getBoundingClientRect: () => ({ width: 390, height: 848 }), draws: () => count };
    }
    return canvases[index];
  };
  const set = (name, value) => Object.defineProperty(globalThis, name, { configurable: true, writable: true, value });
  set('window', { addEventListener() {}, removeEventListener() {} });
  set('document', { hidden: false, documentElement: {}, addEventListener: (name, fn) => events.set(name, fn), removeEventListener: name => events.delete(name) });
  set('getComputedStyle', () => ({ getPropertyValue: () => '#eed4d8' }));
  set('requestAnimationFrame', fn => { frames.set(++id, fn); return id; });
  set('cancelAnimationFrame', key => frames.delete(key));
  set('IntersectionObserver', class { constructor(fn) { intersect = fn; } observe() {} disconnect() {} });
  const component = await componentHarness(new URL('../src/components/hero/PetalsCanvas.tsx', import.meta.url), {
    '@/hooks/useHydrationSafeReducedMotion': { useHydrationSafeReducedMotion: () => reduced },
  });
  const render = props => { const tree = component.render(props); nodes(tree, n => n.type === 'canvas').forEach((node, index) => { node.props.ref.current = canvasAt(index); }); component.flushEffects(); };
  const frame = () => { const [key, fn] = frames.entries().next().value; frames.delete(key); fn(100); };
  try { await run({ render, frames, frame, events, component, canvases, intersect: visible => intersect([{ isIntersecting: visible }]), draws: () => draws }); }
  finally { component.cleanup(); for (const [name, descriptor] of saved) if (descriptor) Object.defineProperty(globalThis, name, descriptor); else delete globalThis[name]; }
}

test('falling confetti draws only while visible and stops for hidden tabs and open forms', async () => {
  await environment(async env => {
    env.render({ variant: 'confetti' });
    assert.equal(env.frames.size, 0, 'offscreen confetti must not schedule drawing');
    env.intersect(true);
    assert.equal(env.frames.size, 1);
    env.frame();
    assert.ok(env.draws() > 0, 'a visible frame must actually draw particles');
    document.hidden = true; env.events.get('visibilitychange')();
    assert.equal(env.frames.size, 0);
    document.hidden = false; env.events.get('visibilitychange')();
    assert.equal(env.frames.size, 1);
    env.intersect(false);
    assert.equal(env.frames.size, 0);
    env.intersect(true);
    env.render({ variant: 'confetti', paused: true });
    assert.equal(env.frames.size, 0, 'opening the form cancels animation');
    env.component.cleanup();
    assert.equal(env.events.size, 0);
  });
});

test('reduced motion does not schedule falling confetti', async () => {
  await environment(async env => { env.render({ variant: 'confetti' }); assert.equal(env.frames.size, 0); }, true);
});

test('confetti depth sends equal halves to front and back using one animation loop', async () => {
  await environment(async env => {
    env.render({ variant: 'confetti', splitDepth: true });
    assert.equal(env.canvases.length, 2);
    env.intersect(true);
    assert.equal(env.frames.size, 1);
    env.frame();
    assert.ok(env.canvases[0].draws() > 0);
    assert.equal(env.canvases[0].draws(), env.canvases[1].draws());
    assert.equal(env.frames.size, 1);
    env.render({ variant: 'confetti', splitDepth: true, paused: true });
    assert.equal(env.frames.size, 0);
  });
});
