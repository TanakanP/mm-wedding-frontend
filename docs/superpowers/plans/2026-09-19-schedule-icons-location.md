# Schedule Icons and Real Venue Map Implementation Plan

**Goal:** Refine the schedule illustrations and replace the placeholder venue presentation with the actual venue, responsive Google map, and working directions link and QR code.

**Architecture:** Keep the existing section components and shared WEDDING content. Add one small SVG illustration component for schedule artwork; reuse qrcode.react for the QR code and a standard iframe for Google Maps. No new dependencies or API key.

**Tech stack:** Next.js, React, Tailwind CSS, Framer Motion, inline SVG, qrcode.react.

**Design source:** User requirements in this task, September 19, 2026. This document is the proposed implementation plan; no application changes have been made.

## Constraints

- Lightweight personal-site work: visual review and basic code checks, no added automated tests or broad test runs.
- Preserve current workspace changes. Commit only when requested.
- Read applicable local Next.js documentation before implementation.
- Keep the existing schedule times, centered layout, title, and event labels.
- Preserve the requested heading exactly: `WHERE FOREVER BEGIN`.

## Task 1: Elegant schedule illustrations

Files: create `src/components/v4/ScheduleIllustration.tsx`; modify `src/components/GardenPath.tsx`.

- [ ] Replace the current unrelated stock icon arrangements with a coordinated pair of fine-line SVG illustrations, matching the romantic printed-invitation style.
- [ ] First event: a serving cloche with a small camera alongside its lower right edge, composed as one illustration. The cloche communicates feast; the camera remains clearly identifiable.
- [ ] Second event: two gently tilted champagne flutes with a small sparkle above the meeting point. Replace the party popper.
- [ ] Use a shared 96 × 72 SVG viewBox, `fill="none"`, `stroke="currentColor"`, consistent stroke width around 1.4, and rounded stroke caps/joins. Render around 80 × 60px on mobile and 96 × 72px on desktop in the existing champagne-gold accent.
- [ ] Export `ScheduleIllustration({ kind }: { kind: "feastPhotography" | "reception" })`. Reuse the existing item.icon keys so shared content does not change.
- [ ] Keep illustrations decorative with `aria-hidden="true"`, no enclosing circle, no connector line, and no new animation. Retain the current reduced-motion-aware entry reveal.
- [ ] Remove the existing detached star separator; use spacing between the events so the two illustrations carry the decoration.
- [ ] Visually check recognizability and consistent weight on mobile and desktop, especially the small camera details.

## Task 2: Actual venue content and directions data

File: modify `src/content/wedding.ts`.

- [ ] Set the venue name to `US Wedding & Event VENUE` and address to `Khlong Khwai, Sam Khok, Pathum Thani`.
- [ ] Set `WEDDING.venue.mapUrl` to `https://maps.app.goo.gl/WSErDmemgpuem54U9`.
- [ ] Add `WEDDING.venue.mapEmbedUrl` with this exact URL, extracted from the user's iframe (not the Markdown brackets):

```text
https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3869.606763303097!2d100.47448461109575!3d14.100375589069891!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x30e27d8e5801262b%3A0xbd0cf5d1c8df6f8a!2sUs%20Wedding%20%26%20Event%20VENUE!5e0!3m2!1sth!2sth!4v1789834939731!5m2!1sth!2sth
```

- [ ] Remove the placeholder receptionName field and its location rendering after confirming there are no other consumers. The fictional `The Grand Orchard Pavilion` should not appear beside the real venue.
- [ ] Keep date and time in shared content: remove their display only from the location chapter, as requested.
- [ ] Review existing shared venue-name consumers: metadata, RSVP form/card, and footer automatically inherit the actual venue name. No unrelated copy rewrite.

## Task 3: Responsive location chapter

File: modify `src/components/v4/LocationChapter.tsx`.

- [ ] Remove the entire PHOTOS[10] figure, its `Meet us in the garden` caption, and unused Image/PHOTOS imports. Keep the photo asset because other site sections may use it.
- [ ] Replace `Where we gather` with `WHERE FOREVER BEGIN`. Keep the main `Location` heading.
- [ ] Show only the real venue name and address beneath the heading; remove the repeated date/time block and fictional reception subtitle.
- [ ] Replace the old photo/detail split with a centered container around 64rem. Put heading and venue copy above a map-and-QR card. On small screens stack map then QR; on desktop place a broad map on the left and a compact QR area on the right.
- [ ] Remove the CSS placeholder map and MapPin import. Insert the real map using the supplied embed URL with these React attributes:

```tsx
<iframe
  src={WEDDING.venue.mapEmbedUrl}
  title="Map to US Wedding & Event VENUE"
  width="400"
  height="300"
  className="block h-[300px] w-full border-0 md:h-[380px]"
  allowFullScreen
  loading="lazy"
  referrerPolicy="strict-origin-when-cross-origin"
/>
```

- [ ] Place the iframe inside a `min-w-0` map column so it cannot overflow a narrow screen. Style only the surrounding card with cream paper, a restrained wine/gold edge, and a light shadow; keep the map readable without color filters.
- [ ] Continue deriving locationUrl through the existing getLocationUrl helper, now using the supplied mapUrl. Pass that same locationUrl into QRCodeSVG and the link.
- [ ] Remove the previous Open location placement below the map. Replace the `Scan for directions` paragraph directly below the QR with the single `OPEN LOCATION` anchor, linked to locationUrl, opening in a new tab with `rel="noopener noreferrer"` and visible keyboard focus styling.
- [ ] Keep the QR around 144px with its quiet margin and existing dark-on-light contrast. Give it a descriptive title. The link remains accessible even when the embedded map is unavailable.
- [ ] Preserve optional calendar-link behavior only if configured; do not introduce an extra button while calendarUrl is null.

## Lightweight verification

- [ ] Check at approximately 375px and 1280px: no horizontal overflow; clear icons; map fills its column; QR and the link remain readable and aligned.
- [ ] Confirm the iframe loads the supplied venue and that its src is the exact embed URL. If network restrictions prevent loading, report that limitation instead of substituting a mock map.
- [ ] Confirm OPEN LOCATION's href and QRCodeSVG's value both equal the supplied short URL. Scan the rendered QR if a decoder is already available; no added dependency just for this check.
- [ ] Confirm the removed photo/caption, placeholder address, reception subtitle, and location date/time are absent.
- [ ] Run `git diff --check` and `./node_modules/.bin/tsc --noEmit` once after edits. Show the result in the running preview for user review.
