import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/v4/GalleryChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("V4 gallery is a borderless full-width section", () => {
  assert.match(source, /id="gallery"/);
  assert.match(source, /V4_GALLERY_PHOTO_IDS\.map/);
  assert.match(
    source,
    /const imageSizes =\s*index === 0\s*\? "\(max-width: 767px\) 100vw, 50vw"\s*: index === 3\s*\? "100vw"\s*: "50vw";/
  );
  assert.match(source, /sizes=\{imageSizes\}/);
  assert.doesNotMatch(source, /border-\[/);
  assert.doesNotMatch(source, /max-w-/);
});
