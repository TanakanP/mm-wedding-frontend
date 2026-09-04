import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const envelope = await readFile(
  new URL("../src/components/InvitationEnvelope.tsx", import.meta.url),
  "utf8"
).catch(() => "");
const opening = await readFile(
  new URL("../src/components/v4/OpeningChapter.tsx", import.meta.url),
  "utf8"
);
const intro = await readFile(
  new URL("../src/components/InvitationIntro.tsx", import.meta.url),
  "utf8"
);

test("the flap is two-sided paper with a petal lining", () => {
  assert.match(envelope, /origin-top \[transform-style:preserve-3d\]/);
  assert.match(
    envelope,
    /bg-paper \[clip-path:polygon\(0_0,100%_0,50%_100%\)\] \[backface-visibility:hidden\]/
  );
  assert.match(
    envelope,
    /bg-petal \[clip-path:polygon\(0_0,100%_0,50%_100%\)\] \[transform:rotateX\(180deg\)\] \[backface-visibility:hidden\]/
  );
  assert.match(envelope, /rotateX: open \? 178 : 0/);
  assert.doesNotMatch(envelope, /scaleY:/);
  assert.doesNotMatch(envelope, /style=\{\{[\s\S]*backfaceVisibility:\s*"hidden"/);
  assert.match(
    envelope,
    /h-\[46vw\] min-h-56 max-h-\[335px\] w-\[min\(88vw,610px\)\] \[perspective:1200px\]/
  );
});

test("the photograph stays inside the original envelope pocket", () => {
  assert.match(envelope, /z-\[2\] h-\[82%\] rotate-\[1\.5deg\]/);
  assert.doesNotMatch(envelope, /z-\[6\]/);
  assert.match(
    envelope,
    /z-\[3\] bg-petal \[clip-path:polygon\(0_12%,50%_60%,100%_12%,100%_100%,0_100%\)\]/
  );
});

test("the open flap sits behind the envelope", () => {
  assert.match(envelope, /open \? "z-0" : "z-\[4\]"/);
});

test("reduced motion skips the flip and still shows the lining", () => {
  assert.match(envelope, /duration: reduceMotion \? 0 : 0\.72/);
  assert.match(envelope, /duration: reduceMotion \? 0 : 1\.05/);
  assert.match(envelope, /duration: reduceMotion \? 0 : 0\.35/);
});

test("intro and hero render the shared envelope at the handoff anchor", () => {
  const viewportAnchor = /top-\[43%\][^"\n]*md:top-\[54%\]/;

  assert.match(envelope, /InvitationEnvelope/);
  assert.match(opening, /<InvitationEnvelope/);
  assert.match(intro, /<InvitationEnvelope/);
  assert.match(opening, /<InvitationEnvelope[\s\S]*?\bopen\b/);
  assert.match(opening, /seal="decorative"/);
  assert.match(intro, /open=\{opening\}/);
  assert.match(intro, /seal="button"/);
  assert.match(opening, viewportAnchor);
  assert.match(intro, viewportAnchor);
  assert.doesNotMatch(opening, /backfaceVisibility:\s*"hidden"/);
  assert.doesNotMatch(intro, /backfaceVisibility:\s*"hidden"/);
});
