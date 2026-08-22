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
