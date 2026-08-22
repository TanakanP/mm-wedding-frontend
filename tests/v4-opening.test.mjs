import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/v4/OpeningChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("V4 opening combines envelope, countdown, and vinyl in section one", () => {
  assert.match(source, /id="hero"/);
  assert.match(source, /Countdown/);
  assert.match(source, /audioUrl/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /Our song coming soon/);
  assert.doesNotMatch(source, /cassette/i);
});
