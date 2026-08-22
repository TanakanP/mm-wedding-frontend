# Photography-First Editorial Wedding Revamp

**Date:** 2026-08-22  
**Status:** Approved design  
**Working title:** Cinematic Memory Journal

## Purpose

Revamp the M & M wedding website from a sequence of viewport-sized chapters
into one photography-led, naturally scrolling invitation. The page should feel
like a cinematic garden journal: emotionally rich, personal, and easy for
guests to use.

The audience is invited wedding guests. The page's single job is to help them
feel connected to M & M while giving them the date, schedule, venue, RSVP, and
preparation information without making them wait through animation.

## Approved Direction

The visual direction combines two concepts:

- **Cinematic Garden Journal:** large photographs, clean editorial grids,
  alternating olive and cream chapters, and clear information hierarchy.
- **Modern Memory Scrapbook:** a taped M & M invitation tag and two lightly
  rotated memory prints used as personal accents.

The cinematic structure is dominant. Scrapbook treatments are limited to the
hero tag and the story memories so the page stays refined rather than busy.

## Goals

- Make photography occupy approximately 65–75% of the perceived page journey.
- Use all ten existing optimized photographs, each with a distinct role.
- Replace fixed-height chapters and the pinned story runway with natural page
  flow.
- Preserve the working countdown, RSVP, FAQ, wish wall, navigation, and reduced
  motion behavior.
- Make the mobile experience feel intentionally composed rather than a desktop
  design compressed into one column.
- Keep event information immediately readable and keyboard accessible.
- Reuse the existing Next.js, Tailwind CSS, Framer Motion, and `next/image`
  stack without adding dependencies.

## Non-Goals

- Adding a CMS or configurable page builder.
- Adding more photographs during this pass.
- Rewriting RSVP data handling or changing its submission destination.
- Finalizing placeholder event copy, address, or map destinations that have not
  been supplied by the couple.
- Reproducing the reference designs exactly.
- Adding complex scroll-jacking, page snapping, WebGL, or another animation
  library.

## Visual System

### Palette

The existing garden identity remains, with stronger dark and mid-tone chapters:

- Forest — `#17352B`: primary dark surface and text.
- Moss — `#59654A`: schedule, countdown, and RSVP chapters.
- Cream — `#F3ECDF`: main page background.
- Paper — `#FFFAF1`: invitation tag, story copy, and light information panels.
- Muted rose — `#B9827F`: small romantic accents and focus details.
- Warm gold — `#C1AA73`: dates, timeline times, and restrained utility accents.

Texture stays subtle. The current grid may remain on quiet cream areas but must
not cover every section. Photographs and solid color fields provide most of the
visual structure.

### Typography

- Playfair Display remains the restrained display face for names, chapter
  headings, and italic editorial lines.
- Inter remains the body and utility face for readable guest information,
  buttons, captions, dates, and timeline labels.
- Small uppercase labels use Inter with deliberate tracking. Essential
  information must not use the tiny scale seen in the references.
- The M & M tag is the signature typographic moment. No additional script font
  is required for this version.

### Signature Element

The page is remembered by a taped paper invitation tag placed over the hero
photograph. It contains “Together with our families,” “M & M,” and the wedding
date. Two smaller memory prints in the story echo this material once; no other
section uses rotated paper.

## Photography Plan

All placements use the optimized images in `public/photos/display/`. Source
images remain untouched. Cropping is defined per placement with responsive
aspect ratios and `object-position` values so faces remain visible.

| Photo | Role | Treatment |
| --- | --- | --- |
| 6 | Hero | Full-bleed, darker tonal treatment for the invitation tag |
| 7 | Main story image | Tall cinematic crop on mobile; wide editorial crop on desktop |
| 1 | Story memory | Small taped/rotated print |
| 2 | Story memory | Small taped/rotated print |
| 3 | Schedule companion | Narrow vertical or square editorial crop |
| 4 | Photo interlude | Large full-width emotional pause |
| 10 | Venue companion | Split layout beside venue information |
| 5 | Closing memory strip | One of three equal or staggered frames |
| 8 | Closing memory strip | One of three equal or staggered frames |
| 9 | Closing memory strip | One of three equal or staggered frames |

Images should not be duplicated in the visible page. Decorative background
echoes may use CSS color or texture rather than repeated photographs.

## Page Architecture

The page remains a single route and one native document scroller. It contains
eight narrative chapters plus the opening hero.

### Opening: Hero and Invitation Tag

- Photo 6 fills the opening composition.
- The taped M & M tag overlays the photograph.
- Date and venue remain visible without interaction.
- The primary scroll cue is quiet and textual.
- Navigation is hidden over the opening image and appears after the hero.

### 1. Date and Countdown

- A compact moss chapter follows immediately after the hero.
- It contains the calendar-style date, live countdown, and an “Add to calendar”
  action when a valid target is available.
- This chapter is content-height, not `100dvh`.

### 2. Our Story

- Photo 7 is the main visual.
- Photos 1 and 2 appear as the only rotated memory prints.
- The existing story copy is presented as a readable editorial passage.
- The pinned letter, horizontal mobile carousel, and scroll-reveal runway are
  removed.

### 3. The Garden Path

- The event schedule becomes a visible vertical timeline.
- Photo 3 supports the timeline.
- Times and descriptions are visible by default; guests do not need to tap
  decorative markers to discover essential information.

### 4. Photo Interlude

- Photo 4 spans most or all of the page width.
- This chapter contains at most one short caption.
- Its purpose is pacing: it separates the emotional story and schedule from
  venue logistics.

### 5. When and Where

- Venue name, date, time, address, and map action appear beside Photo 10.
- The current event-details values remain until a separate content pass supplies
  verified replacements.
- The map action is a normal link with an explicit accessible name.

### 6. Memory Strip

- Photos 5, 8, and 9 form a three-image editorial strip.
- Mobile stacks or lightly staggers the frames; desktop uses a balanced grid.
- This strip leads directly into the RSVP chapter.

### 7. RSVP With Love

- The existing RSVP form and validation behavior are preserved.
- The trigger is a strong, visible action in a moss chapter.
- The form may remain a focused modal/sheet so its existing scroll-lock and
  completion flow can be retained.
- The wish wall remains connected to successful RSVP data as it is today.

### 8. FAQ, Wishes, and Closing

- The existing FAQ accordion remains, visually simplified to match the
  editorial page.
- The wish wall and closing message sit before the footer.
- The footer provides the wedding date, venue, back-to-top action, and final
  RSVP reminder without decorative filler copy.

## Responsive Behavior

### Mobile

- Use a single narrative rail.
- Hero photography uses a tall crop with the invitation tag in the lower half,
  clear of faces.
- Alternating photo and information blocks create rhythm without horizontal
  scrolling.
- Navigation contains M & M, a compact menu trigger, and RSVP.
- Information remains visible at 320px without clipped labels or overlapping
  controls.

### Tablet

- Introduce two-column story, schedule, and venue compositions when their copy
  remains readable.
- Keep the navigation compact and allow section links to collapse into the menu
  before they overflow.

### Desktop

- Use a centered editorial grid with a practical maximum content width near
  1280px.
- Allow photographs to occupy asymmetrical two-column spreads.
- Use full-bleed treatment only for the hero and Photo 4 interlude.
- Show direct navigation links for Story, Schedule, Venue, and FAQ plus a
  distinct RSVP action.

## Navigation and Scroll Behavior

- Use native document scrolling with the existing smooth-scroll helper.
- Preserve `scroll-margin-top` so anchored chapters clear the fixed navigation.
- Track the active navigation chapter with the existing
  `IntersectionObserver` approach.
- Update the registered section IDs to match the new meaningful destinations;
  decorative photo chapters are not navigation destinations.
- Remove global `100dvh` rules for content chapters.
- Remove the `175dvh` Our Story height, sticky scene, and associated pinned
  progress calculations.
- Do not introduce a custom scroll container, scroll snapping, or wheel/touch
  interception.

## Motion Design

Motion supports the photographic narrative but never gates content.

- On page load, the hero photograph settles subtly while the invitation tag
  enters with a short fade and vertical translation.
- During normal hero exit, the photograph may scale from approximately `1` to
  `1.04`, the tag may move upward by approximately 24px, and the current petals
  may fade. The hero remains in document flow and does not pin.
- Later photographs use a single in-view opacity/translation reveal, once per
  image group.
- RSVP and FAQ retain their focused transition behavior.
- `prefers-reduced-motion` disables transforms and reveals the complete static
  layout immediately.
- No continuously running decorative animation should remain outside the hero.

## Component Boundaries

The implementation should reuse existing components where their responsibility
still matches the design.

- `src/app/page.tsx` composes the new chapter order.
- `HeroSection` owns the hero image, invitation tag, petals, and countdown
  transition.
- `OurStory` becomes a normal-flow editorial story section.
- `EventDetails` owns the visible timeline and venue chapter, or may be split
  into `ScheduleSection` and `VenueSection` if the resulting component is easier
  to understand than the combined file.
- A small photo-interlude component may be introduced for Photo 4 and the final
  memory strip; it should not become a generalized layout system.
- `GardenNav` keeps section navigation and RSVP access with responsive markup.
- `RSVPForm`, `PlantWishWall`, and `FAQSection` preserve their behavior and
  receive visual changes only where necessary.
- A small server-safe local content object may centralize the couple names,
  date, venue name, navigation labels, and photo metadata so hero, metadata,
  navigation, and footer do not drift.

Obsolete pinned-story utilities, carousel-only components, and their tests
should be deleted once no callers remain. Existing unrelated user changes must
not be overwritten.

## Data and State

- Wedding content and photo metadata remain local, typed data.
- No runtime data fetch is added for the editorial layout.
- Countdown state remains client-side and transitions to its existing
  post-event message at zero.
- RSVP form state and schema validation remain the source of truth for guest
  input.
- A successful RSVP continues to provide the wish wall with the guest’s wish.
- Navigation state continues to derive from observed document sections.

## Failure and Edge Behavior

- Images reserve their aspect ratio so a delayed image does not collapse the
  page. Alt text communicates the image’s narrative purpose.
- If an image fails, its reserved cream or moss surface remains readable and
  adjacent information stays usable.
- The countdown never displays negative values.
- RSVP validation errors remain specific, visible, and associated with their
  fields.
- Modal scroll locking must always be released when RSVP closes or unmounts.
- External calendar and map actions must not block access to the same date,
  time, venue, and address in visible text.
- Reduced-motion mode must not leave content at zero opacity or behind a
  transform.

## Accessibility

- Maintain semantic section headings in document order.
- Keep essential schedule and venue information visible rather than hidden in
  decorative controls.
- Preserve visible keyboard focus and logical tab order.
- Ensure the invitation tag text remains readable over its opaque paper surface.
- Meet WCAG AA contrast for body and action text.
- Give decorative textures and flourishes no accessible name.
- Announce meaningful RSVP success or validation state without announcing
  scroll position changes excessively.

## Performance

- Use the existing optimized display images and `next/image` responsive sizes.
- Give the hero image priority; lazy-load later photographs.
- Avoid duplicate visible image requests and reserve layout dimensions.
- Reuse Framer Motion; do not add another motion or gallery dependency.
- Remove unused pinned-scroll and carousel code after the new layout replaces
  it.

## Verification

### Automated

- Run the existing Node test suite.
- Replace or remove tests for deleted pinned-scroll behavior and retain tests
  for any pure scroll/navigation helpers still used.
- Add focused tests only for new pure logic, such as centralized content/date
  formatting or section navigation mappings.
- Run ESLint and a production Next.js build.

### Browser and Visual

- Review the complete page around 390px, 768px, and 1280px widths.
- Confirm all ten photographs load, crop intentionally, and do not cause layout
  shifts.
- Confirm no horizontal overflow at supported widths.
- Test native scrolling, all navigation anchors, back-to-top, and navigation
  activation.
- Test the hero and image reveals with normal motion and reduced motion.
- Complete RSVP validation, open/close behavior, successful submission, and wish
  display.
- Open and close every FAQ item by pointer and keyboard.
- Verify calendar and map actions once their final destinations are supplied.
- Check console output for runtime errors and hydration warnings.

## Implementation Sequence

1. Centralize approved content/photo metadata and establish the revised visual
   tokens.
2. Restore all chapters to natural document flow and remove obsolete pinned
   scroll behavior.
3. Build the hero, invitation tag, countdown transition, and responsive
   navigation.
4. Recompose Our Story with Photo 7 and the two memory prints.
5. Build the visible schedule, Photo 4 interlude, venue spread, and closing
   memory strip.
6. Restyle RSVP, FAQ, wishes, and footer while preserving behavior.
7. Remove dead carousel/pinned-scroll code and update focused tests.
8. Run automated, responsive, accessibility, motion, and functional
   verification.

## Acceptance Criteria

- The page reads as one continuous photography-led invitation rather than
  separate full-screen slides.
- All ten existing photographs appear once in the approved roles.
- The taped M & M invitation tag is the dominant signature element.
- Essential date, schedule, venue, and RSVP information is readable without
  animation or exploratory taps.
- Mobile and desktop use intentionally different compositions while retaining
  the same content order.
- The existing RSVP, FAQ, wish, countdown, and navigation behaviors continue to
  work.
- Reduced-motion mode exposes the complete page without scroll transforms.
- Tests, lint, and production build pass, with no runtime console errors or
  horizontal overflow in the target viewports.
