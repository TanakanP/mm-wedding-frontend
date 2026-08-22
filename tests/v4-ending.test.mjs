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
const faq = await readFile(
  new URL("../src/components/FAQSection.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("V4 ends with a cinematic image and one RSVP section", () => {
  assert.match(finalImage, /id="final-image"/);
  assert.match(finalImage, /PHOTOS\[9\]/);
  assert.match(rsvp, /id="rsvp"/);
  assert.match(rsvp, /RSVPForm/);
  assert.match(rsvp, /children/);
});

test("V4 RSVP action uses high-contrast invitation colors", () => {
  assert.match(
    rsvp,
    /className="[^"]*bg-wine[^"]*text-cream[^"]*"[^>]*>\s*Open response card/s
  );
});

test("V4 FAQ small copy and footer controls use readable wine ink", () => {
  assert.match(
    faq,
    /className="[^"]*text-sm[^"]*text-wine"[^>]*>\s*A few gentle answers/s
  );
  assert.match(
    faq,
    /className="[^"]*text-xs text-wine"[^>]*>[\s\S]*?Back to the top/
  );
  assert.match(
    faq,
    /className="text-wine"[^>]*>\s*Wander the garden above/s
  );
  assert.match(
    faq,
    /className="[^"]*text-\[10px\] text-wine"[^>]*>\s*©/s
  );
});
