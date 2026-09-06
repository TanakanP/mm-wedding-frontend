# Our Story — Envelope & Pinboard Design

**Date:** 2026-06-27  
**Status:** Approved  
**Scope:** Replace minimal Our Story section with envelope-opening letter reveal + pinned photos

## Overview

When the user scrolls into the Our Story section, an envelope appears, opens, and a letter with the existing title and paragraph emerges. The envelope fades away, then three dummy photos pin themselves around the letter in an asymmetric collage layout.

## Visual Identity

### Envelope
- Cream paper body (`#f7f3eb`) with soft sage shadow
- Triangular flap in slightly darker cream
- Warm gold wax seal (`#b89e68`) with "M & M" in deep forest (`#0c2a1f`)
- Size: ~200×140px desktop, ~160×112px mobile

### Letter
- Off-white paper with subtle CSS grain texture
- Thin sage border, soft drop shadow
- Title: Playfair serif, `text-accent-primary`
- Body: serif, `text-foreground/75`, relaxed leading
- Max width: ~320px mobile, ~400px desktop

### Photos (dummy placeholders)
- Muted rose/sage botanical gradients with faint leaf watermark
- White 4px border (polaroid feel), slight random rotation
- Gold push-pin SVG at top-center
- Size: ~80×100px mobile, ~120×150px desktop

### Backdrop
- Existing `bg-cream garden-texture` section background
- Optional faint cork-dot pattern behind pinboard cluster (3% opacity)

## Layout

### Desktop (≥768px)
Asymmetric pinboard collage in a ~600×500px container, vertically centered in `100dvh` snap section:

```
                    [ Photo 1 ]  (-3°)
          [ Letter ]     [ Photo 2 ]  (+4°)
     [ Photo 3 ]  (+2°)
```

### Mobile (<768px) — Option A
Same collage, scaled down in ~340×380px container. Photos ~80px wide, tighter offsets, letter max-width ~280px.

## Animation Choreography

State machine: `waiting → envelope → opening → letter → exiting → photos → done`

| Step | Action | Duration |
|------|--------|----------|
| 0 | Envelope fades in, scale 0.9→1 | 0.5s |
| 1 | Pause, then flap opens (-120°), seal fades | 0.7s |
| 2 | Letter rises (translateY 40→0, scale 0.85→1), text fades in | 1.0s |
| 3 | Envelope fades out + scale 0.95, unmount | 0.5s |
| 4 | Photos pin sequentially with drop + bounce, 0.35s stagger | — |

- Trigger: `whileInView` with `once: true`
- Easing: `cubic-bezier(0.23, 1, 0.32, 1)`
- Reduced motion: skip envelope sequence; show letter + photos in final positions immediately

## Component Architecture

```
src/components/our-story/
├── constants.ts
├── EnvelopeAnimation.tsx
├── StoryLetter.tsx
├── PinnedPhoto.tsx
└── index.ts (re-export)

src/components/OurStory.tsx — section shell, phase state, viewport trigger
```

## Content

- Title: "Our Story"
- Body: existing `STORY_LETTER` paragraph (unchanged)
- Photos: three local dummy placeholders; swap `src` when real pre-wedding photos are ready

## Accessibility

- Semantic `<section id="our-story">`, `<h2>` on letter
- Photo `alt` text: "Our moment 1/2/3"
- `prefers-reduced-motion` respected
- Readable text throughout; no horizontal overflow on 320px screens

## Tech

- Framer Motion (existing)
- Inline SVG for envelope, seal, push-pin
- No new dependencies