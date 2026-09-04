import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const [wishWall, rsvpForm, countdown] = await Promise.all([
  readFile(
    new URL("../src/components/PlantWishWall.tsx", import.meta.url),
    "utf8"
  ),
  readFile(new URL("../src/components/RSVPForm.tsx", import.meta.url), "utf8"),
  readFile(
    new URL("../src/components/hero/Countdown.tsx", import.meta.url),
    "utf8"
  ),
]);

const rgb = (hex) =>
  [1, 3, 5].map((offset) => Number.parseInt(hex.slice(offset, offset + 2), 16));
const luminance = (hex) =>
  rgb(hex)
    .map((channel) => channel / 255)
    .map((channel) =>
      channel <= 0.04045
        ? channel / 12.92
        : ((channel + 0.055) / 1.055) ** 2.4
    )
    .reduce(
      (total, channel, index) =>
        total + channel * [0.2126, 0.7152, 0.0722][index],
      0
    );
const contrast = (foreground, background) => {
  const [lighter, darker] = [luminance(foreground), luminance(background)].sort(
    (a, b) => b - a
  );
  return (lighter + 0.05) / (darker + 0.05);
};

test("wish-wall headings and normal copy use compliant solid ink", () => {
  assert.doesNotMatch(wishWall, /text-accent-primary/);
  assert.doesNotMatch(wishWall, /text-(?:sage|violet)\/(?:60|70)/);
  assert.match(wishWall, /text-xl text-wine/);
  assert.match(wishWall, /text-xs text-violet/);
  assert.match(wishWall, /font-medium text-wine/);
  assert.match(wishWall, /text-\[10px\] text-violet/);
  assert.ok(contrast("#68414b", "#fffaf3") >= 4.5);
  assert.ok(contrast("#756078", "#fffaf3") >= 4.5);
});

test("RSVP success headings use wine ink on cream", () => {
  assert.doesNotMatch(rsvpForm, /<h[34][^>]*text-accent-primary/);
  assert.match(rsvpForm, /text-3xl text-wine[^>]*>M &amp; M/);
  assert.match(rsvpForm, /text-2xl text-wine[^>]*>Thank You/);
  assert.ok(contrast("#68414b", "#fffaf3") >= 4.5);
});

test("the small past-event countdown message clears wine at normal-text contrast", () => {
  assert.doesNotMatch(
    countdown,
    /text-\[10px\][^"\n]*text-accent-primary/
  );
  assert.match(countdown, /text-\[10px\][^"\n]*text-petal/);
  assert.ok(contrast("#eed4d8", "#68414b") >= 4.5);
});
