import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/reducedMotion.ts", import.meta.url),
  "utf8"
).catch(() => "");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const reducedMotion = source
  ? await import(
      `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
    )
  : {};

test("reduced motion stays false until the client has mounted", () => {
  assert.equal(reducedMotion.resolveReducedMotion(false, null), false);
  assert.equal(reducedMotion.resolveReducedMotion(false, false), false);
  assert.equal(reducedMotion.resolveReducedMotion(false, true), false);
  assert.equal(reducedMotion.resolveReducedMotion(true, null), false);
  assert.equal(reducedMotion.resolveReducedMotion(true, false), false);
  assert.equal(reducedMotion.resolveReducedMotion(true, true), true);
});

async function collectSourceFiles(directory, files = []) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await collectSourceFiles(entryPath, files);
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(entryPath);
    }
  }
  return files;
}

test("interactive components defer reduced motion until after hydration", async () => {
  const root = new URL("../src", import.meta.url);
  const files = await collectSourceFiles(root.pathname);
  const offenders = [];

  for (const file of files) {
    const contents = await readFile(file, "utf8");
    if (/Boolean\(\s*useReducedMotion\(\s*\)\s*\)/.test(contents)) {
      offenders.push(path.relative(root.pathname, file));
    }
  }

  assert.deepEqual(offenders, []);
  const hook = await readFile(
    new URL("../src/hooks/useHydrationSafeReducedMotion.ts", import.meta.url),
    "utf8"
  );
  assert.match(hook, /export function useHydrationSafeReducedMotion/);
  assert.match(hook, /resolveReducedMotion\(mounted, prefersReduced\)/);
});
