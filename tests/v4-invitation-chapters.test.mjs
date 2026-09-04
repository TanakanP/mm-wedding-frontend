import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (name) =>
  readFile(new URL(`../src/components/v4/${name}.tsx`, import.meta.url), "utf8").catch(() => "");

test("sections two through four remain separately editable", async () => {
  const [family, frame, dress] = await Promise.all([
    read("FamilyChapter"),
    read("FramedPhotoChapter"),
    read("DressCodeChapter"),
  ]);
  assert.match(family, /id="families"/);
  assert.match(frame, /id="framed-photo"/);
  assert.match(dress, /id="dress-code"/);
  assert.match(dress, /dressCode\.colors\.map/);
});

test("supporting invitation copy uses solid wine for readable contrast", async () => {
  const [family, dress] = await Promise.all([
    read("FamilyChapter"),
    read("DressCodeChapter"),
  ]);

  assert.doesNotMatch(family, /text-wine\/\d+/);
  assert.doesNotMatch(dress, /text-wine\/\d+/);
});

test("the scalloped memory keeps the approved dominant portrait crop", async () => {
  const frame = await read("FramedPhotoChapter");
  const rotations = [...frame.matchAll(/\brotate:\s*(-?\d+(?:\.\d+)?)/g)].map(
    ([, value]) => Number(value)
  );

  assert.match(frame, /aspect-\[4\/5\]/);
  assert.doesNotMatch(frame, /aspect-\[3\/2\]/);
  assert.match(frame, /w-\[min\(88vw,600px\)\] sm:w-\[min\(82vw,600px\)\]/);
  assert.match(
    frame,
    /sizes="\(max-width: 639px\) calc\(88vw - 24px\), \(max-width: 731px\) calc\(82vw - 32px\), \(max-width: 767px\) 568px, 560px"/
  );
  assert.ok(rotations.length >= 2);
  assert.ok(rotations.every((rotation) => Math.abs(rotation) <= 2));
});
