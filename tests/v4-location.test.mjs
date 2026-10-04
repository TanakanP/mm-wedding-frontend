import assert from 'node:assert/strict';
import test from 'node:test';
import { componentHarness, nodes } from './helpers/componentHarness.mjs';
import { WEDDING } from '../src/content/wedding.ts';
import { getLocationUrl } from '../src/lib/location.ts';

async function render() {
  const h = await componentHarness(new URL('../src/components/v4/LocationChapter.tsx', import.meta.url), {
    '@/content/wedding': { WEDDING }, '@/lib/location': { getLocationUrl },
    '@/hooks/useHydrationSafeReducedMotion': { useHydrationSafeReducedMotion: () => true },
    'qrcode.react': { QRCodeSVG: 'QR' },
  });
  return h.render();
}
test('location link and QR encode the same configured directions', async () => {
  const tree = await render();
  const link = nodes(tree, n => n.type === 'a')[0];
  const qr = nodes(tree, n => n.type === 'QR')[0];
  assert.equal(link.props.href, WEDDING.venue.mapUrl);
  assert.equal(qr.props.value, link.props.href);
  assert.equal(link.props.target, '_blank');
  assert.match(link.props.rel, /noopener/);
});
test('location loads the venue map eagerly with a descriptive title', async () => {
  const map = nodes(await render(), n => n.type === 'iframe')[0];
  assert.equal(map.props.src, WEDDING.venue.mapEmbedUrl);
  assert.equal(map.props.loading, 'eager');
  assert.match(map.props.title, /US Wedding/);
  assert.match(map.props.className, /w-full/);
});
test('location offers a calendar link only when configured', async () => {
  const links = nodes(await render(), n => n.type === 'a');
  assert.equal(links.length, WEDDING.venue.calendarUrl ? 3 : 2);
});
