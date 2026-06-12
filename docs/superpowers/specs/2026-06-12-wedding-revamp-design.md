# Wedding Website Revamp Design Document

**Date:** 2026-06-12  
**Direction:** Lush Garden Romance (Verdant Harmony palette) + Rich Garden Immersion approach  
**Status:** Design approved by user (aesthetics, content, hero, palette, final sections)

## 1. Overview & Goals

Revamp the existing M & M wedding website to feel more beautiful, colorful, and full of delightful interactive "gimmicks" while staying elegant, romantic, and premium. The site should feel like walking through a lush, living garden.

Key goals from user:
- More beautiful and colorful (avoid muted pastels and generic AI aesthetics)
- More interactive gimmicks (tasteful, not cluttered)
- Creative UX/UI
- Use existing structure and approved content as base, enhance with vivid garden-poetic details
- Fix inconsistencies (e.g. venue names, timing, "Hirouen")
- Keep it focused and performant

Locked approach: Rich Garden Immersion (creative layouts with asymmetry/overlaps, 4-5 signature gimmicks, light but purposeful motion, no heavy new dependencies).

## 2. Aesthetic Foundation (Locked)

### Palette: Verdant Harmony
- Deep Forest: #0c2a1f (accents, text)
- Warm Gold: #b89e68 (highlights, buttons, accents)
- Muted Rose: #c48a7f (romantic accents, links on hover)
- Cream Base: #f7f3eb (main backgrounds — keeps it bright and inviting)
- Sage: #4a664f (subtle textures, borders)
- Dusty Bloom: #a36e6a (soft secondary accents)

This palette is grounded and cohesive (deeper forest greens with warmer neutrals and muted rose) for excellent harmony and readability. Cream base avoids heavy green backgrounds.

### Typography
- Headings & display: Playfair Display (serif, romantic, already in project)
- Body & UI: Warm, distinctive serif (Crimson Pro or similar — characterful, readable, pairs beautifully with Playfair; avoid generic sans like Inter)

### Motion & Interaction Principles
- Blooming reveals: scale + opacity + gentle rotate (feels like flowers opening)
- Petals & particles: subtle canvas or Framer Motion falling petals (rose/jasmine/wisteria) in hero and on key actions (RSVP success, story bloom). Low-cost, responsive to mouse.
- Hover & micro: soft lift, gold glow, tiny petal scatter on cards/buttons
- Staggered & orchestrated: one beautiful page-load sequence, then scroll-triggered delights. Purposeful — every motion has meaning.

### Backgrounds & Textures
Light cream base with subtle botanical textures (soft leaf patterns via CSS/SVG, gentle noise/grain overlays). Layered transparencies and soft gradients for depth without clutter. No solid heavy green backgrounds.

## 3. Content Strategy (Approved)

Enhance existing structure with garden-poetic, vivid language. Keep the three story milestones, date, ceremony + reception split, and FAQ spirit. Unify around "The Garden Hiroen" as the joyful evening celebration.

**Our Story (enhanced examples):**
- 2018 — First Met: "In a hidden rose garden café, surrounded by climbing vines and the scent of jasmine, we talked for hours as golden light filtered through the leaves."
- 2020 — First Trip: "We wandered through misty mountain gardens and planted a young sapling together — the first tree in our shared garden of memories."
- 2024 — The Proposal: "Beneath a canopy of wisteria and stars in our secret garden, with a ring hidden inside a perfect blooming lotus."

**Venues (cohesive garden estate):**
- Ceremony: 3:00 PM — The Rose Chapel in the Sunken Gardens, 123 Blooming Path, New York, NY
- The Garden Hiroen (Reception): 5:30 PM – Midnight — The Grand Orchard Pavilion, 456 Celebration Lane, New York, NY

**Sample Schedule (rendered as tappable garden markers):**
- 2:45 PM — Guests wander the gardens & welcome drinks
- 3:00 PM — Ceremony in the Rose Chapel
- 4:30 PM — Cocktail hour among the flowers
- 5:30 PM — The Garden Hiroen begins in the Orchard Pavilion
- 9:00 PM — Dancing under the stars
- 11:00 PM — Late-night garden lights & wishes

RSVP form logic remains excellent (name, side, relation, attending, guest count, drinks, message). Light garden-themed copy (e.g. "Which side of the garden are you from?").

## 4. Component & Interaction Design

### Hero & Opening
Full-bleed with cream-to-soft gradient. Large elegant "M & M" in Playfair. Falling petals (canvas/Framer) with subtle wind on mouse. Blooming countdown (numbers "open" like flowers, color shifts gently). Smooth scroll prompt with vine animation. Transitions into the garden with a soft upward bloom on first content.

Sticky garden navigation (appears after hero): small logo, flower-icon links to sections, Warm Gold "RSVP" that blooms on hover.

### Our Story — Winding Garden Path
Vertical (or responsive) path with asymmetry. Three milestone cards that "bloom" open on click/scroll (scale + opacity + rotate, soft shadows). Enhanced poetic text. Optional photo placeholders. Sage lines, gold accents on active state.

### Event Details — Illustrated Garden Path
Stylized artistic garden path (SVG or positioned elements with flower/lantern markers). Tap markers to reveal details/schedule. Two main cards (Ceremony & Hiroen) with the locked palette accents. Warm Gold hover states. No literal map — thematic and elegant.

### RSVP & Plant Your Wish
Strong existing modal structure preserved. Themed with palette (cream cards, gold accents, rose touches).
- Success (attending): "Living card" with personalized growing flower illustration + gentle petal shower on "Save Picture" (Warm Gold button). Uses existing html2canvas for download.
- Plant Your Wish Wall: Guest messages appear as planted flowers in a growing visual garden (colorful with muted rose/sage). Local for demo, beautiful animation.
- No-attend: Warm thank-you with blessing note space.

### Garden Whispers (FAQ)
Original 4 questions re-themed with gentle garden language. Accordion with soft bloom animations on open (muted rose & sage). Clean and reassuring.

### Footer
Poetic: "Planted with love • M & M • 5 December 2026 • The Garden Hiroen". Links + subtle textures in palette.

## 5. Overall Structure, Performance & Tech Notes

- Single-page scroll experience with sticky flower nav for easy movement.
- Responsive first (mobile full-bleed hero, stacked cards, touch-friendly markers).
- Motion: Framer Motion (already in project) for most reveals/blooms. Lightweight canvas or Framer particles for petals (no heavy new libs).
- Performance: Low particle count, view-based triggers (framer viewport), no unnecessary re-renders. Cream base keeps contrast high.
- Accessibility: Good contrast on the palette, semantic HTML, keyboard-friendly accordions/modals, alt text for images.
- Content: All enhanced details as approved. Real photos can drop into placeholders later. Bilingual-ready structure preserved where it existed.
- No new heavy dependencies. Build on existing: Next.js, Tailwind, Framer Motion, react-hook-form + zod, lucide-react, html2canvas.

## 6. Key Decisions & Rationale

- **Palette iteration**: Original deep emerald + blush + gold had cool/warm clash and heavy feel. Verdant Harmony was chosen for better cohesion, readability on cream base, and "lush but not scary" green accents (user feedback on green backgrounds).
- **Gimmicks**: Limited to 4-5 high-impact ones that feel native to a garden (petals, blooming, path, living card + wish wall). Avoids clutter while delivering the requested interactivity and delight.
- **Content**: Enhanced existing structure rather than inventing wildly — keeps authenticity while making it vivid and cohesive under "Garden Hiroen" framing.
- **Motion philosophy**: Purposeful and light (blooming, particles on key moments). Matches "elegant but joyful" tone.
- **Scope**: Rich Garden Immersion approach — creative layouts and the signature gimmicks without expanding into many new sections (stays focused).

## 7. Open Items / Next Steps (for implementation)
- Drop in real couple photos into story/event placeholders.
- Decide on exact particle implementation (canvas vs Framer).
- Backend for real RSVP + wish wall (currently local/demo).
- Final copy tweaks after real details.
- Testing on actual devices for particle performance and touch interactions.

## PR Plan

**PR 1: Foundation & Palette**
- Update globals.css with exact Verdant Harmony tokens
- Update layout fonts if needed (Playfair + warm body)
- Basic hero with locked content + falling petals (Framer/canvas)
- Update metadata and title

**PR 2: Our Story & Content**
- Implement winding garden path + blooming cards with approved enhanced text
- Add subtle path visuals (sage lines, gold dots)

**PR 3: Events & Garden Path**
- Illustrated garden path component with tappable markers
- Updated event cards and sample schedule
- Cohesive "Garden Hiroen" language

**PR 4: RSVP & Wish Wall**
- Enhance existing modal with palette and garden theming
- Living invitation card with growing flower + petal effects
- Plant Your Wish wall (animated garden of messages)
- "Save Picture" with html2canvas (already present)

**PR 5: Polish & Remaining**
- Garden Whispers FAQ with bloom animations
- Sticky flower nav + footer
- Final motion refinements, responsiveness, accessibility pass
- Any small copy or visual tweaks

All PRs should be independently reviewable. Test motion and particles on mobile.

---

**Full design approved by user on 2026-06-12.** Ready for implementation planning.