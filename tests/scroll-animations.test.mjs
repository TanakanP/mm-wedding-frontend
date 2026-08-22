import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

let animations = {};

try {
  const source = await readFile(
    new URL("../src/lib/scrollAnimations.ts", import.meta.url),
    "utf8"
  );
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2022,
    },
  });
  animations = await import(
    `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
  );
} catch {
  // The first TDD run intentionally reaches this branch before implementation.
}

test("scroll progress maps across multiple stops and clamps at both ends", () => {
  assert.equal(typeof animations.mapScrollProgress, "function");
  assert.equal(animations.mapScrollProgress(-1, [0, 0.5, 1], [1, 0.8, 0]), 1);
  assert.equal(
    animations.mapScrollProgress(0.75, [0, 0.5, 1], [1, 0.8, 0]),
    0.4
  );
  assert.equal(animations.mapScrollProgress(2, [0, 0.5, 1], [1, 0.8, 0]), 0);
});

test("normal section progress clamps across one section height", () => {
  assert.equal(animations.getSectionScrollProgress(0, 900), 0);
  assert.equal(animations.getSectionScrollProgress(-450, 900), 0.5);
  assert.equal(animations.getSectionScrollProgress(-900, 900), 1);
});

test("pinned story helpers no longer exist", () => {
  assert.equal(animations.getViewportEntryProgress, undefined);
  assert.equal(animations.getStoryContentProgress, undefined);
  assert.equal(animations.getOurStorySectionHeightVh, undefined);
  assert.equal(animations.getPhotoRevealWindow, undefined);
});
