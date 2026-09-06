import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/components/InvitationIntro.tsx", import.meta.url),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    esModuleInterop: true,
    jsx: ts.JsxEmit.ReactJSX,
    module: ts.ModuleKind.CommonJS,
    target: ts.ScriptTarget.ES2022,
  },
});
const compiledModule = { exports: {} };
const require = (specifier) => {
  if (specifier === "framer-motion") {
    return {
      motion: new Proxy({}, { get: (_target, tag) => tag }),
      useReducedMotion: () => false,
    };
  }
  if (specifier === "next/image") return { __esModule: true, default: "img" };
  if (specifier === "react") {
    return { useEffect() {}, useRef: () => ({ current: null }), useState() {} };
  }
  if (specifier === "react/jsx-runtime") {
    return {
      Fragment: "Fragment",
      jsx: (type, props) => ({ type, props }),
      jsxs: (type, props) => ({ type, props }),
    };
  }
  if (specifier === "@/content/wedding") return { PHOTOS: {} };
  if (specifier === "@/lib/invitation") {
    return {
      INVITATION_REPLAY_EVENT: "invitation:replay",
    };
  }
  if (specifier === "@/lib/scroll") return { lockDocumentScroll: () => () => {} };
  if (specifier === "@/hooks/useHydrationSafeReducedMotion") {
    return { useHydrationSafeReducedMotion: () => false };
  }
  throw new Error(`Unexpected import: ${specifier}`);
};

new Function("require", "module", "exports", outputText)(
  require,
  compiledModule,
  compiledModule.exports
);

const containIntroFocus = compiledModule.exports.containIntroFocus;

function focusDouble() {
  return {
    focusCount: 0,
    getClientRects: () => [{}],
    focus() {
      this.focusCount += 1;
    },
  };
}

function tabEvent(shiftKey = false) {
  return {
    key: "Tab",
    shiftKey,
    defaultPrevented: false,
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
}

test("opening-stage Tab keeps focus on the dialog root", () => {
  const root = {
    ...focusDouble(),
    contains: () => false,
    querySelectorAll: () => [],
  };
  const event = tabEvent();

  containIntroFocus(event, root, null);

  assert.equal(event.defaultPrevented, true);
  assert.equal(root.focusCount, 1);
});

test("sealed-stage Tab and Shift+Tab wrap around the seal", () => {
  const seal = focusDouble();
  const root = {
    ...focusDouble(),
    contains: (element) => element === seal,
    querySelectorAll: () => [seal],
  };

  const forward = tabEvent();
  containIntroFocus(forward, root, seal);
  const backward = tabEvent(true);
  containIntroFocus(backward, root, seal);

  assert.equal(forward.defaultPrevented, true);
  assert.equal(backward.defaultPrevented, true);
  assert.equal(seal.focusCount, 2);
});

test("intro source moves focus by stage and installs a Tab boundary", () => {
  assert.match(source, /const dialogRef = useRef<HTMLDivElement>\(null\)/);
  assert.match(source, /stage === "sealed"[\s\S]*openButtonRef\.current\?\.focus/);
  assert.match(source, /stage === "opening"[\s\S]*dialogRef\.current\?\.focus/);
  assert.match(source, /document\.addEventListener\("keydown", handleKeyDown\)/);
  assert.match(source, /containIntroFocus\(event, dialogRef\.current\)/);
  assert.match(source, /ref=\{dialogRef\}[\s\S]*tabIndex=\{-1\}/);
  assert.doesNotMatch(
    source,
    /document\s*\.getElementById\("wedding-title"\)\s*\?\.focus/
  );
  assert.match(source, /reduceMotion \? 160 : 2420/);
});
