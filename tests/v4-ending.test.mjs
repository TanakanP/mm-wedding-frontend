import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const finalImage = await readFile(
  new URL("../src/components/v4/FinalImageChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");
const rsvp = await readFile(
  new URL("../src/components/v4/RSVPChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("V4 ends with a cinematic image and one RSVP section", () => {
  assert.match(finalImage, /id="final-image"/);
  assert.match(finalImage, /PHOTOS\[9\]/);
  assert.match(rsvp, /id="rsvp"/);
  assert.match(rsvp, /RSVPForm/);
  assert.match(rsvp, /children/);
});
