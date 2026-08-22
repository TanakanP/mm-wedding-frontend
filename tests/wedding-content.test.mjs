import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/content/wedding.ts", import.meta.url),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const content = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("editorial photo plan uses every photo exactly once", () => {
  assert.deepEqual(content.EDITORIAL_PHOTO_IDS, [6, 7, 1, 2, 3, 4, 10, 5, 8, 9]);
  assert.equal(new Set(content.EDITORIAL_PHOTO_IDS).size, 10);
  assert.equal(Object.keys(content.PHOTOS).length, 10);
  for (const photo of Object.values(content.PHOTOS)) {
    assert.match(photo.src, /^\/photos\/display\/\d+\.jpeg$/);
    assert.ok(photo.alt.length >= 12);
  }
});

test("navigation observes every meaningful editorial chapter", () => {
  assert.deepEqual(content.SECTION_IDS, [
    "hero",
    "countdown",
    "our-story",
    "schedule",
    "venue",
    "rsvp",
    "garden-whispers",
  ]);
  assert.deepEqual(
    content.NAV_ITEMS.map((item) => item.id),
    ["our-story", "schedule", "venue", "garden-whispers"]
  );
});
