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
