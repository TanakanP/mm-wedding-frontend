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

test("invitation handoff shares the hero envelope viewport anchor", () => {
  const viewportAnchor = /top-\[43%\][^"\n]*md:top-\[54%\]/;

  assert.match(source, viewportAnchor);
  assert.match(introSource, viewportAnchor);
  assert.doesNotMatch(introSource, /y:\s*70/);
});

test("intro support copy clears the rising photograph", () => {
  assert.equal(
    introSource.match(/animate=\{\{ opacity: opening \? 0 : 1 \}\}/g)?.length,
    3
  );
});
