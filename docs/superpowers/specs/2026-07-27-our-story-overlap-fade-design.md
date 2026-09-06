# Our Story Entry Fade Design

## Goal

Fade Our Story in as it enters the viewport after Hero — normal document flow,
no layout overlap / negative margins.

## Behavior

- Our Story sits after Hero in normal flow (no `margin-top: -100dvh`).
- Entry progress goes `0 → 1` while the section top moves from the bottom of
  the viewport to the top (`getViewportEntryProgress`).
- The sticky scene opacity follows entry progress and stays at `1` after handoff.
- Letter and photos begin revealing during entry (via
  `getStoryContentProgress`), so the fade shows real content — not empty cream.
- After the section pins, pin progress continues the storytelling runway.
- Hero title/countdown and leaves may ease out on Hero exit (sequential, not
  stacked on top of Our Story).
- Reduced motion: static full scene, `100dvh` height, no scroll transforms.

## Non-goals

- Full-screen overlap crossfade of Our Story over Hero.
- Shared negative-margin stacking windows.

## Implementation

- `useViewportEntryProgress` for scene opacity / entry scale.
- `useElementScrollProgress(..., true)` for the pinned runway.
- Content progress = `max(pin, entry * 0.42)` so entry seeds the letter/photos.
- Section height `175dvh` (sticky + pin runway). Global CSS does not force
  `#our-story` to `100dvh`.

## Verification

- As Our Story first peeks in from below, scene opacity is low and rising.
- Mid-entry: letter is partially visible; scene opacity mid-range.
- At pin handoff (section top ≈ 0): scene opacity is `1`.
- No horizontal overflow; native document scrolling only.
