import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/v4/LocationChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("location uses the same resolved URL for link and QR", () => {
  assert.match(source, /id="venue"/);
  assert.match(source, /const locationUrl = getLocationUrl/);
  assert.match(source, /href=\{locationUrl\}/);
  assert.match(source, /<QRCodeSVG/);
  assert.match(source, /value=\{locationUrl\}/);
});

test("location waits for enough width before splitting its printed furniture", () => {
  assert.match(source, /lg:grid-cols-\[minmax\(0,1\.05fr\)_minmax\(0,\.95fr\)\]/);
  assert.match(source, /xl:grid-cols-\[minmax\(0,1fr\)_176px\]/);
  assert.match(source, /lg:min-h-\[34rem\] xl:min-h-\[42rem\]/);
  assert.doesNotMatch(source, /md:grid-cols-\[minmax\(0,1\.05fr\)/);
  assert.doesNotMatch(source, /sm:grid-cols-\[minmax\(0,1fr\)_176px\]/);
});

test("location advertises image widths for each responsive layout", () => {
  assert.match(
    source,
    /sizes="\(max-width: 767px\) calc\(100vw - 64px\), \(max-width: 1023px\) calc\(86vw - 32px\), \(max-width: 1439px\) 39vw, 585px"/
  );
});

test("location keeps small invitation text at readable wine contrast", () => {
  assert.doesNotMatch(source, /text-wine\/(?:75|85)/);
  assert.doesNotMatch(source, /hover:text-accent-secondary/);
  assert.match(source, /hover:text-foreground/);
});
