import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/countdown.ts", import.meta.url),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const countdown = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("countdown returns month and precise remainder units", () => {
  const target =
    countdown.AVERAGE_MONTH_MS +
    2 * countdown.DAY_MS +
    3 * countdown.HOUR_MS +
    4 * countdown.MINUTE_MS +
    5 * 1000;

  assert.deepEqual(countdown.getTimeLeft(target, 0), {
    months: 1,
    days: 2,
    hours: 3,
    minutes: 4,
    seconds: 5,
    isPast: false,
  });
});

test("countdown clamps every value after the event", () => {
  assert.deepEqual(countdown.getTimeLeft(1000, 2000), {
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: true,
  });
});
