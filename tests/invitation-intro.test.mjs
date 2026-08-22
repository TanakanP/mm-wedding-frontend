import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/invitation.ts", import.meta.url),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const invitation = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("first-time visitors see the invitation intro", () => {
  assert.equal(invitation.shouldShowInvitation(null), true);
});

test("returning visitors skip the invitation intro", () => {
  assert.equal(invitation.shouldShowInvitation("opened"), false);
});

test("unknown stored values do not suppress the invitation", () => {
  assert.equal(invitation.shouldShowInvitation("legacy"), true);
});
