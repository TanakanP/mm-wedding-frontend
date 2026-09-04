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

test("garden navigation keeps small interactive text high contrast", async () => {
  const source = await readFile(
    new URL("../src/components/GardenNav.tsx", import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(
    source,
    /hover:text-accent-secondary|text-wine\/70|hover:bg-dusty hover:text-wine/
  );
  assert.match(source, /text-wine transition-colors hover:text-foreground/);
  assert.match(source, /text-wine hover:bg-petal hover:text-foreground/);
  assert.match(source, /hover:bg-foreground hover:text-cream/);
  assert.doesNotMatch(
    source,
    /focus-visible:ring-(?:wine|dusty)\/\d+/
  );
  assert.equal(source.match(/focus-visible:ring-wine/g)?.length, 5);
  assert.match(source, /const reduceMotion = useHydrationSafeReducedMotion\(\)/);
  assert.match(source, /duration: reduceMotion \? 0 : 0\.2/);
  assert.match(source, /whileHover=\{reduceMotion \? undefined/);
  assert.match(source, /whileTap=\{reduceMotion \? undefined/);
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
