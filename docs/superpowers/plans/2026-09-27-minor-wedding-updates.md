# Minor Wedding Updates Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Update wedding branding, lower the opened envelope, and simplify the RSVP heading.

**Architecture:** Reuse the existing logo and update the current layout, navigation, intro, and hero components. Coordinate the intro and hero envelope positions so the overlay dismissal produces a continuous visual handoff.

**Tech Stack:** Next.js 16.2.7 App Router, React 19, Tailwind CSS 4, Framer Motion.

**Spec:** User request in this chat dated 2026-09-27: title “Mimeen Wedding”; new browser icon; opened envelope 125–200px lower; navbar logo replacing M & M; French RSVP heading replaced with “RSVP”.

**Branch:** `codex/minor-wedding-updates`, created from local `main`.

## Global Constraints

- Implemented on `codex/minor-wedding-updates` without new production dependencies.
- Proposed asset: reuse `public/seal-logo.svg` for both browser icon and navbar branding.
- Proposed offset: 125px below the existing envelope position on mobile, 200px at the existing `md` breakpoint and above.
- Apply the offset to the entire opened envelope, including photograph and flap; keep the sealed starting position.
- Preserve replay, scroll locking, keyboard focus, reduced-motion behavior, and RSVP submission behavior.
- Follow local Next.js docs, especially `node_modules/next/dist/docs/01-app/01-getting-started/14-metadata-and-og-images.md` and `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/01-metadata/app-icons.md` (read during planning).

## Review Focus

- Intro-to-hero handoff: no vertical jump or double envelope during dismissal.
- Short mobile viewports: lowered envelope and photo remain visible without colliding with the following section.
- Reduced motion and replay: final position is identical without an animated descent; replay starts sealed at its original position.
- Browser favicon selection: no old icon remains as a competing choice; inspect a fresh browser context.
- Mobile navigation: logo fits the existing bar and preserves an accessible scroll-to-top control.

## Task 1: Browser and navbar branding

**Files:** `src/app/layout.tsx`, `src/app/favicon.ico`, new `src/app/icon.svg`, `src/components/GardenNav.tsx`; source asset `public/seal-logo.svg`.

- [x] Set `metadata.title` to exactly `Mimeen Wedding`.
- [x] Create `src/app/icon.svg` from the existing logo with a square viewBox and suitable padding. Use the current wine/cream palette for legibility at favicon sizes; preserve the original logo artwork.
- [x] Replace `src/app/favicon.ico` with a matching rasterized version of that icon so browsers requesting `/favicon.ico` get the same branding. Use available local conversion tooling without adding a production dependency.
- [x] Replace the navbar's `M &amp; M` text with a decorative CSS mask using `/seal-logo.svg`, following the existing mask pattern. Use a 36px-square block, preserve `aria-label="Scroll to top"`, focus styling, and the existing click handler.
- [x] Verify the exact title and icon links in rendered page metadata; check logo visibility at 16px/32px, navbar at mobile/desktop sizes, and keyboard activation of the logo button.

## Task 2: Lower the opened envelope

**Files:** `src/components/InvitationIntro.tsx`, `src/components/v4/OpeningChapter.tsx`, `src/app/globals.css`; existing regression checks in `tests/v4-opening.test.mjs`, `tests/invitation-intro.test.mjs`, and `tests/reduced-motion.test.mjs`.

- [x] Define a shared responsive CSS custom property `--opened-envelope-offset` with 125px below `md` and 200px at/above `md`, using the project's breakpoint convention.
- [x] Animate the intro's outer envelope wrapper from its existing position to `var(--opened-envelope-offset)` during opening, after the flap opens. Finish the movement before the existing 2420ms dismissal; use zero duration and zero delay for reduced motion.
- [x] Apply the same offset to the hero envelope wrapper so it is already aligned when the intro disappears. Keep photograph float transforms on their existing child, independent of the whole-envelope translation.
- [x] Inspect short viewport geometry and provide enough hero height for the lowered envelope plus 24px bottom clearance. Keep the intro and hero envelope anchors aligned if hero height changes; avoid percentage-anchor drift between the viewport overlay and expanded hero.
- [ ] Check first open, dismissal, and replay at 390×844, 375×667, and 1440×900, including reduced motion. Confirm the final position is 125px/200px below its prior location and the next section does not overlap it.
- [x] Run the existing opening/intro/reduced-motion regression checks and adjust any assertions invalidated by an intentional anchor change without weakening their handoff guarantees.

## Task 3: RSVP heading and final verification

**Files:** `src/components/v4/RSVPChapter.tsx`.

- [x] Replace `Répondez s&apos;il vous plaît` with exactly `RSVP`, retaining the heading ID and styling.
- [x] Verify the heading visually, navigate to RSVP from desktop/mobile navigation, and open/close its form without submitting guest data.
- [x] Run `npm test`, `npm run lint`, and `npm run build`; record any pre-existing or environment-related failures separately from regressions.
- [x] Review `git diff --check` and the complete diff for scope and asset consistency. No new automated tests are needed for these low-impact presentation edits; use existing checks plus browser verification.

## Execution Handoff

Recommended execution: implement inline in the current chat. This is a small, closely related set of presentation changes. The asset choice and responsive offsets above are explicit assumptions that can be revised before implementation.

## Implementation verification (2026-09-27)

- Browser: title and favicon links rendered; monogram favicon checked at 16px and 32px; navbar logo and keyboard scroll-to-top worked; desktop and mobile RSVP navigation worked; the form opened and closed without submission.
- Envelope: opened at mobile width; final 125px/200px offsets and at least 24px bottom clearance confirmed at 390×844, 375×667, and 1440×900. Intro support text fades before the envelope descends. Manual replay and browser reduced-motion emulation remain unchecked; existing reduced-motion checks pass.
- `npx tsc --noEmit` and `git diff --check` pass. `npm run lint` exits 0 with one existing React Hook Form warning in `RSVPForm.tsx`.
- `npm test`: 49 passed, 13 failed. An archived `main` snapshot has the same 13 failures, so this branch adds no failing tests. The opening handoff assertion was updated for the intended new geometry.
- `npm run build`: blocked because Google Fonts requests for Inter and Playfair Display cannot connect in this environment.
