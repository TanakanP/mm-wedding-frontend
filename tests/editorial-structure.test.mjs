import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("page renders the nine V4 chapters in approved order", async () => {
  const source = await readFile(
    new URL("../src/app/page.tsx", import.meta.url),
    "utf8"
  );
  const components = [
    "OpeningChapter",
    "FamilyChapter",
    "FramedPhotoChapter",
    "DressCodeChapter",
    "ScheduleChapter",
    "GalleryChapter",
    "LocationChapter",
    "FinalImageChapter",
    "RSVPChapter",
  ];
  const positions = components.map((name) => source.indexOf(`<${name}`));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(source, /<RSVPChapter>\s*<FAQSection \/>\s*<\/RSVPChapter>/s);
});

test("V4 schedule chapter exposes the complete itinerary", async () => {
  const source = await readFile(
    new URL("../src/components/v4/ScheduleChapter.tsx", import.meta.url),
    "utf8"
  ).catch(() => "");
  assert.match(source, /id="schedule"/);
  assert.match(source, /<GardenPath schedule=\{WEDDING\.schedule\}/);
});

test("essential schedule information is not hidden behind click state", async () => {
  const source = await readFile(
    new URL("../src/components/GardenPath.tsx", import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source, /useState|onClick|selectedIndex/);
  assert.match(source, /schedule\.map/);
});
