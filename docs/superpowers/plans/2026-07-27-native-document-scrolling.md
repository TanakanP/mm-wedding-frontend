# Native Document Scrolling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the custom nested snap-scroller with normal browser document scrolling while preserving full-screen sections, sticky navigation, smooth section links, active-section highlighting, reduced-motion behavior, and RSVP modal scroll locking.

**Architecture:** The browser document becomes the only scroll container. Navigation helpers use native element/window scrolling, `IntersectionObserver` watches the browser viewport, CSS retains section sizing but removes all snap and overflow locks, and the RSVP modal locks `document.body` while open.

**Tech Stack:** Next.js 16.2.7 App Router, React 19.2.4, TypeScript 5.9, Tailwind CSS 4.3, Node.js built-in test runner.

## Global Constraints

- Preserve the current sticky garden navigation and active-section highlighting.
- Preserve current `100dvh` hero, story, and event sections.
- Preserve the FAQ section at a minimum height of `100dvh`.
- Restore native wheel, trackpad, touch, arrow-key, Page Up/Down, and Space scrolling.
- Keep smooth section navigation except when `prefers-reduced-motion: reduce` is active.
- Add no scrolling, animation, DOM-testing, or browser-testing dependency.
- Do not implement Apple-style scroll-linked animation in this phase.
- Do not alter section content, photos, countdown, petals, RSVP form fields, or FAQ behavior.
- Preserve unrelated working-tree changes.

---

## File Map

**Create:**

- `tests/scroll.test.mjs` — dependency-free behavioral coverage for native section and top navigation.

**Modify:**

- `package.json` — add the built-in Node test command.
- `src/lib/scroll.ts` — replace slider-coordinate scrolling with native document scrolling.
- `src/hooks/useScrollToSection.ts` — remove the obsolete numeric offset interface.
- `src/hooks/useSections.tsx` — observe the viewport and remove slider state and keyboard interception.
- `src/app/page.tsx` — render a normal semantic `<main>`.
- `src/app/layout.tsx` — remove the body viewport/overflow lock.
- `src/app/globals.css` — restore document overflow, remove snap styles, preserve full-screen sizing, and add header-aware scroll margins.
- `src/components/HeroSection.tsx` — rename the shared section class.
- `src/components/OurStory.tsx` — rename the shared section class.
- `src/components/EventDetails.tsx` — rename the shared section class.
- `src/components/FAQSection.tsx` — rename the shared section class.
- `src/components/RSVPForm.tsx` — lock document scrolling instead of a removed slider element.

---

### Task 1: Native Navigation Helpers

**Files:**

- Create: `tests/scroll.test.mjs`
- Modify: `package.json`
- Modify: `src/lib/scroll.ts`
- Modify: `src/hooks/useScrollToSection.ts`

**Interfaces:**

- Produces: `scrollToSection(sectionId: string): void`
- Produces: `scrollToTop(): void`
- Consumes: `window.matchMedia`, `window.scrollTo`, `document.getElementById`, and `HTMLElement.scrollIntoView`

- [ ] **Step 1: Add the test command**

Add this script to `package.json`:

```json
"test": "node --test tests/*.test.mjs"
```

- [ ] **Step 2: Write failing navigation tests**

Create `tests/scroll.test.mjs`:

```js
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
```

The production change these tests catch is a regression back to targeting `#garden-slider` or failing to respect reduced motion.

- [ ] **Step 3: Run the tests and verify RED**

Run:

```bash
npm test
```

Expected: assertion failures because the current helpers search for `#garden-slider`, call the slider’s `scrollTo`, and do not export `scrollToTop`.

- [ ] **Step 4: Implement the minimal native navigation helpers**

Replace `src/lib/scroll.ts` with:

```ts
function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

export function scrollToSection(sectionId: string) {
  if (typeof document === "undefined") return;

  const element = document.getElementById(sectionId);
  if (!element) {
    console.warn(`[scrollToSection] Element "${sectionId}" not found`);
    return;
  }

  element.scrollIntoView({
    behavior: scrollBehavior(),
    block: "start",
  });
}

export function scrollToTop() {
  if (typeof window === "undefined") return;

  window.scrollTo({
    top: 0,
    behavior: scrollBehavior(),
  });
}
```

- [ ] **Step 5: Remove the obsolete offset parameter from the hook**

Replace `src/hooks/useScrollToSection.ts` with:

```ts
import { scrollToSection } from "@/lib/scroll";

export function useScrollToSection() {
  return scrollToSection;
}
```

- [ ] **Step 6: Run the tests and verify GREEN**

Run:

```bash
npm test
```

Expected: 3 tests pass.

- [ ] **Step 7: Run focused static verification**

Run:

```bash
npx tsc --noEmit
```

Expected: PASS.

- [ ] **Step 8: Commit Task 1**

```bash
git add package.json tests/scroll.test.mjs src/lib/scroll.ts src/hooks/useScrollToSection.ts
git commit -m "refactor: use native document navigation"
```

---

### Task 2: Remove the Nested Snap-Scroll System

**Files:**

- Modify: `src/hooks/useSections.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/components/HeroSection.tsx`
- Modify: `src/components/OurStory.tsx`
- Modify: `src/components/EventDetails.tsx`
- Modify: `src/components/FAQSection.tsx`

**Interfaces:**

- Consumes: `scrollToSection(sectionId: string): void`
- Consumes: `scrollToTop(): void`
- Produces: `SectionsContextValue` containing `currentSectionId`, `sections`, `scrollTo`, and `scrollToTop`
- Preserves: section IDs `hero`, `our-story`, `garden-path`, and `garden-whispers`

- [ ] **Step 1: Record the failing browser acceptance behavior**

Run the current application:

```bash
npm run dev
```

In the browser, place the viewport midway between `#hero` and `#our-story`, then stop scrolling.

Expected before implementation: the page snaps to a section instead of remaining between them. Pressing Page Down also jumps directly to the next section because the application prevents the browser default.

- [ ] **Step 2: Simplify the section provider around the browser viewport**

In `src/hooks/useSections.tsx`:

1. Remove `useRef`.
2. Import `scrollToTop` instead of `scrollSliderToTop`, `NAV_SCROLL_OFFSET`, and `GARDEN_SLIDER_ID`.
3. Reduce the context interface to:

```ts
interface SectionsContextValue {
  currentSectionId: SectionId;
  sections: readonly SectionId[];
  scrollTo: (id: SectionId) => void;
  scrollToTop: () => void;
}
```

4. Initialize the active section directly:

```ts
const [currentSectionId, setCurrentSectionId] =
  useState<SectionId>(SECTION_IDS[0]);
```

5. Replace the slider-rooted observer effect with:

```ts
useEffect(() => {
  const sections = getSectionElements();
  if (sections.length === 0) return;

  const observer = new IntersectionObserver(
    (entries) => {
      let best: IntersectionObserverEntry | null = null;

      for (const entry of entries) {
        if (
          entry.isIntersecting &&
          (!best || entry.intersectionRatio > best.intersectionRatio)
        ) {
          best = entry;
        }
      }

      const id = best?.target.id as SectionId | undefined;
      if (id && SECTION_IDS.includes(id)) {
        setCurrentSectionId(id);
      }
    },
    {
      root: null,
      rootMargin: "0px 0px -40% 0px",
      threshold: [0.1, 0.25, 0.5, 0.75],
    }
  );

  sections.forEach((element) => observer.observe(element));
  return () => observer.disconnect();
}, []);
```

6. Delete the entire keyboard navigation effect so the browser owns Arrow, Page Up/Down, and Space behavior.
7. Derive the announcement rather than setting it in another effect:

```ts
const announcement = `Now viewing ${SECTION_LABELS[currentSectionId]}`;
```

8. Build the context value without slider fields:

```ts
const value: SectionsContextValue = {
  currentSectionId,
  sections: SECTION_IDS,
  scrollTo,
  scrollToTop,
};
```

9. Delete `GardenSlider` and all `notifySliderMounted`, `sliderRef`, and `sliderReady` code.
10. Update the development fallback to return only the four current interface fields.

- [ ] **Step 3: Render a normal semantic document**

Replace the `GardenSlider` composition inside `src/app/page.tsx` with:

```tsx
<SectionsProvider>
  <GardenNav />
  <main>
    <HeroSection />
    <OurStory />
    <EventDetails />
    <FAQSection />
  </main>
</SectionsProvider>
```

Update the import to:

```ts
import { SectionsProvider } from "@/hooks/useSections";
```

- [ ] **Step 4: Remove the layout-level overflow lock**

Change the body in `src/app/layout.tsx` to:

```tsx
<body className="font-sans">{children}</body>
```

- [ ] **Step 5: Replace snap CSS with normal document scrolling**

In `src/app/globals.css`:

1. Replace the document lock with:

```css
html {
  scroll-behavior: smooth;
}

html,
body {
  min-height: 100%;
  margin: 0;
}
```

2. Delete `.garden-app`, `.garden-slider`, its scrollbar rules, all `scroll-snap-*` declarations, and the reduced-motion `.garden-slider` override.
3. Replace `.garden-snap-section` with:

```css
.garden-section {
  width: 100%;
  scroll-margin-top: var(--nav-offset);
}
```

4. Preserve section heights:

```css
#hero,
#our-story,
#garden-path {
  height: 100dvh;
}

#garden-whispers {
  min-height: 100dvh;
}
```

5. Add the correct desktop navigation height:

```css
@media (min-width: 768px) {
  :root {
    --nav-offset: 56px;
  }
}
```

6. Disable CSS smooth scrolling for reduced motion:

```css
@media (prefers-reduced-motion: reduce) {
  html {
    scroll-behavior: auto;
  }
}
```

- [ ] **Step 6: Rename the shared section class**

In these four files, replace `garden-snap-section` with `garden-section`:

```text
src/components/HeroSection.tsx
src/components/OurStory.tsx
src/components/EventDetails.tsx
src/components/FAQSection.tsx
```

- [ ] **Step 7: Run automated regression checks**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
```

Expected:

- Navigation tests pass.
- TypeScript passes.
- The three previous `useSections.tsx` lint errors are gone.
- Any remaining lint output is limited to unrelated pre-existing files and must be reported rather than silently ignored.

- [ ] **Step 8: Verify the browser acceptance behavior is GREEN**

With the development server still running:

1. Stop midway between Hero and Our Story: the page remains there.
2. Press Arrow Down, Page Down, and Space: the browser scrolls by its normal increment rather than jumping exactly one section.
3. Click each sticky navigation item: it reaches the correct section smoothly.
4. Confirm section headings remain below the fixed header.
5. Confirm the active navigation state follows the visible section.
6. Enable reduced motion: navigation becomes immediate.
7. Repeat using a mobile viewport and touch-style scrolling.

- [ ] **Step 9: Commit Task 2**

```bash
git add src/hooks/useSections.tsx src/app/page.tsx src/app/layout.tsx src/app/globals.css src/components/HeroSection.tsx src/components/OurStory.tsx src/components/EventDetails.tsx src/components/FAQSection.tsx
git commit -m "refactor: restore native page scrolling"
```

---

### Task 3: Move RSVP Scroll Lock to the Document

**Files:**

- Modify: `src/components/RSVPForm.tsx`

**Interfaces:**

- Removes: `getGardenSlider()`
- Consumes: `isOpen: boolean`
- Side effect: temporarily sets `document.body.style.overflow` to `"hidden"`

- [ ] **Step 1: Record the failing modal behavior**

With the Task 2 application running, open the RSVP modal and attempt to scroll the page behind it.

Expected before implementation: the document can still scroll because the effect targets the removed garden slider.

- [ ] **Step 2: Replace the slider scroll lock**

Remove:

```ts
import { getGardenSlider } from "@/lib/scroll";
```

Replace the existing scroll-lock effect with:

```ts
useEffect(() => {
  if (!isOpen) return;

  const previousOverflow = document.body.style.overflow;
  document.body.style.overflow = "hidden";

  return () => {
    document.body.style.overflow = previousOverflow;
  };
}, [isOpen]);
```

- [ ] **Step 3: Run automated checks**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
```

Expected:

- Navigation tests pass.
- TypeScript passes.
- No new lint error appears in `RSVPForm.tsx`; its existing React Hook Form compiler warning may remain and must be reported.

- [ ] **Step 4: Verify modal scrolling**

In the browser:

1. Scroll halfway through Event Details.
2. Open RSVP.
3. Attempt wheel, touch, Page Down, and Space scrolling outside form controls: the page behind the modal stays fixed.
4. Close RSVP: the document scroll position is unchanged and normal scrolling resumes.
5. Open and close RSVP twice to verify cleanup remains correct.

- [ ] **Step 5: Run final repository verification**

Run:

```bash
git diff --check
npm test
npx tsc --noEmit
npm run lint
npm run build
```

Expected:

- `git diff --check`, tests, and TypeScript pass.
- Lint has no newly introduced errors; pre-existing unrelated errors are listed in the handoff.
- Production build passes when Google Fonts are reachable. If the environment blocks Google Fonts, report that exact external failure and do not claim the build passes.

- [ ] **Step 6: Inspect the final scope**

Run:

```bash
git status --short
git diff --stat
git diff
```

Confirm that only the files named by this plan changed and that pre-existing untracked brainstorm artifacts were not staged.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/components/RSVPForm.tsx
git commit -m "fix: lock document while RSVP is open"
```

---

## Completion Criteria

- The browser document is the only vertical scroll container.
- No `scroll-snap-*`, `.garden-slider`, `GardenSlider`, `getGardenSlider`, `sliderRef`, `sliderReady`, or keyboard section-jump logic remains.
- Sections retain their current full-screen sizing.
- Sticky navigation and active-section highlighting still work.
- Navigation links use smooth native scrolling and respect reduced motion.
- RSVP locks and restores document scrolling.
- Automated navigation tests pass without a new dependency.
- TypeScript passes.
- No new lint errors are introduced.
- Browser verification passes on desktop and mobile viewports.
- Apple-style animation remains deferred to the next collaborative design phase.
