import assert from 'node:assert/strict';
import test from 'node:test';
import { layoutInvitationName } from '../src/lib/invitationNameLayout.ts';
const graphemes = text => [...new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text)].map(x => x.segment);
const measure = (text, size) => graphemes(text).reduce((sum, g) => sum + (g === ' ' ? 0.3 : 0.85) * size, 0);

for (const [name, thai] of [
  ['Pim', false], ['Pim and Family', false], ['คุณมิน และครอบครัว', true],
  ['Minnie คุณมิน', true], ['W'.repeat(100), false], ['กิ'.repeat(50), true],
  [('👩🏽‍❤️‍👨🏼').repeat(8), false], ['Longword '.repeat(10), false],
]) test(`export layout preserves and fits ${name.slice(0, 20)}`, () => {
  const layout = layoutInvitationName(name, thai, measure);
  assert.equal(layout.lines.join('').replace(/\s/gu, ''), name.replace(/\s/gu, ''));
  assert.ok(layout.fontSize >= 18);
  assert.ok(layout.lines.length * layout.lineHeight <= 178.68 + 0.001);
  for (const line of layout.lines) {
    assert.ok(measure(line, layout.fontSize) <= 654.72 + 0.001);
    assert.doesNotMatch(line, /^\p{Mark}/u);
  }
  assert.deepEqual(layout.lines.flatMap(graphemes).filter(g => !/^\s+$/u.test(g)), graphemes(name).filter(g => !/^\s+$/u.test(g)));
});

test('layout rechecks long words after a word boundary and shrinks to fit', () => {
  const name = 'Hi ' + 'W'.repeat(97);
  const layout = layoutInvitationName(name, false, (s, size) => graphemes(s).length * size * 2);
  assert.ok(layout.lines.every(line => graphemes(line).length * layout.fontSize * 2 <= 654.72));
  assert.equal(layout.lines.join('').replace(/\s/gu, ''), name.replace(/\s/gu, ''));
});

test('unrenderable names fail instead of producing clipped exports', () => {
  assert.throws(() => layoutInvitationName('AB', false, () => 10000), /fit/);
});
