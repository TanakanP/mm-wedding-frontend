import assert from 'node:assert/strict';
import test from 'node:test';
import { componentHarness, nodes } from './helpers/componentHarness.mjs';
const settle = () => new Promise(resolve => setImmediate(resolve));

async function setup(play) {
  const saved = { document: globalThis.document, window: globalThis.window, IntersectionObserver: globalThis.IntersectionObserver, HTMLMediaElement: globalThis.HTMLMediaElement };
  const events = new Map(); let intersect;
  globalThis.document = { visibilityState: 'visible', addEventListener: (key, fn) => events.set(key, fn), removeEventListener: key => events.delete(key) };
  globalThis.window = { addEventListener: (key, fn) => events.set(key, fn), removeEventListener: key => events.delete(key) };
  globalThis.HTMLMediaElement = { HAVE_NOTHING: 0 };
  globalThis.IntersectionObserver = class { constructor(fn) { intersect = fn; } observe() {} disconnect() {} };
  const h = await componentHarness(new URL('../src/components/v4/RetroVideoPlayer.tsx', import.meta.url));
  const video = { readyState: 1, error: null, loads: 0, calls: 0, load() { this.loads++; }, play() { this.calls++; return play(); } };
  let tree = h.render();
  nodes(tree, n => n.type === 'figure')[0].props.ref.current = {};
  nodes(tree, n => n.type === 'video')[0].props.ref.current = video;
  h.flushEffects(); intersect([{ isIntersecting: true }]); h.render(); h.flushEffects();
  await settle();
  return { h, video, events, render: () => h.render(), cleanup() { h.cleanup(); for (const [key, value] of Object.entries(saved)) { if (value === undefined) delete globalThis[key]; else globalThis[key] = value; } } };
}

test('autoplay and repeated manual rejection keep poster, retry, and accessible status', async () => {
  const s = await setup(() => Promise.reject(new Error('blocked')));
  try {
    const button = nodes(s.render(), n => n.type === 'button')[0];
    assert.ok(button);
    button.props.onClick(); await settle();
    assert.ok(nodes(s.render(), n => n.type === 'button').length);
    assert.ok(nodes(s.render(), n => n.props?.role === 'status').length);
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-0/);
  } finally { s.cleanup(); }
});

test('successful retry reloads media errors and reveals the film', async () => {
  let blocked = true;
  const s = await setup(() => blocked ? Promise.reject(new Error('blocked')) : Promise.resolve());
  try {
    s.video.error = { code: 3 };
    const video = nodes(s.render(), n => n.type === 'video')[0];
    assert.equal(typeof video.props.onError, 'function');
    video.props.onError(); blocked = false;
    nodes(s.render(), n => n.type === 'button')[0].props.onClick(); await settle();
    assert.equal(s.video.loads, 1);
    assert.equal(nodes(s.render(), n => n.type === 'button').length, 0);
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-100/);
  } finally { s.cleanup(); }
});

test('duplicate play attempts and late completion after unmount are ignored', async () => {
  let complete;
  const s = await setup(() => new Promise(resolve => { complete = resolve; }));
  try {
    s.events.get('pageshow')(); s.events.get('pageshow')();
    assert.equal(s.video.calls, 1);
    s.h.cleanup(); complete(); await settle();
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-0/);
  } finally { s.cleanup(); }
});

test('a stalled download does not hide buffered playback, but waiting does', async () => {
  const s = await setup(() => Promise.resolve());
  try {
    s.video.readyState = 4;
    const video = nodes(s.render(), n => n.type === 'video')[0];
    video.props.onStalled?.();
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-100/);
    video.props.onWaiting();
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-0/);
  } finally { s.cleanup(); }
});

test('hidden-page completion stays behind the poster and restoration retries playback', async () => {
  const completions = [];
  const s = await setup(() => new Promise(resolve => completions.push(resolve)));
  try {
    globalThis.document.visibilityState = 'hidden';
    s.events.get('visibilitychange')();
    completions[0](); await settle();
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-0/);
    s.events.get('pageshow')();
    assert.equal(s.video.calls, 1, 'do not restart while still hidden');
    globalThis.document.visibilityState = 'visible';
    s.events.get('visibilitychange')();
    assert.equal(s.video.calls, 2);
    completions[1](); await settle();
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-100/);
    s.events.get('pagehide')();
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-0/);
    s.events.get('pageshow')();
    completions[2](); await settle();
    assert.match(nodes(s.render(), n => n.type === 'video')[0].props.className, /opacity-100/);
  } finally { s.cleanup(); }
});
