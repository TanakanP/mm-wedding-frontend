import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/InvitationIntro.tsx", import.meta.url),
  "utf8"
);

test("invitation starts sealed on every visit without browser storage", () => {
  assert.match(source, /setStage\("sealed"\)/);
  assert.doesNotMatch(source, /localStorage|shouldShowInvitation|INVITATION_STORAGE_KEY/);
});
