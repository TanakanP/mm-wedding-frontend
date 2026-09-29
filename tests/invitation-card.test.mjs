import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import test from "node:test";
import vm from "node:vm";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ts from "typescript";

const require = createRequire(import.meta.url);
const { WEDDING } = await import("../src/content/wedding.ts");

async function loadComponent(path, dependencies = {}) {
  const source = await readFile(new URL(path, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX,
    target: ts.ScriptTarget.ES2022, esModuleInterop: true,
  } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require: (id) => {
    if (id.endsWith(".module.css")) return { __esModule: true, default: new Proxy({}, { get: (_, key) => String(key) }) };
    if (id === "@/content/wedding") return { WEDDING };
    if (id in dependencies) return dependencies[id];
    return require(id);
  } });
  return exports.default;
}

test("personalized card uses original generated artwork and a live guest inscription", async () => {
  const InvitationCard = await loadComponent("../src/components/rsvp/InvitationCard.tsx");
  const html = renderToStaticMarkup(React.createElement(InvitationCard, { guestName: "คุณมิน และครอบครัว" }));
  assert.match(html, /คุณมิน และครอบครัว/);
  assert.match(html, /Natthida/);
  assert.match(html, /Tanakan/);
  assert.match(html, /5 December 2026/);
  assert.match(html, /romantic-keepsake-thank-you\.png/);
  assert.match(html, /We can’t wait to celebrate with you/);
  assert.doesNotMatch(html, /evening-front\.jpg|Dinner|Photography|US Wedding/);
});

test("accepted result contains one top toolbar and no obsolete actions", async () => {
  const InvitationCard = await loadComponent("../src/components/rsvp/InvitationCard.tsx");
  const AcceptedResult = await loadComponent("../src/components/rsvp/AcceptedResult.tsx", {
    "./InvitationCard": { __esModule: true, default: InvitationCard },
    "@/lib/invitationExport": { renderInvitationPng: async () => new Blob() },
    "@/lib/invitationFilename": { getInvitationFilename: (name) => `${name}-Mimeen-Wedding-Invitation.png` },
    "@/components/PlantWishWall": { __esModule: true, default: () => React.createElement("div", null, "Plant Your Wish Wall") },
  });
  const html = renderToStaticMarkup(React.createElement(AcceptedResult, { data: { name: "Tes", attending: "yes" }, onClose: () => {} }));
  assert.match(html, /Tes/);
  assert.match(html, /Preparing invitation/);
  assert.match(html, /Preparing your invitation/);
  assert.match(html, /Close RSVP dialog/);
  assert.doesNotMatch(html, /Save Picture|On iPhone/);
  assert.doesNotMatch(html, /Plant Your Wish Wall/);
});
