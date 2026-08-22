import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { afterEach } from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/scroll.ts", import.meta.url),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const scrolling = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

afterEach(() => {
  delete globalThis.document;
  delete globalThis.window;
});

function installBrowser({
  reducedMotion = false,
  rootOverflow = "",
  bodyOverflow = "",
} = {}) {
  let sectionOptions;
  let windowOptions;
  const mediaQueries = [];

  const section = {
    scrollIntoView(options) {
      sectionOptions = options;
    },
  };

  globalThis.document = {
    documentElement: { style: { overflow: rootOverflow } },
    body: { style: { overflow: bodyOverflow } },
    getElementById(id) {
      return id === "our-story" || id === "rsvp" ? section : null;
    },
  };

  globalThis.window = {
    matchMedia(query) {
      mediaQueries.push(query);
      return { matches: reducedMotion };
    },
    scrollTo(options) {
      windowOptions = options;
    },
  };

  return {
    getMediaQueries: () => mediaQueries,
    getSectionOptions: () => sectionOptions,
    getWindowOptions: () => windowOptions,
  };
}

test("section navigation scrolls the target into view smoothly", () => {
  const browser = installBrowser();

  scrolling.scrollToSection("our-story");

  assert.deepEqual(browser.getSectionOptions(), {
    behavior: "smooth",
    block: "start",
  });
  assert.deepEqual(browser.getMediaQueries(), [
    "(prefers-reduced-motion: reduce)",
  ]);
});

test("section navigation is immediate when reduced motion is requested", () => {
  const browser = installBrowser({ reducedMotion: true });

  scrolling.scrollToSection("our-story");

  assert.deepEqual(browser.getSectionOptions(), {
    behavior: "auto",
    block: "start",
  });
  assert.deepEqual(browser.getMediaQueries(), [
    "(prefers-reduced-motion: reduce)",
  ]);
});

test("RSVP navigation scrolls the editorial RSVP chapter into view", () => {
  const browser = installBrowser();
  scrolling.scrollToSection("rsvp");
  assert.deepEqual(browser.getSectionOptions(), {
    behavior: "smooth",
    block: "start",
  });
});

test("top navigation scrolls the document instead of a nested container", () => {
  const browser = installBrowser();

  assert.equal(typeof scrolling.scrollToTop, "function");
  scrolling.scrollToTop();

  assert.deepEqual(browser.getWindowOptions(), {
    top: 0,
    behavior: "smooth",
  });
  assert.deepEqual(browser.getMediaQueries(), [
    "(prefers-reduced-motion: reduce)",
  ]);
});

test("top navigation is immediate when reduced motion is requested", () => {
  const browser = installBrowser({ reducedMotion: true });

  scrolling.scrollToTop();

  assert.deepEqual(browser.getWindowOptions(), {
    top: 0,
    behavior: "auto",
  });
  assert.deepEqual(browser.getMediaQueries(), [
    "(prefers-reduced-motion: reduce)",
  ]);
});

test("active section selection keeps the latest ratio for every section", () => {
  const ratios = new Map([
    ["hero", 0],
    ["our-story", 0],
  ]);

  assert.equal(
    scrolling.updateSectionVisibility(ratios, [
      {
        target: { id: "hero" },
        isIntersecting: true,
        intersectionRatio: 0.75,
      },
      {
        target: { id: "our-story" },
        isIntersecting: true,
        intersectionRatio: 0.5,
      },
    ]),
    "hero"
  );

  assert.equal(
    scrolling.updateSectionVisibility(ratios, [
      {
        target: { id: "hero" },
        isIntersecting: true,
        intersectionRatio: 0.25,
      },
    ]),
    "our-story"
  );
});

test("document lock restores root and body inline overflow after every close", () => {
  installBrowser({ rootOverflow: "clip", bodyOverflow: "auto" });

  const firstUnlock = scrolling.lockDocumentScroll();
  assert.equal(document.documentElement.style.overflow, "hidden");
  assert.equal(document.body.style.overflow, "hidden");
  firstUnlock();
  assert.equal(document.documentElement.style.overflow, "clip");
  assert.equal(document.body.style.overflow, "auto");

  document.documentElement.style.overflow = "visible";
  document.body.style.overflow = "scroll";

  const secondUnlock = scrolling.lockDocumentScroll();
  assert.equal(document.documentElement.style.overflow, "hidden");
  assert.equal(document.body.style.overflow, "hidden");
  secondUnlock();
  assert.equal(document.documentElement.style.overflow, "visible");
  assert.equal(document.body.style.overflow, "scroll");
});
