import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("event journey exposes meaningful sections in narrative order", async () => {
  const source = await readFile(
    new URL("../src/components/EventDetails.tsx", import.meta.url),
    "utf8"
  );
  const ids = ["schedule", "venue", "rsvp"];
  const positions = ids.map((id) => source.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.ok(positions[0] < positions[1] && positions[1] < positions[2]);
  assert.doesNotMatch(source, /100dvh|h-dvh|sticky\s+top-0/);
});

test("essential schedule information is not hidden behind click state", async () => {
  const source = await readFile(
    new URL("../src/components/GardenPath.tsx", import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source, /useState|onClick|selectedIndex/);
  assert.match(source, /schedule\.map/);
});
