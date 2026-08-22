# Photography-First Editorial Wedding Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the existing single-page wedding site as a naturally scrolling, photography-first editorial invitation using the current cream, gold, rose, sage, and garden-texture theme.

**Architecture:** Keep the existing route, native document scrolling, RSVP modal, FAQ, and wish-wall behavior. Centralize repeated wedding/photo metadata, recompose the hero/story/event sections around the ten existing images, and remove only the pinned-story/carousel code that becomes unreachable.

**Tech Stack:** Next.js 16.2.7 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Framer Motion 12, `next/image`, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-22-photography-first-editorial-revamp-design.md`

## Global Constraints

- Use all ten existing optimized photographs exactly once in the visible page, in the approved order: `6, 7, 1, 2, 3, 4, 10, 5, 8, 9`.
- Keep the existing theme tokens: deep forest `#0C2A1F`, sage `#4A664F`, cream `#F7F3EB`, warm gold `#B89E68`, muted rose `#C48A7F`, and dusty rose `#A36E6A`.
- Do not use large forest or moss chapter backgrounds; photography supplies the strongest contrast.
- Keep native document scrolling. Do not add snap scrolling, a custom scroll container, wheel interception, or viewport-pinned content chapters.
- Preserve the countdown, RSVP fields and validation, modal scroll locking, RSVP completion card, wish wall, FAQ behavior, section navigation, and reduced-motion support.
- Add no runtime or development dependency.
- Use `next/image` with `fill`, an accurate `sizes` value, and a positioned parent. Use `preload`, not the deprecated `priority` prop, for the single hero image.
- Keep final venue/map/calendar destinations absent when no verified destination exists; do not invent URLs.
- Preserve unrelated working-tree changes. Stage and commit only files named by the active task.
- Before editing Next.js behavior, follow the checked-in Next 16 documentation under `node_modules/next/dist/docs/`, especially `01-app/01-getting-started/12-images.md` and `01-app/03-api-reference/02-components/image.md`.

---

## File Map

### Create

- `src/content/wedding.ts` — canonical wedding copy, navigation destinations, schedule, and the ten editorial photo roles.
- `src/lib/countdown.ts` — pure countdown calculation shared by the hero countdown component and tests.
- `src/components/hero/PetalsCanvas.tsx` — the existing petal canvas isolated from hero layout work.
- `src/components/hero/Countdown.tsx` — live countdown presentation and post-event state.
- `tests/wedding-content.test.mjs` — photo-role, content, and navigation invariants.
- `tests/countdown.test.mjs` — countdown boundary and remainder behavior.
- `tests/editorial-structure.test.mjs` — natural-flow chapter-order contract.

### Modify

- `scripts/optimize-story-photos.mjs` — stop generating the obsolete photo-version module.
- `src/app/layout.tsx` — source metadata from canonical wedding content.
- `src/app/page.tsx` — retain the route composition and apply the editorial page shell.
- `src/app/globals.css` — retain old theme tokens, remove fixed chapter heights and migration aliases.
- `src/components/HeroSection.tsx` — photographic hero, taped M & M tag, and compact countdown chapter.
- `src/components/OurStory.tsx` — normal-flow Photo 7 story spread with Photos 1 and 2 as memory prints.
- `src/components/GardenPath.tsx` — visible, non-interactive vertical schedule timeline.
- `src/components/EventDetails.tsx` — schedule, Photo 4 interlude, Photo 10 venue spread, Photos 5/8/9 memory strip, and RSVP callout.
- `src/components/GardenNav.tsx` — responsive menu, meaningful anchors, and RSVP destination.
- `src/components/FAQSection.tsx` — natural-height editorial FAQ and closing footer.
- `src/components/RSVPForm.tsx` — theme-only alignment and canonical event copy; behavior remains unchanged.
- `src/hooks/useSections.tsx` — observe the new meaningful section IDs.
- `src/hooks/useElementScrollProgress.ts` — remove pinned and viewport-entry modes after Our Story no longer uses them.
- `src/lib/scrollAnimations.ts` — retain only normal-section progress and interpolation helpers.
- `tests/scroll-animations.test.mjs` — replace pinned-story assertions with normal-flow assertions.
- `tests/scroll.test.mjs` — cover the new RSVP navigation destination.

### Delete after callers are removed

- `src/components/our-story/PhotoCarousel.tsx`
- `src/components/our-story/PinnedPhoto.tsx`
- `src/components/our-story/StoryLetter.tsx`
- `src/components/our-story/StoryPhotoImage.tsx`
- `src/components/our-story/constants.ts`
- `src/components/our-story/photo-versions.ts`
- `src/components/our-story/usePreloadStoryPhotos.ts`

---

### Task 1: Canonical Wedding Content and Photo Roles

**Files:**

- Create: `src/content/wedding.ts`
- Create: `tests/wedding-content.test.mjs`
- Modify: `scripts/optimize-story-photos.mjs`
- Modify: `src/app/layout.tsx`

**Interfaces:**

- Produces: `WEDDING` with `couple`, `dateIso`, `dateLabel`, `venue`, `story`, and `schedule`.
- Produces: `SECTION_IDS`, `SectionId`, and `NAV_ITEMS`.
- Produces: `PHOTOS` and `EDITORIAL_PHOTO_IDS` for later layout tasks.

- [ ] **Step 1: Write the failing content invariant test**

Create `tests/wedding-content.test.mjs` using the same TypeScript transpilation pattern as `tests/scroll-animations.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/content/wedding.ts", import.meta.url),
  "utf8"
);
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const content = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("editorial photo plan uses every photo exactly once", () => {
  assert.deepEqual(content.EDITORIAL_PHOTO_IDS, [6, 7, 1, 2, 3, 4, 10, 5, 8, 9]);
  assert.equal(new Set(content.EDITORIAL_PHOTO_IDS).size, 10);
  assert.equal(Object.keys(content.PHOTOS).length, 10);
  for (const photo of Object.values(content.PHOTOS)) {
    assert.match(photo.src, /^\/photos\/display\/\d+\.jpeg$/);
    assert.ok(photo.alt.length >= 12);
  }
});

test("navigation observes every meaningful editorial chapter", () => {
  assert.deepEqual(content.SECTION_IDS, [
    "hero",
    "countdown",
    "our-story",
    "schedule",
    "venue",
    "rsvp",
    "garden-whispers",
  ]);
  assert.deepEqual(
    content.NAV_ITEMS.map((item) => item.id),
    ["our-story", "schedule", "venue", "garden-whispers"]
  );
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/wedding-content.test.mjs
```

Expected: FAIL because `src/content/wedding.ts` does not exist.

- [ ] **Step 3: Create the canonical content module**

Create `src/content/wedding.ts` with these exact public shapes and approved values:

```ts
export const SECTION_IDS = [
  "hero",
  "countdown",
  "our-story",
  "schedule",
  "venue",
  "rsvp",
  "garden-whispers",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

export const NAV_ITEMS = [
  { id: "our-story", label: "Our Story" },
  { id: "schedule", label: "Schedule" },
  { id: "venue", label: "Venue" },
  { id: "garden-whispers", label: "FAQ" },
] as const satisfies readonly { id: SectionId; label: string }[];

export const WEDDING = {
  couple: "M & M",
  dateIso: "2026-12-05T00:00:00",
  dateLabel: "5 December 2026",
  dateLong: "Saturday, December 5, 2026",
  timeLabel: "5:30 PM - Midnight",
  venue: {
    name: "The Garden Hiroen",
    receptionName: "The Grand Orchard Pavilion",
    address: "456 Celebration Lane, New York, NY",
    mapUrl: null as string | null,
    calendarUrl: null as string | null,
  },
  story:
    "Some paths in life are wandered alone, and some are found together. Ours began in a quiet garden café, grew through seasons of laughter and patience, and led us here — to this day, surrounded by the people we love most. We are grateful you are part of our story.",
  schedule: [
    { time: "5:30 PM", description: "Reception begins" },
    { time: "Midnight", description: "Celebration concludes" },
  ],
} as const;

export const PHOTOS = {
  1: { id: 1, src: "/photos/display/1.jpeg", alt: "M and M smiling together in a close memory", objectPosition: "50% 45%" },
  2: { id: 2, src: "/photos/display/2.jpeg", alt: "M and M sharing an outdoor travel memory", objectPosition: "50% 45%" },
  3: { id: 3, src: "/photos/display/3.jpeg", alt: "M and M together with a mountain landscape", objectPosition: "50% 45%" },
  4: { id: 4, src: "/photos/display/4.jpeg", alt: "M and M enjoying a playful lakeside moment", objectPosition: "50% 45%" },
  5: { id: 5, src: "/photos/display/5.jpeg", alt: "M and M posing together in playful costumes", objectPosition: "50% 45%" },
  6: { id: 6, src: "/photos/display/6.jpeg", alt: "M and M standing together beside a misty garden path", objectPosition: "50% 45%" },
  7: { id: 7, src: "/photos/display/7.jpeg", alt: "M and M standing beneath warm autumn leaves", objectPosition: "50% 45%" },
  8: { id: 8, src: "/photos/display/8.jpeg", alt: "M and M sharing a candid moment together", objectPosition: "50% 45%" },
  9: { id: 9, src: "/photos/display/9.jpeg", alt: "M and M smiling together during their travels", objectPosition: "50% 45%" },
  10: { id: 10, src: "/photos/display/10.jpeg", alt: "M and M together during a garden journey", objectPosition: "50% 45%" },
} as const;

export const EDITORIAL_PHOTO_IDS = [6, 7, 1, 2, 3, 4, 10, 5, 8, 9] as const;
```

During visual QA, adjust only `objectPosition`; do not change role order or duplicate images.

- [ ] **Step 4: Stop generating the obsolete version module**

In `scripts/optimize-story-photos.mjs`, remove `statSync` and `writeFileSync` from the import, remove the `versions` object, and remove the call that writes `src/components/our-story/photo-versions.ts`. Keep the `sips -Z 430` optimization loop and final success message. Leave the existing generated file in place until Task 3 removes the remaining old-story callers.

- [ ] **Step 5: Source metadata from canonical content**

Modify `src/app/layout.tsx`:

```ts
import { WEDDING } from "@/content/wedding";

export const metadata: Metadata = {
  title: `${WEDDING.couple} Wedding | ${WEDDING.venue.name}`,
  description: `Join us on ${WEDDING.dateLabel} for our celebration at ${WEDDING.venue.name}.`,
};
```

- [ ] **Step 6: Run focused and static verification**

Run:

```bash
node --test tests/wedding-content.test.mjs
npx tsc --noEmit
npx eslint src/content/wedding.ts src/app/layout.tsx scripts/optimize-story-photos.mjs
```

Expected: all commands pass.

- [ ] **Step 7: Commit Task 1**

```bash
git add src/content/wedding.ts tests/wedding-content.test.mjs scripts/optimize-story-photos.mjs src/app/layout.tsx
git commit -m "refactor: centralize wedding content"
```

---

### Task 2: Photography Hero, Invitation Tag, and Countdown

**Files:**

- Create: `src/lib/countdown.ts`
- Create: `tests/countdown.test.mjs`
- Create: `src/components/hero/PetalsCanvas.tsx`
- Create: `src/components/hero/Countdown.tsx`
- Modify: `src/components/HeroSection.tsx`

**Interfaces:**

- Consumes: `WEDDING.dateIso`, `WEDDING.dateLabel`, `WEDDING.venue.name`, and `PHOTOS[6]`.
- Produces: `getTimeLeft(targetMs: number, nowMs?: number): TimeLeft`.
- Produces: two normal-flow sections with IDs `hero` and `countdown`.

- [ ] **Step 1: Write failing countdown tests**

Create `tests/countdown.test.mjs` using the Task 1 transpilation pattern and these assertions:

```js
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
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/countdown.test.mjs
```

Expected: FAIL because `src/lib/countdown.ts` does not exist.

- [ ] **Step 3: Implement the pure countdown helper**

Create `src/lib/countdown.ts`:

```ts
export const MINUTE_MS = 60_000;
export const HOUR_MS = 60 * MINUTE_MS;
export const DAY_MS = 24 * HOUR_MS;
export const AVERAGE_MONTH_MS = 30.436875 * DAY_MS;

export type TimeLeft = {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
};

export function getTimeLeft(targetMs: number, nowMs = Date.now()): TimeLeft {
  const isPast = nowMs >= targetMs;
  const diff = Math.max(0, targetMs - nowMs);

  return {
    months: Math.floor(diff / AVERAGE_MONTH_MS),
    days: Math.floor((diff % AVERAGE_MONTH_MS) / DAY_MS),
    hours: Math.floor((diff % DAY_MS) / HOUR_MS),
    minutes: Math.floor((diff % HOUR_MS) / MINUTE_MS),
    seconds: Math.floor((diff % MINUTE_MS) / 1000),
    isPast,
  };
}
```

- [ ] **Step 4: Extract existing petals without changing their behavior**

Move the current `PetalsCanvas` implementation from `HeroSection.tsx` into `src/components/hero/PetalsCanvas.tsx`. Mark the file `"use client"`; keep its `wind?: number` prop, canvas cleanup, existing muted-rose token lookup, and pointer-events behavior. Export it as the default component.

- [ ] **Step 5: Create the live Countdown component**

Create `src/components/hero/Countdown.tsx` as a client component. It accepts `targetDateIso: string`, initializes from `getTimeLeft`, updates once per second, clears its interval on unmount, renders the existing five units, and renders the existing post-event message when `isPast` is true. Remove the hidden five-click state change from the old hero.

- [ ] **Step 6: Recompose HeroSection around Photo 6 and the paper tag**

Use this structural skeleton in `src/components/HeroSection.tsx`:

```tsx
return (
  <>
    <section ref={sectionRef} id="hero" className="garden-section relative min-h-[88svh] overflow-hidden bg-cream">
      <Image
        src={PHOTOS[6].src}
        alt={PHOTOS[6].alt}
        fill
        preload
        sizes="100vw"
        className="object-cover"
        style={{ objectPosition: PHOTOS[6].objectPosition }}
      />
      <div className="absolute inset-0 bg-foreground/15" aria-hidden />
      {!reduceMotion && <PetalsCanvas wind={wind} />}
      <motion.div className="absolute bottom-[8%] right-[5%] z-10 w-[min(78vw,340px)] rotate-2 bg-[#fffaf1] px-6 py-5 text-foreground shadow-xl md:bottom-[12%] md:right-[8%] md:w-[420px] md:px-9 md:py-7">
        <p>Together with our families</p>
        <h1>M &amp; M</h1>
        <p>{WEDDING.dateLabel}</p>
        <p>{WEDDING.venue.name}</p>
      </motion.div>
    </section>
    <section id="countdown" aria-labelledby="countdown-title" className="garden-section bg-cream garden-texture px-5 py-16 md:px-8 md:py-24">
      <h2 id="countdown-title">The celebration</h2>
      <Countdown targetDateIso={WEDDING.dateIso} />
    </section>
  </>
);
```

Retain the existing hero exit progress for gentle image/tag movement, but cap translation near `24px`, cap scale near `1.04`, keep the hero in normal flow, and return static styles under reduced motion.

- [ ] **Step 7: Run focused verification**

Run:

```bash
node --test tests/countdown.test.mjs
npx tsc --noEmit
npx eslint src/lib/countdown.ts src/components/hero src/components/HeroSection.tsx
```

Expected: all commands pass and `HeroSection.tsx` contains `preload`, not `priority`.

- [ ] **Step 8: Commit Task 2**

```bash
git add src/lib/countdown.ts tests/countdown.test.mjs src/components/hero src/components/HeroSection.tsx
git commit -m "feat: build photographic wedding hero"
```

---

### Task 3: Replace the Pinned Story With a Natural Editorial Spread

**Files:**

- Modify: `src/components/OurStory.tsx`
- Modify: `src/hooks/useElementScrollProgress.ts`
- Modify: `src/lib/scrollAnimations.ts`
- Modify: `tests/scroll-animations.test.mjs`
- Delete: `src/components/our-story/PhotoCarousel.tsx`
- Delete: `src/components/our-story/PinnedPhoto.tsx`
- Delete: `src/components/our-story/StoryLetter.tsx`
- Delete: `src/components/our-story/StoryPhotoImage.tsx`
- Delete: `src/components/our-story/constants.ts`
- Delete: `src/components/our-story/photo-versions.ts`
- Delete: `src/components/our-story/usePreloadStoryPhotos.ts`

**Interfaces:**

- Consumes: `WEDDING.story` and `PHOTOS[7]`, `PHOTOS[1]`, `PHOTOS[2]`.
- Produces: a natural-height `<section id="our-story">` with all content visible without scroll progress.
- Retains: `mapScrollProgress` and `getSectionScrollProgress(sectionTop, sectionHeight)` for hero exit motion.

- [ ] **Step 1: Rewrite the scroll-animation tests for the approved normal flow**

Replace pinned-story tests in `tests/scroll-animations.test.mjs` with:

```js
test("normal section progress clamps across one section height", () => {
  assert.equal(animations.getSectionScrollProgress(0, 900), 0);
  assert.equal(animations.getSectionScrollProgress(-450, 900), 0.5);
  assert.equal(animations.getSectionScrollProgress(-900, 900), 1);
});

test("pinned story helpers no longer exist", () => {
  assert.equal(animations.getViewportEntryProgress, undefined);
  assert.equal(animations.getStoryContentProgress, undefined);
  assert.equal(animations.getOurStorySectionHeightVh, undefined);
  assert.equal(animations.getPhotoRevealWindow, undefined);
});
```

Keep the existing multi-stop `mapScrollProgress` test.

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/scroll-animations.test.mjs
```

Expected: FAIL because pinned-story exports still exist and the normal progress function still has the old signature.

- [ ] **Step 3: Reduce scroll helpers to normal-flow behavior**

In `src/lib/scrollAnimations.ts`, retain `mapScrollProgress` and implement:

```ts
export function getSectionScrollProgress(
  sectionTop: number,
  sectionHeight: number
): number {
  const travel = Math.max(1, sectionHeight);
  return Math.min(1, Math.max(0, -sectionTop / travel));
}
```

In `src/hooks/useElementScrollProgress.ts`, remove the `pinned` parameter and delete `useViewportEntryProgress`. Call `getSectionScrollProgress(rect.top, rect.height)`.

- [ ] **Step 4: Rebuild OurStory as a responsive editorial spread**

Implement `OurStory.tsx` with:

- One normal-flow cream section with `py-20 md:py-28` rather than an inline viewport height.
- A desktop two-column grid: Photo 7 on one side, story copy and the two memory prints on the other.
- A mobile single column: heading/copy, Photo 7, then Photos 1 and 2 in a two-column memory row.
- `Image fill` and accurate `sizes` values: Photo 7 uses `"(max-width: 767px) 100vw, 58vw"`; each memory uses `"(max-width: 767px) 50vw, 18vw"`.
- Small `motion` wrappers with `whileInView`, `viewport={{ once: true, amount: 0.2 }}`, and no transform when reduced motion is requested.
- Paper borders, warm-gold rules, muted-rose tape details, and no large dark surface.

- [ ] **Step 5: Delete obsolete story files after confirming no callers**

Run:

```bash
rg -n "PhotoCarousel|PinnedPhoto|StoryLetter|StoryPhotoImage|PHOTO_PLACEMENTS|usePreloadStoryPhotos" src
```

Expected before deletion: matches only inside the obsolete files. Delete those files and `src/components/our-story/constants.ts`.

- [ ] **Step 6: Run focused verification**

Run:

```bash
node --test tests/scroll-animations.test.mjs
npx tsc --noEmit
npx eslint src/components/OurStory.tsx src/hooks/useElementScrollProgress.ts src/lib/scrollAnimations.ts
rg -n "sticky|175dvh|PHOTO_PLACEMENTS|PhotoCarousel|PinnedPhoto" src/components src/lib/scrollAnimations.ts
```

Expected: tests/typecheck/lint pass; the final `rg` has no matches (an absent `src/components/our-story` directory is acceptable).

- [ ] **Step 7: Commit Task 3**

```bash
git add src/components/OurStory.tsx src/components/our-story src/hooks/useElementScrollProgress.ts src/lib/scrollAnimations.ts tests/scroll-animations.test.mjs
git commit -m "refactor: replace pinned story with editorial flow"
```

---

### Task 4: Build the Schedule-to-RSVP Editorial Journey

**Files:**

- Create: `tests/editorial-structure.test.mjs`
- Modify: `src/components/GardenPath.tsx`
- Modify: `src/components/EventDetails.tsx`
- Modify: `src/components/RSVPForm.tsx`

**Interfaces:**

- Consumes: `WEDDING.schedule`, `WEDDING.venue`, `WEDDING.dateLong`, `WEDDING.timeLabel`, and `PHOTOS[3|4|5|8|9|10]`.
- Produces: sections in order `schedule` → photo interlude → `venue` → memory strip → `rsvp`.
- Preserves: `RSVPForm({ isOpen, onClose })` and all form/wish behavior.

- [ ] **Step 1: Write a failing chapter-order contract**

Create `tests/editorial-structure.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("event journey exposes meaningful sections in narrative order", async () => {
  const source = await readFile(
    new URL("../src/components/EventDetails.tsx", import.meta.url),
    "utf8"
  );
  const ids = ["schedule", "venue", "rsvp"];
  const positions = ids.map((id) => source.indexOf(`id="${id}"`));
  assert.ok(positions.every((position) => position >= 0));
  assert.ok(positions[0] < positions[1] && positions[1] < positions[2]);
  assert.doesNotMatch(source, /100dvh|h-dvh|sticky\s+top-0/);
});

test("essential schedule information is not hidden behind click state", async () => {
  const source = await readFile(
    new URL("../src/components/GardenPath.tsx", import.meta.url),
    "utf8"
  );
  assert.doesNotMatch(source, /useState|onClick|selectedIndex/);
  assert.match(source, /schedule\.map/);
});
```

- [ ] **Step 2: Run the focused test and verify RED**

Run:

```bash
node --test tests/editorial-structure.test.mjs
```

Expected: FAIL because the new section IDs do not exist and GardenPath still hides details behind selection state.

- [ ] **Step 3: Simplify GardenPath into a visible vertical timeline**

Keep the existing `schedule` prop, change its type to `schedule: readonly ScheduleItem[]` so it accepts canonical readonly content, and render every item in semantic order:

```tsx
<ol className="relative space-y-8 border-l border-sage/30 pl-8">
  {schedule.map((item) => (
    <li key={`${item.time}-${item.description}`} className="relative">
      <span className="absolute -left-[2.28rem] top-1.5 size-3 rounded-full bg-accent-secondary ring-4 ring-cream" aria-hidden />
      <time className="text-sm font-medium tracking-wide text-accent-primary">{item.time}</time>
      <p className="mt-1 text-foreground/75">{item.description}</p>
    </li>
  ))}
</ol>
```

Remove marker positions, emoji, selection state, console logging, buttons, and tap instructions.

- [ ] **Step 4: Recompose EventDetails in the approved order**

Keep one client component so RSVP open state stays local. Render sibling normal-flow sections:

```tsx
<>
  <section id="schedule" className="garden-section bg-cream garden-texture px-5 py-20 md:px-8 md:py-28">
    <GardenPath schedule={WEDDING.schedule} />
    <div className="relative aspect-[4/3] overflow-hidden rounded-sm"><Image src={PHOTOS[3].src} alt={PHOTOS[3].alt} fill sizes="(max-width: 767px) 100vw, 36vw" className="object-cover" style={{ objectPosition: PHOTOS[3].objectPosition }} /></div>
  </section>
  <section aria-label="A memory from our journey" className="relative aspect-[4/3] w-full overflow-hidden md:aspect-[16/7]">
    <Image src={PHOTOS[4].src} alt={PHOTOS[4].alt} fill sizes="100vw" className="object-cover" style={{ objectPosition: PHOTOS[4].objectPosition }} />
  </section>
  <section id="venue" className="garden-section grid bg-cream px-5 py-20 md:grid-cols-2 md:px-8 md:py-28">
    <div><p>{WEDDING.dateLong}</p><p>{WEDDING.timeLabel}</p><p>{WEDDING.venue.receptionName}</p><p>{WEDDING.venue.address}</p></div>
    <div className="relative aspect-[4/3] overflow-hidden"><Image src={PHOTOS[10].src} alt={PHOTOS[10].alt} fill sizes="(max-width: 767px) 100vw, 52vw" className="object-cover" style={{ objectPosition: PHOTOS[10].objectPosition }} /></div>
  </section>
  <section aria-label="More memories together" className="grid gap-3 bg-cream px-5 py-12 sm:grid-cols-3 md:px-8 md:py-20">
    {[PHOTOS[5], PHOTOS[8], PHOTOS[9]].map((photo) => <figure key={photo.id} className="relative aspect-[4/5] overflow-hidden"><Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 639px) 100vw, 33vw" className="object-cover" style={{ objectPosition: photo.objectPosition }} /></figure>)}
  </section>
  <section id="rsvp" className="garden-section bg-cream garden-texture px-5 py-20 text-center md:px-8 md:py-28">
    <h2>RSVP with love</h2>
    <button type="button" onClick={() => setIsRSVPOpen(true)}>RSVP Now</button>
  </section>
  <RSVPForm isOpen={isRSVPOpen} onClose={() => setIsRSVPOpen(false)} />
</>
```

Render the optional actions exactly as guarded values:

```tsx
{WEDDING.venue.mapUrl && (
  <a href={WEDDING.venue.mapUrl} target="_blank" rel="noreferrer">
    Open location
  </a>
)}
{WEDDING.venue.calendarUrl && (
  <a href={WEDDING.venue.calendarUrl}>Add to calendar</a>
)}
```

Do not render a fake link when either value is `null`.

- [ ] **Step 5: Align RSVP copy and theme without changing behavior**

In `RSVPForm.tsx`, replace repeated date/venue display strings with `WEDDING.dateLabel`, `WEDDING.timeLabel`, and `WEDDING.venue.name`. Keep the Zod schema, `react-hook-form`, `lockDocumentScroll`, success states, `html2canvas`, and `PlantWishWall` logic unchanged. Keep cream surfaces and current gold/rose/sage controls.

- [ ] **Step 6: Run focused verification**

Run:

```bash
node --test tests/editorial-structure.test.mjs tests/scroll.test.mjs
npx tsc --noEmit
npx eslint src/components/GardenPath.tsx src/components/EventDetails.tsx src/components/RSVPForm.tsx
```

Expected: all commands pass.

- [ ] **Step 7: Commit Task 4**

```bash
git add tests/editorial-structure.test.mjs src/components/GardenPath.tsx src/components/EventDetails.tsx src/components/RSVPForm.tsx
git commit -m "feat: build editorial event journey"
```

---

### Task 5: Responsive Navigation, Natural Heights, FAQ, and Footer

**Files:**

- Modify: `src/hooks/useSections.tsx`
- Modify: `src/components/GardenNav.tsx`
- Modify: `src/components/FAQSection.tsx`
- Modify: `src/app/globals.css`
- Modify: `src/app/page.tsx`
- Modify: `tests/scroll.test.mjs`

**Interfaces:**

- Consumes: `SECTION_IDS`, `SectionId`, and `NAV_ITEMS` from `src/content/wedding.ts`.
- Produces: responsive navigation with direct desktop links, an accessible mobile menu, and RSVP scroll target `rsvp`.
- Preserves: `SectionsProvider`, `scrollToSection`, `scrollToTop`, FAQ accordion behavior, and active-section announcements.

- [ ] **Step 1: Add a failing RSVP navigation test**

Extend the `installBrowser` helper in `tests/scroll.test.mjs` so `getElementById` returns the test section for both `our-story` and `rsvp`, then add:

```js
test("RSVP navigation scrolls the editorial RSVP chapter into view", () => {
  const browser = installBrowser();
  scrolling.scrollToSection("rsvp");
  assert.deepEqual(browser.getSectionOptions(), {
    behavior: "smooth",
    block: "start",
  });
});
```

First run this test before changing `installBrowser`; expected RED because `rsvp` does not resolve.

- [ ] **Step 2: Source the observed section registry from canonical content**

In `src/hooks/useSections.tsx`, import `SECTION_IDS` and `type SectionId` from `@/content/wedding`. Replace the local arrays and labels. Use a complete announcement map:

```ts
const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Invitation",
  countdown: "Date and countdown",
  "our-story": "Our Story",
  schedule: "Schedule",
  venue: "Venue",
  rsvp: "RSVP",
  "garden-whispers": "FAQ",
};
```

- [ ] **Step 3: Build the responsive GardenNav**

In `GardenNav.tsx`:

- Render direct `NAV_ITEMS` buttons from `md` upward.
- On smaller screens render a labeled `Menu` button with `aria-expanded` and `aria-controls="garden-mobile-menu"`.
- Toggle an absolutely positioned cream menu containing every `NAV_ITEMS` destination.
- Close the menu after navigation.
- Keep M & M as the back-to-top action.
- Send the RSVP button directly to `sectionsScrollTo("rsvp")`.
- Continue hiding the nav only while `currentSectionId === "hero"`.
- Use cream, gold, rose, sage, and deep-forest text; do not add a dark nav surface.

- [ ] **Step 4: Remove fixed chapter sizing from globals**

In `src/app/globals.css`:

- Keep the six approved existing color values unchanged.
- Keep `--nav-offset`, `.garden-texture`, `.petal`, `.garden-section`, reduced-motion smooth-scroll override, and `.sr-only`.
- Delete the pastel compatibility aliases because no component uses them.
- Delete the `#hero`, `#garden-path`, and `#garden-whispers` height rules.
- Add `overflow-x: clip` to `body` only if the memory prints need a document-level safety guard; do not set vertical overflow.

- [ ] **Step 5: Restyle FAQ and footer in natural flow**

Keep the FAQ data and accordion logic. Change the section to content padding such as `py-20 md:py-28`; use paper-like cream panels, sage rules, warm-gold headings, muted-rose selected accents, and no minimum viewport height. Keep footer date/venue copy sourced from `WEDDING` and keep the back-to-top button.

In `src/app/page.tsx`, retain `SectionsProvider`, `GardenNav`, and the current component order. Keep `<main className="overflow-x-clip bg-cream">`.

- [ ] **Step 6: Run focused verification**

Run:

```bash
npm test
npx tsc --noEmit
npx eslint src/hooks/useSections.tsx src/components/GardenNav.tsx src/components/FAQSection.tsx src/app/page.tsx
rg -n "#garden-path|100dvh|min-height:\s*100dvh|pastel-" src/app/globals.css src/components
```

Expected: tests/typecheck/lint pass; the final `rg` has no matches.

- [ ] **Step 7: Commit Task 5**

```bash
git add src/hooks/useSections.tsx src/components/GardenNav.tsx src/components/FAQSection.tsx src/app/globals.css src/app/page.tsx tests/scroll.test.mjs
git commit -m "feat: finish responsive editorial navigation"
```

---

### Task 6: Production and Browser Verification

**Files:**

- Verify: all files changed by Tasks 1–5
- Modify only when a verification failure identifies a specific defect.

**Interfaces:**

- Verifies the complete route, navigation, RSVP, FAQ, wish, countdown, image, accessibility, and reduced-motion behavior.

- [ ] **Step 1: Run the complete automated gate**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Expected: every command exits `0`.

- [ ] **Step 2: Confirm obsolete implementation is gone**

Run:

```bash
rg -n "175dvh|PHOTO_PLACEMENTS|PhotoCarousel|PinnedPhoto|StoryLetter|useViewportEntryProgress|getStoryContentProgress|getOurStorySectionHeightVh" src tests
```

Expected: no matches.

- [ ] **Step 3: Verify image and section invariants**

Run:

```bash
rg -n "priority" src/components src/app
rg -n "id=\"(hero|countdown|our-story|schedule|venue|rsvp|garden-whispers)\"" src/components
```

Expected: the first command has no matches; the second reports every approved ID exactly once.

- [ ] **Step 4: Review mobile at 390 × 844**

Start the app with `npm run dev`, open the local route, set the viewport to 390 × 844, and verify:

- Hero faces are visible and the paper tag does not cover them.
- M & M, date, and venue are readable without scrolling sideways.
- The nav appears after Hero with M & M, Menu, and RSVP.
- Menu opens, receives keyboard focus in document order, navigates, and closes.
- Story is one column; memory prints do not create horizontal overflow.
- Schedule times are visible without tapping.
- Every photo crop keeps the couple visible.
- RSVP modal fills the mobile viewport, scroll locks behind it, validates fields, submits, shows the completion card, and releases scroll lock when closed.
- FAQ accordions open and close by touch and keyboard.

- [ ] **Step 5: Review tablet at 768 × 1024**

Verify the story, schedule, and venue switch cleanly to two-column layouts; navigation does not overflow; image text does not overlap; and all focus indicators remain visible.

- [ ] **Step 6: Review desktop at 1280 × 720**

Verify the direct navigation links, asymmetrical photo spreads, full-width Photo 4 interlude, maximum content width, image sharpness, and absence of large dark-green chapter backgrounds.

- [ ] **Step 7: Verify reduced motion and failure-safe content**

Emulate `prefers-reduced-motion: reduce` in browser developer tools, reload, and verify that all content is visible immediately, the hero and image reveals use no transform animation, smooth scrolling is disabled, and RSVP/FAQ state changes remain understandable.

Disable images in browser developer tools and verify that reserved aspect-ratio surfaces remain stable, alt text is meaningful, and date/schedule/venue/RSVP information remains usable.

- [ ] **Step 8: Inspect runtime output**

Review the browser console and the Next.js terminal output after the full interaction pass.

Expected: no runtime exceptions, hydration warnings, missing-key warnings, image sizing warnings, or failed local image requests.

- [ ] **Step 9: Commit verification fixes, if any**

If verification requires code changes, return to the owning Task 1–5, apply the fix within that task's named file list, rerun that task's focused checks, and amend or add the task-specific commit. If no files change, do not create an empty commit.

- [ ] **Step 10: Record final status**

Run:

```bash
git status --short --branch
git log -6 --oneline
```

Expected: the task commits are visible; unrelated pre-existing working-tree changes remain untouched and are reported separately.
