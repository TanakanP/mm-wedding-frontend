import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { componentHarness, nodes } from "./helpers/componentHarness.mjs";

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
  const timeLeft = countdown.getTimeLeft(1000, 2000);

  assert.deepEqual(timeLeft, {
    months: 0,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isPast: true,
  });
  assert.equal(countdown.shouldContinueCountdown(timeLeft), false);
});

test("countdown continues ticking before the event", () => {
  const timeLeft = countdown.getTimeLeft(2000, 1000);

  assert.equal(countdown.shouldContinueCountdown(timeLeft), true);
});

const componentPath = new URL("../src/components/hero/Countdown.tsx", import.meta.url);
const targetMs = Date.parse("2026-12-05T10:00:00Z");
const props = { targetDateIso: new Date(targetMs).toISOString() };
const digits = (tree) => nodes(tree, (node) =>
  node.props?.className?.includes("tabular-nums")
).map((node) => node.props.children);

async function mountCountdown(t, now) {
  t.mock.timers.enable({ apis: ["Date"], now });
  const intervals = new Map();
  let nextId = 0;
  const windowTarget = new EventTarget();
  windowTarget.setInterval = (callback) => {
    intervals.set(++nextId, callback);
    return nextId;
  };
  windowTarget.clearInterval = (id) => intervals.delete(id);
  const documentTarget = new EventTarget();
  documentTarget.visibilityState = "visible";
  const oldWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const oldDocument = Object.getOwnPropertyDescriptor(globalThis, "document");
  Object.defineProperty(globalThis, "window", { configurable: true, value: windowTarget });
  Object.defineProperty(globalThis, "document", { configurable: true, value: documentTarget });
  const harness = await componentHarness(componentPath, { "@/lib/countdown": countdown });
  t.after(() => {
    harness.cleanup();
    for (const [key, descriptor] of [["window", oldWindow], ["document", oldDocument]]) {
      if (descriptor) Object.defineProperty(globalThis, key, descriptor);
      else delete globalThis[key];
    }
  });
  return { harness, intervals, windowTarget, documentTarget };
}

test("initial countdown markup is identical at build and hydration time", async (t) => {
  const { harness } = await mountCountdown(t, targetMs - 2 * countdown.DAY_MS);
  const serverTree = harness.render(props);
  t.mock.timers.setTime(targetMs - 4 * countdown.MINUTE_MS);
  const client = await componentHarness(componentPath, { "@/lib/countdown": countdown });
  const clientTree = client.render(props);
  assert.deepEqual(digits(serverTree), ["—", "—", "—", "—", "—"]);
  assert.deepEqual(clientTree, serverTree);
  assert.equal(nodes(clientTree, (node) => node.props?.suppressHydrationWarning).length, 0);
  harness.flushEffects();
  assert.deepEqual(digits(harness.render(props)), [0, 0, 0, 4, 0]);
});

test("mounted countdown ticks through four minutes to expiry and clears its interval", async (t) => {
  const { harness, intervals } = await mountCountdown(t, targetMs - 300_000);
  harness.render(props);
  harness.flushEffects();
  for (let remaining = 300; remaining > 0; remaining--) {
    t.mock.timers.setTime(targetMs - remaining * 1000);
    for (const tick of intervals.values()) tick();
    assert.deepEqual(digits(harness.render(props)), [0, 0, 0, Math.floor(remaining / 60), remaining % 60]);
    assert.equal(intervals.size, 1);
  }
  t.mock.timers.setTime(targetMs);
  for (const tick of intervals.values()) tick();
  assert.match(harness.render(props).props.children, /THE NEW CHAPTER BEGINS/);
  assert.equal(intervals.size, 0);
});

test("countdown refreshes on visibility and page restoration and cleans up", async (t) => {
  const { harness, intervals, windowTarget, documentTarget } = await mountCountdown(t, targetMs - 300_000);
  harness.render(props);
  harness.flushEffects();
  t.mock.timers.setTime(targetMs - 179_000);
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  assert.deepEqual(digits(harness.render(props)), [0, 0, 0, 2, 59]);
  t.mock.timers.setTime(targetMs - 119_000);
  windowTarget.dispatchEvent(new Event("pageshow"));
  assert.deepEqual(digits(harness.render(props)), [0, 0, 0, 1, 59]);
  harness.cleanup();
  assert.equal(intervals.size, 0);
  t.mock.timers.setTime(targetMs);
  documentTarget.dispatchEvent(new Event("visibilitychange"));
  windowTarget.dispatchEvent(new Event("pageshow"));
  assert.deepEqual(digits(harness.render(props)), [0, 0, 0, 1, 59]);
});
