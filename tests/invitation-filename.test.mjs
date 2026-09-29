import assert from "node:assert/strict";
import test from "node:test";
import { getInvitationFilename } from "../src/lib/invitationFilename.ts";

for (const [name, filename] of [
  ["Pim & Family", "Pim & Family-Mimeen-Wedding-Invitation.png"],
  ["คุณมิน และครอบครัว", "คุณมิน และครอบครัว-Mimeen-Wedding-Invitation.png"],
  ["  Pim   Family  ", "Pim Family-Mimeen-Wedding-Invitation.png"],
  ["A/B:C", "A-B-C-Mimeen-Wedding-Invitation.png"],
  ["  ", "Guest-Mimeen-Wedding-Invitation.png"],
  ["../", "Guest-Mimeen-Wedding-Invitation.png"],
]) {
  test(`safe invitation filename for ${JSON.stringify(name)}`, () => {
    assert.equal(getInvitationFilename(name), filename);
  });
}
