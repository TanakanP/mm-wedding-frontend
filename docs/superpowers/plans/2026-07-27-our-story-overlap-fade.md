# Our Story Overlap Fade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use
> superpowers:executing-plans to implement this plan task-by-task. Steps use
> checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fade Our Story in across the viewport overlap while Hero scrolls out.

**Architecture:** Add a Framer Motion viewport-entry progress value directly in
`OurStory`. Use it for scene opacity and entry translation, while the existing
pinned progress continues to drive the letter, photos, movement, rotation, and
scale.

**Tech Stack:** Next.js 16 client components, React 19, Framer Motion 12,
TypeScript, Node test runner.

## Global Constraints

- Do not stage or commit changes.
- Hero text and leaves remain fully opaque.
- Our Story reaches opacity `1` at the pinned handoff and never fades out.
- Preserve the current reduced-motion and pinned animation behavior.
- Add no dependency or shared abstraction.

---

### Task 1: Coordinate the Hero-to-Our Story Fade

**Files:**

- Modify: `src/components/OurStory.tsx:3-31`
- Verify: `tests/scroll-animations.test.mjs`

**Interfaces:**

- Consumes: Framer Motion `useScroll({ target, offset })`.
- Produces: an entry progress value ranging from `0` at `"start end"` to `1`
  at `"start start"`.

- [ ] **Step 1: Verify the current behavior fails the approved design**

Open the local application at `http://localhost:3000/`, scroll to the midpoint
of the Hero/Our Story overlap, and inspect the sticky scene opacity.

Expected before implementation: opacity remains near the old fixed entrance
value of `0.72`, rather than following overlap progress near `0.5`.

- [ ] **Step 2: Implement the minimal viewport-entry progress**

Add `useScroll` to the existing Framer Motion import and create:

```tsx
const { scrollYProgress: sceneEntryProgress } = useScroll({
  target: sectionRef,
  offset: ["start end", "start start"],
});
```

Drive `sceneOpacity` from `sceneEntryProgress`:

```tsx
const sceneOpacity = useTransform(sceneEntryProgress, (progress) =>
  mapScrollProgress(progress, [0, 1], [0, 1])
);
```

Translate the full-height scene into the viewport during the same range:

```tsx
const sceneEntryY = useTransform(
  sceneEntryProgress,
  [0, 1],
  ["-100dvh", "0dvh"]
);
```

Keep `scrollYProgress` unchanged for every other transform.

- [ ] **Step 3: Run automated checks**

Run:

```bash
npm test
npx tsc --noEmit
npx eslint src/components/OurStory.tsx
```

Expected: all commands exit successfully.

- [ ] **Step 4: Verify the scroll-linked behavior**

In the local browser, verify:

- At the overlap midpoint, scene opacity is approximately `0.5`.
- At the overlap midpoint, the complete scene occupies the viewport.
- When Our Story reaches the pinned handoff, scene opacity is `1`.
- After Our Story releases, scene opacity remains `1`.
- Hero text and leaf canvas opacity remain `1`.
- There is no horizontal overflow.

- [ ] **Step 5: Review Git state**

Run:

```bash
git diff --check
git status --short --branch
```

Expected: the implementation remains unstaged and uncommitted.
