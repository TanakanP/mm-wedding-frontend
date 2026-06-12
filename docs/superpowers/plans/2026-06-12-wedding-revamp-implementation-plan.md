# Wedding Website Revamp Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revamp the M&M wedding frontend into a lush, colorful, interactive "Garden Romance" experience using the locked Verdant Harmony palette and Rich Garden Immersion design, enhancing the existing structure with approved content and 4-5 signature gimmicks.

**Architecture:** Single-page Next.js app. Update Tailwind/CSS vars for the exact palette on a cream base. Use Framer Motion (existing) for blooming reveals, card interactions, and subtle animations. Add lightweight falling petals via Framer or canvas in Hero only. Hardcode all approved content. Enhance existing 5 components + add 2 focused new ones (GardenPath, WishWall). Keep RSVP form logic and html2canvas intact. Sticky nav for navigation. All motion purposeful and low-cost.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, Framer Motion, react-hook-form + zod, lucide-react, html2canvas. No new dependencies. Follow existing patterns: 'use client' where needed, modular components in src/components.

## Files Overview

**Modify:**
- src/app/globals.css (palette vars, textures, animations)
- src/app/layout.tsx (metadata, possibly add body font)
- src/app/page.tsx (minor composition)
- src/components/HeroSection.tsx (petals, countdown, new content, nav trigger)
- src/components/OurStory.tsx (blooming cards, path visuals, new content)
- src/components/EventDetails.tsx (garden path, markers, new content/schedule)
- src/components/RSVPForm.tsx (palette theme, living card, wish wall integration)
- src/components/FAQSection.tsx (retheme, bloom animations)

**Create:**
- src/components/GardenNav.tsx (sticky nav with flower icons)
- src/components/GardenPath.tsx (reusable illustrated path with tappable markers)
- src/components/PlantWishWall.tsx (animated growing garden of wishes)
- src/components/FlowerParticle.tsx (lightweight petal component if needed)

**Test/Verify:**
- Run `npm run dev` and manually verify each section/gimmick in browser (desktop + mobile).
- No existing test suite; focus on visual + interaction verification per task.

## Task 1: Project Setup & Palette Foundation

**Files:**
- Modify: `src/app/globals.css`
- Modify: `src/app/layout.tsx`

- [ ] **Step 1: Add palette CSS variables and base styles to globals.css**

Update the @theme and :root with exact locked colors. Add subtle textures and bloom animation keyframes.

```css
/* src/app/globals.css */
@import "tailwindcss";

:root {
  --background: #f7f3eb; /* Cream Base */
  --foreground: #0c2a1f; /* Deep Forest */
  --color-accent-primary: #b89e68; /* Warm Gold */
  --color-accent-secondary: #c48a7f; /* Muted Rose */
  --color-sage: #4a664f;
  --color-dusty: #a36e6a;
  --color-cream: #f7f3eb;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-accent-primary: var(--color-accent-primary);
  --color-accent-secondary: var(--color-accent-secondary);
  --color-sage: var(--color-sage);
  --color-dusty: var(--color-dusty);
  --color-cream: var(--color-cream);
  --font-sans: var(--font-inter), ui-sans-serif, system-ui, sans-serif;
  --font-serif: var(--font-playfair), ui-serif, Georgia, serif;
}

body {
  background: var(--background);
  color: var(--foreground);
  font-family: var(--font-sans);
}

/* Subtle garden textures */
.garden-texture {
  background-image: 
    linear-gradient(rgba(74, 102, 79, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74, 102, 79, 0.03) 1px, transparent 1px);
  background-size: 20px 20px;
}

/* Bloom animations */
@keyframes bloom {
  from { transform: scale(0.8) rotate(-2deg); opacity: 0; }
  to { transform: scale(1) rotate(0deg); opacity: 1; }
}

.bloom {
  animation: bloom 0.6s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.petal {
  position: absolute;
  width: 8px;
  height: 8px;
  background: var(--color-accent-secondary);
  border-radius: 50% 0 50% 0;
  pointer-events: none;
  z-index: 1;
}
```

- [ ] **Step 2: Update layout metadata and add body font class if needed**

Ensure title/description reflect "M & M Wedding" and garden vibe. Add `font-serif` where appropriate.

```tsx
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "M & M Wedding | The Garden Hiroen",
  description: "Join us in the gardens on 5 December 2026 for our Garden Hiroen celebration.",
};

// ... keep the rest, add to html or body if needed for serif
```

- [ ] **Step 3: Verify by running dev server**

Run: `npm run dev`

Expected: Site loads with new cream background, gold/sage accents visible in dev tools. No layout shift.

- [ ] **Step 4: Commit**

```bash
git add src/app/globals.css src/app/layout.tsx
git commit -m "feat: lock Verdant Harmony palette and update metadata"
```

## Task 2: Hero Section with Petals and Blooming Countdown

**Files:**
- Modify: `src/components/HeroSection.tsx`
- Create: `src/components/FlowerParticle.tsx` (optional lightweight)

- [ ] **Step 5: Implement falling petals in Hero using Framer Motion (lightweight)**

Add 15-20 animated petal divs that fall slowly with slight horizontal drift. Trigger on mount and mouse move for wind.

```tsx
// src/components/HeroSection.tsx
"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

const Petals = () => {
  const [petals, setPetals] = useState<Array<{id: number; left: number; delay: number; duration: number}>>([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 6,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="petal"
          style={{ left: `${p.left}%` }}
          animate={{
            y: ["-10%", "110%"],
            x: [0, (Math.random() - 0.5) * 40],
            rotate: [0, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function HeroSection() {
  // ... existing structure with new content

  const targetDate = new Date("2026-12-05T00:00:00").getTime();
  // Simple blooming countdown (expand in later task if needed)

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-cream garden-texture">
      <Petals />
      {/* rest of hero with locked content and Playfair */}
      <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-foreground mb-6">
        M <span className="text-accent-secondary italic font-light">&amp;</span> M
      </h1>
      {/* ... */}
    </section>
  );
}
```

- [ ] **Step 6: Add blooming countdown**

Use state to update every minute. Numbers animate with bloom class on change.

(Include minimal code for hours/days.)

- [ ] **Step 7: Run dev and verify petals fall, countdown updates, content matches spec**

Run: `npm run dev`

Open http://localhost:3000. Petals should drift. Hero matches locked text and colors.

- [ ] **Step 8: Commit**

```bash
git add src/components/HeroSection.tsx
git commit -m "feat: hero with petals, blooming countdown, and locked content"
```

## Task 3: Our Story Winding Path with Blooming Cards

**Files:**
- Modify: `src/components/OurStory.tsx`

- [ ] **Step 9: Update content and make cards bloom on view/click**

Use framer whileInView for initial bloom. Click to expand more details if space.

Include exact enhanced text from spec.

Add simple vertical path with sage line.

- [ ] **Step 10: Verify by dev server**

Run dev, scroll to story, cards should bloom in. Matches spec text and colors.

- [ ] **Step 11: Commit**

## Task 4: Event Details - Garden Path

**Files:**
- Modify: `src/components/EventDetails.tsx`
- Create: `src/components/GardenPath.tsx`

- [ ] **Step 12: Create GardenPath component**

Simple SVG or div-based path with 4-6 flower/lantern markers. Click handler logs or shows detail (for now, can expand to modal later).

Use locked colors.

- [ ] **Step 13: Integrate into EventDetails with new content and schedule**

Update two cards, add the path below or integrated. Use exact venues/schedule from spec.

- [ ] **Step 14: Verify interaction and visuals**

Run dev. Tap markers (console or alert for demo). Colors and layout match.

- [ ] **Step 15: Commit**

## Task 5: Enhance RSVPForm with Living Card and Wish Wall

**Files:**
- Modify: `src/components/RSVPForm.tsx`
- Create: `src/components/PlantWishWall.tsx`

- [ ] **Step 16: Theme the modal and form with new palette**

Update classes to use --color-accent-primary etc.

- [ ] **Step 17: Enhance success state for attending**

Add visual "growing flower" (simple CSS/Framer divs that scale) + trigger extra petals on mount.

Keep the download card functionality.

- [ ] **Step 18: Add Plant Your Wish Wall**

After submit (for yes), show a growing garden of sample + user messages as flower elements.

Use local state for demo. Animate "planting".

- [ ] **Step 19: Verify full flow**

Run dev. Fill form (yes), submit, see living card + wall. Download still works.

- [ ] **Step 20: Commit**

## Task 6: FAQ, Nav, Footer, and Polish

**Files:**
- Modify: `src/components/FAQSection.tsx`
- Create: `src/components/GardenNav.tsx`
- Modify: `src/app/page.tsx` (add nav and footer)

- [ ] **Step 21: Retheme FAQ with bloom animations**

Update questions slightly per spec. Add framer for open state.

- [ ] **Step 22: Create sticky GardenNav**

Flower icons (use lucide or simple), links with smooth scroll. Warm Gold RSVP button.

Show after scroll past hero.

- [ ] **Step 23: Add footer and integrate in page**

Poetic text + links. Use palette.

- [ ] **Step 24: Final responsiveness and accessibility pass**

Check mobile, contrast, keyboard nav.

- [ ] **Step 25: Run dev and full manual test**

Run: `npm run dev`

Test entire flow on desktop and simulated mobile. All gimmicks work, colors consistent, no regressions.

- [ ] **Step 26: Commit**

```bash
git add -A
git commit -m "feat: complete wedding revamp with Verdant Harmony and all garden gimmicks"
```

## Verification & Cleanup

- [ ] **Step 27: Run build**

Run: `npm run build`

Expected: Succeeds with no errors. Static pages generated.

- [ ] **Step 28: Final commit if needed**

## Notes for Executor

- All content is hardcoded per spec.
- Petals: start with Framer for simplicity; optimize to canvas only if performance issue on mobile.
- Wish wall: local state is fine for demo; real persistence would be future backend task (out of scope).
- Test by running the dev server and interacting with every gimmick.

**Plan complete.** The spec is fully covered with no gaps. 

**Plan saved to `docs/superpowers/plans/2026-06-12-wedding-revamp-implementation-plan.md`.**

Two execution options:

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration.

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints.

Which approach? (Reply with 1 or 2, or describe preference.) 

If you choose 1, I'll start with Task 1 using subagent-driven-development. Let's go! 🌿