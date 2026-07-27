# Native Document Scrolling Design

**Date:** 2026-07-27  
**Status:** Approved  
**Scope:** Replace the custom snap-scrolling system with normal browser document scrolling while preserving the current full-screen layouts and sticky navigation.

## Goal

Make the wedding site scroll like a normal webpage with the mouse wheel, trackpad, touch gestures, arrow keys, Page Up/Down, and Space. This creates a predictable baseline for a later, separately designed phase of Apple-style scroll-linked animation.

## Chosen Approach

Use the browser document as the only scroll container.

The existing nested `.garden-slider` scroll container, mandatory CSS scroll snapping, and keyboard section-jump handler will be removed. Navigation buttons will continue to scroll smoothly to sections, and active-section highlighting will continue through `IntersectionObserver` against the browser viewport.

This is preferred over merely disabling snap on the nested container because it restores native browser behavior and gives future scroll-linked animations one clear source of scroll progress.

## User Experience

- Scrolling is continuous and stops wherever the user stops.
- No section automatically captures or redirects scrolling.
- Arrow keys, Page Up/Down, Space, mouse wheel, trackpad, and touch use native browser behavior.
- The hero, Our Story, event, and FAQ sections retain their current full-screen or minimum full-screen sizing.
- The sticky garden navigation remains visually unchanged.
- Navigation links smoothly scroll to the selected section.
- Navigation accounts for the fixed header so section headings are not hidden.
- Active navigation highlighting continues while the user scrolls.
- Reduced-motion users navigate without smooth-scroll animation.
- Opening the RSVP modal prevents the underlying document from scrolling and restores the prior scroll state when closed.

## Architecture

### Page scrolling

`html` and `body` will return to normal vertical document scrolling. The page-level wrapper will no longer lock the viewport or hide overflow.

`src/app/page.tsx` will render the sections inside a normal semantic `<main>` rather than the custom `GardenSlider` scroll container.

### Section layout

The existing section heights remain unchanged for this phase:

- Hero, Our Story, and Event Details remain one viewport tall.
- FAQ remains at least one viewport tall and may grow with its content.

The shared section class will retain width and layout responsibilities but lose all snap-related properties.

### Navigation

The section context remains responsible for:

- the ordered section identifiers;
- the currently visible section;
- navigation actions used by `GardenNav`;
- screen-reader announcements.

It will no longer own a scroll-container ref, slider readiness state, or keyboard interception.

`IntersectionObserver` will use the browser viewport as its root. Section navigation will use native element scrolling, with CSS `scroll-margin-top` providing the fixed-navigation offset.

### RSVP modal

The modal will lock document scrolling instead of changing the removed slider element. Cleanup will restore the previous document overflow value to avoid leaving the page locked after closing or unmounting.

## Files Expected to Change

- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/hooks/useSections.tsx`
- `src/lib/scroll.ts`
- `src/components/RSVPForm.tsx`

Obsolete slider-specific exports and state will be deleted instead of retained for speculative future use.

## Verification

Automated checks will cover the smallest practical units of navigation behavior without adding a heavy testing dependency. Repository type checking and linting will also be run, with any pre-existing failures reported separately from regressions introduced by this change.

Manual browser verification will confirm:

1. Wheel, trackpad, touch, arrow keys, Page Up/Down, and Space scroll continuously.
2. The page can stop between sections without snapping.
3. Sticky navigation remains visible outside the hero and highlights the active section.
4. Navigation buttons reach the correct section without hiding headings beneath the header.
5. Full-screen section sizing remains visually unchanged.
6. The RSVP modal locks and restores background scrolling.
7. Reduced-motion navigation is immediate.
8. Desktop and mobile scrolling both behave normally.

## Non-Goals

- No Apple-style scroll-linked animation in this phase.
- No section redesign or content change.
- No changes to the current photo, countdown, petal, RSVP, or FAQ animations.
- No new animation or scrolling dependency.
- No unrelated cleanup outside code made obsolete by removing the custom scroll system.

## Follow-Up

After native scrolling is stable, the Apple-inspired phase will be designed collaboratively. It will determine which story should unfold during scrolling, which elements become sticky, how progress maps to animation, and how the experience degrades for mobile and reduced-motion users.
