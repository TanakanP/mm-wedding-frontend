import assert from "node:assert/strict";
import test, { afterEach } from "node:test";

import * as scrolling from "../src/lib/scroll.ts";

afterEach(() => {
  delete globalThis.document;
  delete globalThis.window;
});

function installBrowser({ reducedMotion = false } = {}) {
  let sectionOptions;
  let windowOptions;

  const section = {
    scrollIntoView(options) {
      sectionOptions = options;
    },
  };

  globalThis.document = {
    getElementById(id) {
      return id === "our-story" ? section : null;
    },
  };

  globalThis.window = {
    matchMedia() {
      return { matches: reducedMotion };
    },
    scrollTo(options) {
      windowOptions = options;
    },
  };

  return {
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
});

test("section navigation is immediate when reduced motion is requested", () => {
  const browser = installBrowser({ reducedMotion: true });

  scrolling.scrollToSection("our-story");

  assert.deepEqual(browser.getSectionOptions(), {
    behavior: "auto",
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
});
