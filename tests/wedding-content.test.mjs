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

test("V4 exposes exactly nine editable sections in the approved order", () => {
  assert.deepEqual(content.V4_SECTION_IDS, [
    "hero",
    "families",
    "framed-photo",
    "dress-code",
    "schedule",
    "gallery",
    "venue",
    "final-image",
    "rsvp",
  ]);
  assert.equal(new Set(content.V4_SECTION_IDS).size, 9);
});

test("navigation links to the approved V4 chapters", () => {
  assert.deepEqual(
    content.NAV_ITEMS.map((item) => item.id),
    ["families", "schedule", "gallery", "venue", "garden-whispers"]
  );
});

test("V4 assigns every primary photograph once", () => {
  assert.deepEqual(content.EDITORIAL_PHOTO_IDS, [6, 1, 7, 2, 8, 3, 5, 4, 10, 9]);
  assert.equal(new Set(content.EDITORIAL_PHOTO_IDS).size, 10);
  assert.deepEqual(content.V4_GALLERY_PHOTO_IDS, [8, 3, 5, 4]);
  assert.equal(Object.keys(content.PHOTOS).length, 10);
  for (const photo of Object.values(content.PHOTOS)) {
    assert.match(photo.src, /^\/photos\/display\/\d+\.jpeg$/);
    assert.ok(photo.alt.length >= 12);
  }
});

test("song and dress-code content have stable fallbacks", () => {
  assert.deepEqual(content.WEDDING.song, {
    title: "Our song",
    audioUrl: null,
  });
  assert.deepEqual(
    content.WEDDING.dressCode.colors.map((color) => color.value),
    ["#68414B", "#756078", "#A9707C", "#C7929B", "#BDA56E"]
  );
});
