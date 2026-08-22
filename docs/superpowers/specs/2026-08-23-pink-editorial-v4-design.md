# M&M Pink Editorial V4 Design

**Status:** Approved visual direction

**Date:** 2026-08-23

**Reference:** `.superpowers/brainstorm/33502-1787410547/content/pink-continuous-v4.html`

## Goal

Transform the existing M&M wedding website into one uninterrupted, responsive, photography-led invitation based on the approved V4 concept. The page must preserve the current wedding information and RSVP functionality while adopting V4’s pink editorial styling, nine-section order, and coordinated motion.

## Design Direction

The website is a single continuous page. The three strips in the original reference are sequential pieces of that page, not parallel columns or separate scrolling areas.

The visual language combines:

- Dusty pink, blush, ivory, champagne gold, deep wine, and restrained violet.
- Full-bleed photography mixed with invitation-paper components.
- Fine serif and italic display typography paired with the existing readable sans-serif utility type.
- Physical invitation motifs: envelope, wax seal, vinyl record, framed print, palette swatches, map card, QR code, photo strip, and response card.
- Motion that connects components into one story rather than treating every section as an unrelated reveal.

V4 intentionally excludes the additional floral background marks proposed in V5.

## Palette

- Ivory paper: `#FFFAF3`
- Cream background: `#F8EEE9`
- Petal pink: `#EED4D8`
- Dusty rose: `#C7929B`
- Muted rose: `#A9707C`
- Deep wine: `#68414B`
- Dark ink: `#51313A`
- Violet: `#756078`
- Champagne gold: `#BDA56E`

The palette should be implemented as shared theme tokens. Individual components may use transparent variants of these colors, but should not introduce unrelated colors.

## Typography

- Keep the current serif and sans-serif font infrastructure unless implementation reveals a strong technical reason to change it.
- Use the serif face for names, chapter titles, dates, and editorial captions.
- Use italic serif styling selectively for invitation language and major moments.
- Use the sans-serif face for labels, controls, schedule details, form content, and accessibility-critical text.
- Maintain readable contrast and sizing; the decorative reference must not force tiny production text.

## Page Structure

The page contains exactly nine editable visual sections in this order.

### 1. Opening, Countdown, and Song

Use V1’s opening atmosphere and information hierarchy, replacing its static M&M photograph card with V2’s envelope and rising photograph treatment.

Required content and behavior:

- Full-height opening with subdued photographic background.
- M&M names, date, and venue remain visible and readable.
- Envelope and wax seal form the central interactive invitation component.
- The photograph rises from the envelope during the opening sequence.
- Countdown remains directly connected to the opening.
- Replace the cassette component with a rotating vinyl record.
- The vinyl provides the “Listen to our song” control and must expose clear play/pause state to assistive technology.
- Existing first-visit and replay behavior remains available, but the intro and hero should transition as one visual sequence rather than two unrelated screens.

### 2. Together With Our Families

Follow V1’s quiet invitation-card composition:

- Centered M&M names.
- “Together with our families” invitation language.
- Ivory paper, fine inset border, dusty rose text, and champagne-gold ampersand.
- Minimal motion so this section provides breathing room after the animated opening.

### 3. Violet Framed Photograph

Follow V1’s framed-image section while changing the background to restrained violet:

- One dominant portrait photograph.
- Ivory scalloped or deckled frame.
- Violet textured background with subtle depth.
- Small M&M seal accent.
- The framed photograph enters as a single composed object; it must not break into multiple cards.

### 4. Dress Code

Follow V2’s dress-code component:

- “Pink garden formal” heading and practical supporting copy.
- Five color swatches using the approved palette.
- Supporting photograph presented as an editorial print.
- Swatches reveal in a short stagger while the photo enters from the opposite side.
- Dress-code information remains legible without relying only on color.

### 5. The Day Unfolds

Follow V1’s schedule section:

- Deep wine background.
- Champagne-gold connecting path.
- Existing schedule items placed in chronological order around the path.
- Illustrated markers remain decorative; every time and activity must also exist as text.
- The path draws progressively while schedule entries reveal in alternating sequence.

### 6. Full-Width Gallery

Create a new borderless photography gallery:

- Use selected existing wedding photographs edge to edge.
- No Polaroid border, card border, or outer page gutter within the gallery.
- Use an asymmetric editorial grid on larger screens.
- Collapse to a clear two-column and full-width rhythm on small screens.
- Photographs reveal through subtle saturation, scale, and stagger changes.
- Hover motion is optional enhancement only; the gallery must remain complete on touch devices.

### 7. Location, Map, and QR Code

Follow V2’s location section and preserve current venue actions:

- Venue photograph displayed as an editorial print.
- Venue name, address, date, and time.
- Map card with a clear location pin.
- Working “Open location” action using the existing map URL.
- QR code must encode the same map URL and remain large enough to scan.
- Existing calendar action remains accessible nearby even if it is visually secondary.
- The QR code cannot be a decorative imitation in production.

### 8. Final Cinematic Image

Follow V3’s last-image treatment:

- One full-width, borderless photograph.
- Slow, restrained image movement.
- Short editorial caption near the lower edge.
- Dark-to-transparent overlay only as needed for text contrast.
- This section acts as the visual transition into RSVP.

### 9. RSVP Ending

Follow V3’s RSVP composition while retaining the working RSVP flow:

- Layered response card on a pink editorial background.
- M&M seal and small photo strip.
- Existing RSVP action opens the real RSVP interface.
- The RSVP form retains all existing validation, wish-wall behavior, and accessible dialog handling.
- The visual transition should feel like opening or unfolding a response card.
- Footer content, back-to-top, and invitation replay remain available after the RSVP content.

## Motion Choreography

Motion should be coordinated around a small set of repeatable behaviors:

1. **Open:** envelope flap, seal response, and rising photograph.
2. **Connect:** a line, edge, seal, image, or color field visually carries one section into the next.
3. **Reveal:** content enters through short opacity, position, rotation, or scale changes.
4. **Settle:** every component reaches a stable final layout; nothing essential continuously moves.

Continuous animation is limited to the vinyl while music is playing and very slow ambient image movement. Avoid simultaneous looping decoration across the whole page.

Use the existing motion library. Do not add another animation dependency.

## Responsive Behavior

- The nine sections always remain in the same order.
- Desktop expands each composition to use available width; it must not present three separate page strips.
- Tablet uses simplified two-column compositions where space permits.
- Mobile becomes one natural vertical flow with reduced overlap and fewer simultaneous moving objects.
- Full-width photography remains edge to edge at every breakpoint where specified.
- No horizontal document scrolling is allowed.
- Decorative layers may crop at section edges but cannot obscure text or controls.

## Accessibility

- Respect `prefers-reduced-motion` throughout. Reduced-motion mode renders every component in its final state, keeps interactions functional, and removes nonessential movement.
- Preserve keyboard access, visible focus, semantic headings, alternative text, and accessible dialogs.
- Decorative frames, marks, paths, tape, seals, and textures are hidden from assistive technology when they carry no information.
- Song controls expose label, state, and keyboard behavior.
- Schedule and dress-code information cannot depend on illustration or color alone.
- Maintain readable color contrast on pink, wine, violet, and photographic backgrounds.

## Performance

- Continue using optimized display photographs and `next/image`.
- Prioritize only the first meaningful hero photograph.
- Lazy-load below-the-fold images.
- Avoid large canvas effects or new animation packages.
- Prefer transform and opacity animation.
- Keep scroll listeners centralized through existing scroll-progress utilities.
- QR generation should be build-time or lightweight; it must not introduce a large client dependency for one static URL.

## Component Boundaries

Implementation should preserve focused responsibilities:

- Opening invitation, countdown, and song controls.
- Family invitation card.
- Framed photograph chapter.
- Dress-code chapter.
- Schedule journey.
- Borderless gallery.
- Location/map/QR chapter.
- Cinematic image transition.
- RSVP chapter and existing RSVP dialog.
- Shared decorative primitives for paper, seal, frame, and transition treatments.

Content remains sourced from the existing wedding content module wherever possible. Visual components must not duplicate wedding facts as independent hard-coded values.

## Testing and Acceptance

Implementation is complete only when:

- The nine sections appear once, in the approved order.
- Every current wedding photograph remains intentionally accounted for.
- Intro first-visit, returning-visit, and replay flows work.
- Song play/pause state is correct and accessible.
- Countdown remains correct.
- Location, calendar, QR, RSVP, and footer controls work.
- Reduced-motion mode presents stable final layouts.
- Mobile, tablet, and desktop have no horizontal overflow or obstructed controls.
- Unit tests, TypeScript, lint, and production build pass.
- Live-browser review confirms animation, focus behavior, responsive layout, and a clean console.

## Non-Goals

- Do not implement V5 floral marks.
- Do not recreate the original reference’s olive or forest palette.
- Do not turn the page into three columns or independent scroll containers.
- Do not replace the existing RSVP data flow.
- Do not introduce a CMS, new route structure, or new animation framework.
- Do not add unrelated copy, guest-management features, or speculative customization controls.
