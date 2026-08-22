import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/location.ts", import.meta.url),
  "utf8"
).catch(() => "");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const location = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("explicit map URL wins", () => {
  assert.equal(
    location.getLocationUrl("https://maps.example/wedding", "456 Celebration Lane"),
    "https://maps.example/wedding"
  );
});

test("missing map URL becomes a Google Maps address search", () => {
  assert.equal(
    location.getLocationUrl(null, "456 Celebration Lane, New York, NY"),
    "https://www.google.com/maps/search/?api=1&query=456%20Celebration%20Lane%2C%20New%20York%2C%20NY"
  );
});
