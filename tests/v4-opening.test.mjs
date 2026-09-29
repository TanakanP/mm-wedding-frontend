import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/v4/OpeningChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");
const introSource = await readFile(
  new URL("../src/components/InvitationIntro.tsx", import.meta.url),
  "utf8"
);

test("V4 opening combines envelope, countdown, and vinyl in section one", () => {
  assert.match(source, /id="hero"/);
  assert.match(source, /Countdown/);
  assert.match(source, /audioUrl/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /Our song coming soon/);
  assert.doesNotMatch(source, /cassette/i);
});

test("opened envelope rests 25 percent above the viewport bottom", () => {
  assert.match(source, /bottom-\[25%\]/);
  assert.match(introSource, /top-\[43svh\]/);
  assert.match(introSource, /y: opening \? "var\(--opened-envelope-offset\)" : 0/);
  assert.match(introSource, /\[--opened-envelope-offset:calc\(32svh-100%\)\]/);
  assert.match(introSource, /md:\[--opened-envelope-offset:calc\(28svh-100%\)\]/);
  assert.doesNotMatch(source, /opened-envelope-offset/);
});

test("intro support copy clears the rising photograph", () => {
  assert.equal(
    introSource.match(/animate=\{\{ opacity: opening \? 0 : 1 \}\}/g)?.length,
    3
  );
});
