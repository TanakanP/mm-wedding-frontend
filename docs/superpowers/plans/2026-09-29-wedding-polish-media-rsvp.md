# Wedding Polish, Media, and RSVP Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task after user review. Steps use checkbox syntax for tracking.

**Goal:** Deliver the eight requested envelope, RSVP, video, accepted-card, and image-loading improvements.

**Architecture:** Keep the existing chapters, shared RSVP schema, and accepted-card PNG export flow. Separate photo fetching from scroll reveals; use optimized local media and existing theme tokens.

**Tech Stack:** Next.js 16.2.7, React 19, Framer Motion, React Hook Form, Zod, html2canvas, Node test runner.

**Spec:** The user's eight-item request in this conversation; the proposed decisions below are for review. This is a planning deliverable, not authorization to begin implementation.

## Requirements and proposed decisions

1. “20% bottom” means the settled hero envelope uses `bottom: 20%` instead of its current `25%`, on mobile and desktop. Check the intro handoff for alignment.
2. Relationship remains free text. Its label becomes `Relationship (Family, School, University, Work, etc.)` for either side.
3. Name and relationship have a maximum of 100 characters; note to couple has a maximum of 500. Enforce in both form controls and the shared schema used by the server. Preserve current trimming and minimum-length rules. Use existing JavaScript/HTML string-length semantics consistently.
4. Followers means additional guests: integers 0–99 inclusive, allowing a maximum party of 100 including the respondent. Blank means zero. Declining continues to normalize stale attendance data to zero.
5. Replace the film with the attached clip, preserving the existing muted, looping, inline playback behavior.
6. Proposed frame: warm ivory mat, fine blush double border, discreet champagne corner details, modest rounded corners, and a soft wine-tinted shadow. Keep the portrait video uncropped and remove the heavy dark device-like surround.
7. Use the supplied artwork unchanged and position the live guest name between its two lower messages. Preview and saved PNG must match.
8. Load optimized page photographs before scrolling reaches them; animate on entry. Do not block entry behind a global asset loader. Reserve high-priority loading for the opening screen; do not eagerly download every video, map, or unused photo.

## Findings and constraints

- Read the relevant local Next.js guides before edits: `node_modules/next/dist/docs/01-app/03-api-reference/02-components/image.md` and `node_modules/next/dist/docs/01-app/02-guides/videos.md`. Next.js 16 deprecates `priority` in favor of `preload`; do not combine preload with loading/fetchPriority on the same image.
- `OpeningChapter.tsx` currently sets `bottom-[25%]`.
- Name already has schema maximum 100; relationship is 200; message is 2000. Guest count currently has integer validation without a 99 cap.
- The new MOV is 20,379,579 bytes, 18.1 seconds, HEVC 10-bit HLG HDR, encoded 1920×1080 with 90-degree rotation. Treat it as portrait and tone-map HDR to SDR during conversion.
- Attached card is 1056×1489. Existing card/dialog/export use 1500×2114; update all three consistently rather than stretching the new artwork.
- Gallery sources include approximately 1.8 MB and 2.2 MB PNGs and a 15 MB JPEG. These are source sizes, not measured browser transfer sizes: Next.js serves optimized variants.
- Gallery currently uses default lazy loading and 0.75-second reveals with index delays. This is a likely contributor, not a measured root-cause conclusion.
- The existing photo script only processes numbered JPEGs at 430px; it does not cover the currently named gallery assets.
- Existing gallery tests reference old content/layout patterns. Record the baseline before making changes so stale failures are distinguishable from regressions.

## Review focus

- 99 additional guests accepted; 100, negative values, decimals, and exponent notation rejected for attendance.
- Long Thai/Latin guest names remain within the blank card area in both display and export.
- Portrait rotation and HDR conversion preserve the film's orientation and natural colors.
- Rapid scrolling on a cold mobile connection shows a stable placeholder until photos are ready; no permanent invisible content.
- Short viewports, intro replay, and reduced motion keep the envelope and card usable.

## Task 1: RSVP limits and relationship copy

**Files:** Modify `src/lib/rsvp.ts`, `src/components/RSVPForm.tsx`, and `tests/rsvp-submission.test.mjs`.

**Interfaces:** Preserve `RSVPFormValues`, `rsvpSchema`, `normalizeRsvp`, and `getRelationshipLabel`. Preserve Google Sheets row structure and submission endpoint contract.

- [ ] Run `npm test` and record existing failures before editing.
- [ ] Extend schema tests: name/relation lengths 100 pass and 101 fail; message 500 passes and 501 fails; additional guests blank/0/99 pass, 100/-1/1.5/1e2 fail. Keep valid names above the existing minimum.
- [ ] Extend mocked handler tests to confirm over-limit requests return 400 without calling the storage writer. Test both relationship labels and declining with stale guest count.
- [ ] Run `npm run test:rsvp` and confirm the new boundary expectations fail against current behavior.
- [ ] Set schema maximums to 100/100/500, add the attending-only 99 guest cap with a clear error, and update label copy. Add matching `maxLength` values and numeric `max="99"` to controls. Retain integer validation; HTML attributes alone are insufficient.
- [ ] Run `npm run test:rsvp`; expect all relevant tests to pass. Manually check typing/pasting limits and switching attendance. Use mocked submissions for checks rather than writing test RSVPs to the live sheet.

## Task 2: Envelope final position

**Files:** Modify `src/components/v4/OpeningChapter.tsx`; inspect `src/components/InvitationIntro.tsx` for any matching transition adjustment.

**Interfaces:** Preserve `OpeningChapter({ invitationOpened })` and existing intro callbacks.

- [ ] Change the settled envelope's bottom offset from 25% to 20%.
- [ ] Inspect the complete opening and replay sequence at 375×667, 390×844, and desktop dimensions. Adjust intro transition geometry only if needed to match the new final position.
- [ ] Verify the photo, heading, and envelope do not overlap incorrectly or clip; repeat with reduced motion. Use visual checks for this small layout change.

## Task 3: New film and elegant frame

**Files:** Create `public/videos/wedding-film.mp4` and `public/videos/wedding-film-poster.jpg`; modify `src/components/v4/RetroVideoPlayer.tsx` and `src/app/globals.css`. Inspect parent `src/components/v4/DressCodeChapter.tsx` for spacing.

**Source:** `/Users/tanakan.pramot/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/items/A92CF5F3-84F0-4CE8-849B-7D46692B1460/IMG_8823.mov`.

**Interfaces:** Preserve the current player component and playback contract; no new player library.

- [ ] Convert the source to H.264 MP4 with 8-bit yuv420p, SDR BT.709 tone mapping, correct baked portrait orientation, and fast-start metadata. Start with 720×1280, original timing, CRF 22–24; retain AAC audio while playback remains muted. Inspect output quality before settling compression.
- [ ] Extract a representative poster from the converted video so its orientation and colors match.
- [ ] Update both poster references and source URL; verify the accessibility description matches the actual new footage.
- [ ] Replace the current frame styling with the proposed ivory/blush/champagne treatment. Preserve the 9:16 viewport and `object-contain`; verify neighboring text spacing.
- [ ] Check metadata, first/middle/last frames, full playback, looping, buffering poster, and tab-switch recovery. Confirm Safari/iOS and Chromium behavior where available; record any untested device explicitly. When autoplay is blocked, keep the poster visible and provide an accessible play fallback.

## Task 4: Accepted-card artwork and guest name

**Files:** Create `public/invitations/romantic-keepsake-v2.png`; modify `src/components/rsvp/InvitationCard.tsx`, `src/components/rsvp/InvitationCard.module.css`, `src/lib/invitationExport.ts`, and `tests/invitation-card.test.mjs`. Modify `src/components/rsvp/AcceptedResult.tsx` only if preview sizing requires it.

**Source:** `/var/folders/7l/b1m80mb52yl4zfwxcf2j4gd40000gn/T/codex-clipboard-ff2f59a3-9651-44ec-bdaf-f31f231aec09.png`.

**Interfaces:** Preserve `InvitationCard({ guestName })`, `renderInvitationPng(element): Promise<Blob>`, the existing filename helper, retry/download controls, and touch-and-hold saving.

- [ ] Copy the supplied artwork without modifying its printed text or decorations.
- [ ] Update image dimensions, card aspect ratio, dialog sizing, export clone, and canvas dimensions to 1056×1489. Keep font/image readiness checks in the export path.
- [ ] Start the name area at `top: 61%; left: 19%; width: 62%; height: 12%`, centered in both directions. This places the inscription in the gap around 67% of card height. Tune visually against the actual image, leaving clear space around both printed messages.
- [ ] Keep Thai/Latin font selection and responsive name sizing; verify that wrapping and minimum font sizes fit names up to 100 characters. Match the artwork's wine-colored lettering.
- [ ] Update component tests for the new artwork and dimensions. Render sample cards with short Latin, Thai, mixed-script, 100-character, and unbroken names.
- [ ] Inspect the actual downloaded PNGs and modal at mobile/desktop sizes. Confirm no text collision, clipping, stretching, missing fonts, or exported toolbar. Test preparation failure/retry and reopening for a different name.

## Task 5: Earlier photo loading and responsive reveals

**Files:** Modify `src/components/v4/GalleryChapter.tsx`, `src/components/v4/FramedPhotoChapter.tsx`, `src/components/v4/FinalImageChapter.tsx`, and `src/content/wedding.ts`; audit other active image-bearing chapters and `src/components/InvitationIntro.tsx`. Add `scripts/optimize-page-photos.mjs` and optimized derivatives under `public/photos/display/`. Update `tests/v4-gallery.test.mjs` to current intended behavior.

**Interfaces:** Keep existing photo objects (`src`, `alt`, `objectPosition`) and chapter layout. Use the existing Next Image responsive pipeline.

- [ ] Establish a browser baseline with cache disabled: record opening-image load, gallery request start/completion, scroll-to-visible delay, and layout shifts. Use a production build for final performance comparison; development optimizer timing is not representative.
- [ ] Create a targeted optimization script for active named page photos, leaving originals intact. Use sharp already available through Next only after verifying availability. Generate photo-quality WebP derivatives, preserving crops, with long edge up to 2400px and quality around 82 as starting settings; inspect output at desktop/mobile display sizes. Keep decorative transparency where needed.
- [ ] Point photo content at derivatives and verify `sizes` against actual layout, including full-width gallery images 1/4 and half-width images 2/3.
- [ ] For the small set of active below-fold page photographs, use `loading="eager"` with `fetchPriority="low"` so requests begin on page load while the opening retains priority. Keep the existing hero preload. Do not also preload these photographs or manually fetch their original URLs, which could duplicate responsive requests.
- [ ] Provide small blurred placeholders using generated `blurDataURL` values for dynamic photo paths. Keep image containers dimensioned and the placeholder visible independently of a hidden reveal wrapper.
- [ ] Reduce gallery entry animation to approximately 0.4 seconds, remove the index-dependent delay, and trigger once near the viewport edge (around 100px before entry). Prefer opacity/transform over animated filters. Audit other active photo reveals for equivalent long delays; retain the intended motion style and reduced-motion support.
- [ ] On cold/throttled and warm connections, test normal scrolling, rapid scroll, direct gallery navigation, and replay. Confirm images start fetching before entry, placeholders occupy the right space, and failures never leave an invisible section. Compare hero timing to baseline; if eager photos materially delay it, move below-fold eager promotion until after the opening image loads, with a failure/timeout fallback.
- [ ] Update stale gallery assertions only to match reviewed behavior, and verify current content/order remains intact. Do not claim download latency is eliminated: slow connections still need a graceful placeholder.

## Final verification and handoff

- [ ] Run `npm test`, `npm run lint`, and `npm run build`; distinguish pre-existing failures from regressions and resolve failures introduced by this work.
- [ ] Complete the mobile/desktop, reduced-motion, RSVP boundary, actual PNG export, and video playback checks above.
- [ ] Record before/after browser evidence for loading behavior and transferred media sizes. Report limitations of device coverage.
- [ ] Review the diff for unrelated changes and unused newly added assets. Keep existing assets unless removal is demonstrably safe.
- [ ] Summarize results and provide screenshots/export samples for review. Deployment is outside this plan.

**Recommended execution:** Implement these tasks sequentially in the current session after review, with a final review across the combined changes. RSVP validation is independent; film, artwork, and image loading share media-quality checks and should be assessed together at the end.
