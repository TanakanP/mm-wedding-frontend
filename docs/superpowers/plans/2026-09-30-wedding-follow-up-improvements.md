# Wedding Follow-up Improvements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking. This document is a planning deliverable; begin implementation after the user asks to execute it.

**Goal:** Close the remaining plan gaps in photo reveals, guest-name exports, video recovery, and release verification.

**Architecture:** Build on the current uncommitted implementation. Keep photo fetching separate from reveal animation, extract a small testable guest-name layout function from the custom canvas exporter, and consolidate video playback error handling. Preserve the existing chapter structure and media design.

**Tech Stack:** Next.js 16.2.7, React 19, Framer Motion, TypeScript, html2canvas, Node test runner, FFmpeg/ffprobe.

**Spec:** `docs/superpowers/plans/2026-09-29-wedding-polish-media-rsvp.md`, plus the reconciliation findings in this conversation. This follow-up addresses gaps; it does not repeat already aligned work.

## Global Constraints

- Read the relevant guides in `node_modules/next/dist/docs/` before product-code edits. In particular, read the Image and video guides; do not use deprecated Next.js Image `priority`.
- Preserve the 20% envelope position, Family-before-School label, 100/100/500 field limits, and 0–99 additional-guest validation.
- Preserve the attached artwork unchanged, 1056×1489 PNG output, and the ivory/blush/champagne video frame.
- Preserve muted, looping, inline video playback and the accepted modal's download, retry, and touch-and-hold behavior.
- Keep original media; optimize derivatives. Do not eagerly load every video, map, or unused asset.
- No global loading screen, live test RSVP submissions, deployment, or unrelated redesign.
- Existing work is uncommitted. Record the starting diff and preserve it; never reset or overwrite it to obtain a clean baseline.

## Review Focus

1. Cold or failed photo requests: a stable placeholder stays visible independently of reveal opacity (Task 1).
2. Fast scrolling and reduced motion: no stagger-induced blankness or permanently hidden content (Task 1).
3. Thai combining marks, emoji sequences, and long unbroken names: no split graphemes, lost text, or text outside the inscription area (Task 2).
4. Repeated playback rejection and media errors: poster and usable retry remain, without unhandled promises (Task 3).
5. Old failing tests and unavailable font downloads: distinguish genuine regressions from stale assertions and environment blockers (Task 5).

## Starting Evidence

The September 30 review found 71/83 tests passing, with all 12 failures also present in committed HEAD. HEAD had 13 failures; the implementation updated one stale gallery test. Lint had no errors and one React Hook Form compiler warning. TypeScript passed. Production build failed because Google Fonts could not be fetched.

Four gallery source files total 468,144 bytes after optimization, versus 21,338,734 bytes before. This is a source-size comparison, not a measured browser transfer comparison. The film is 10,716,084 bytes, 18.1 seconds, portrait H.264/AAC with SDR BT.709 metadata and fast-start layout.

Re-run checks at execution time; these numbers describe the review, not a future verification result.

## Task 1: Responsive Photo Reveals and Independent Placeholders — Highest Priority

**Files:** Modify `src/components/v4/GalleryChapter.tsx`, `src/components/v4/FramedPhotoChapter.tsx`, and `tests/v4-gallery.test.mjs`. Inspect `src/components/v4/FinalImageChapter.tsx`, `src/components/v4/RSVPChapter.tsx`, and `src/components/InvitationIntro.tsx` for loading regressions. Record evidence in `docs/reviews/2026-09-30-wedding-improvements-validation.md`.

**Interfaces:** Preserve photo objects (`src`, `alt`, `objectPosition`, `blurDataURL`), chapter layout, and responsive `sizes`. Preserve hero preload and low-priority eager fetching for active below-fold photographs.

- [ ] Record the current implementation's production-browser baseline before changing reveal behavior: hero load timing, gallery request timing, time to visible content, transferred bytes, and layout shifts. If production build is blocked, record that blocker; do not substitute development measurements as production evidence.
- [x] Replace gallery assertions that require 0.75-second reveals, index delays, and animated saturation. Pin the intended values: duration 0.4 seconds, no index delay, `viewport={{ once: true, amount: "some", margin: "100px 0px" }}`, and opacity/transform-only entry. Use an exported configuration only if it helps reuse; do not create a new framework for these values.
- [x] Run `node --test tests/v4-gallery.test.mjs`; confirm expectations distinguish current behavior from the plan before updating the component.
- [x] Render a static low-resolution placeholder behind each gallery photo, outside its motion wrapper, using the matching object position. Give this duplicate decorative content an empty alt/aria-hidden. Keep it while loading or on failure; remove or cover it only once the full image is decoded and revealed.
- [x] Keep Next Image's full photo mounted so eager fetching begins immediately. Track readiness/failure locally and ensure failure cannot remove the placeholder. Do not create a second network request for the full photo.
- [x] Apply the 0.4-second entry without stagger or filter animation. Reduced motion must render visible content immediately. Apply the same shorter entry/early trigger to the framed photo while preserving its approved layout; keep final-image scroll scale unless measurements identify a problem.
- [ ] Run the gallery test and visually verify normal scroll, immediate gallery navigation, rapid scroll, slow image responses, failed image responses, and reduced motion at 375×667, 390×844, and 1440×900. Acceptance: a placeholder occupies each image area before full content appears, no layout shift from image arrival, and no permanently blank photo.
- [ ] Compare five cold-cache runs with the baseline using identical viewport, network, and CPU settings. Record medians and range. If hero load time worsens by more than 10% consistently, promote below-fold photos to eager loading only after the hero load/error event, with a 3-second fallback. Otherwise keep the simpler existing eager strategy.

## Task 2: Reliable Guest-name Layout and Real Export Verification — Highest Priority

**Files:** Create `src/lib/invitationNameLayout.ts` and `tests/invitation-name-layout.test.mjs`; modify `src/lib/invitationExport.ts` and `tests/invitation-card.test.mjs`. Inspect `src/components/rsvp/InvitationCard.tsx`, `src/components/rsvp/InvitationCard.module.css`, and `src/components/rsvp/AcceptedResult.tsx` for display/export consistency.

**Interfaces:** Preserve `renderInvitationPng(element: HTMLElement): Promise<Blob>` and `InvitationCard({ guestName })`. New pure interface:

`layoutInvitationName(text: string, isThai: boolean, measure: (text: string, fontSize: number) => number): { lines: string[]; fontSize: number; lineHeight: number }`.

The measuring callback consumes the exact selected font and letter spacing. Layout uses width `1056 * 0.62`, vertical band from `1489 * 0.61` to `1489 * 0.73`, and existing initial sizes 6%, 3.2%, or 2.3% of card width for name lengths ≤35, 36–70, or >70. Keep the final center at 67% card height.

- [x] Add meaningful layout tests using deterministic measurement callbacks: short names, multiword Latin, Thai combining marks, mixed scripts, joined emoji, and 100-character unbroken names. Assert non-whitespace text is preserved, no line begins with a detached combining mark, grapheme sequences stay intact, measured line widths fit, and the text block fits the designated band.
- [x] Run `node --test tests/invitation-name-layout.test.mjs`; confirm it fails before the new layout function exists.
- [x] Extract layout from the exporter. Segment wrapping units with `Intl.Segmenter` using grapheme granularity; prefer word boundaries, and fall back to grapheme boundaries for unbroken names. Measure every candidate after carrying a word to the next line. Include letter spacing in measurement before wrapping.
- [x] Keep current initial font sizing and reduce only as necessary, with an 18px minimum for valid RSVP names. If the measured block cannot fit, throw an export error rather than silently clipping. Use the same band/center constants for drawing; retain artwork/font readiness and cleanup on failure.
- [x] Explicitly await the selected guest font with the guest-name text before drawing, rather than relying solely on `document.fonts.ready`. Check canvas context availability and report preparation failure if drawing is unavailable.
- [x] Run `node --test tests/invitation-name-layout.test.mjs tests/invitation-card.test.mjs tests/invitation-filename.test.mjs`; expect relevant tests to pass. Do not treat markup-presence tests as evidence of visual fit.
- [x] Generate actual 1056×1489 PNGs through the real export flow for short Latin, Thai with combining marks, mixed script, 100-character Latin, and 100-character Thai names. Inspect at native size and mobile display size: glyphs intact, no collision with either printed message, clear side margins, and no toolbar in the PNG.
- [ ] Verify the accepted preview and saved file use the same prepared PNG. Verify reopening with a different name, preparation failure, retry, and touch-and-hold saving where supported. Use locally mocked submission data; record screenshots/export samples in the validation report.

## Task 3: Video Playback Recovery — High Priority

**Files:** Modify `src/components/v4/RetroVideoPlayer.tsx`; create `tests/video-playback.test.mjs` if recovery behavior can be exercised with the existing React test approach. Preserve `src/app/globals.css` frame styling.

**Interfaces:** Keep `RetroVideoPlayer()` and media URLs. Consolidate autoplay and button retry into one guarded async playback path with success/rejection updating `isVideoVisible` and `needsGesture` consistently.

- [x] Exercise a rejected autoplay attempt followed by a rejected manual attempt using a fake video element. Assert both rejections are handled, the poster remains visible, and the play button remains available. Add successful retry, media error, and unmount-during-pending-play cases. Use the existing component-test tooling rather than introducing a browser test dependency just for this task.
- [x] Run the focused test and confirm it catches the missing rejection handling in the button path.
- [x] Route all play requests through the guarded helper; catch manual retry failures, prevent duplicate pending play attempts, and prevent late state updates after cleanup. On a media error, retain poster and retry; retry must reload a failed source before playing.
- [ ] Verify hidden-tab/page restoration and stalled playback; retain the poster fallback until playback resumes. Add a concise accessible status for persistent playback failure, without requiring a modal or changing the frame design.
- [x] Run the focused tests and manually check blocked autoplay, click retry, missing video, buffering, loop, tab switching, and keyboard activation in Chromium and Safari/iOS where available. Explicitly record untested browsers/devices.

## Task 4: Reproducible Video Optimization — Quality Improvement

**Files:** Create `scripts/prepare-wedding-film.mjs`; regenerate `public/videos/wedding-film.mp4` and `public/videos/wedding-film-poster.jpg` only after quality comparison. Add usage to `README.md`.

**Interfaces:** Script accepts a local source path as its command-line argument; writes only the named derived film/poster assets. Existing component URLs remain stable.

- [x] Implement a reproducible FFmpeg conversion preserving the 18.1-second clip, baked portrait orientation, 720×1280 output, H.264 8-bit yuv420p, HLG-to-SDR BT.709 tone mapping, AAC audio, and fast-start metadata. Invoke child processes with argument arrays, not interpolated shell strings.
- [x] Generate candidate encodes in a temporary directory using CRF 23 and 25 with a slow preset. Target ≤6 MB as an optimization goal, not a reason to accept visible degradation. Retain audio because the original plan requires it, though playback stays muted.
- [ ] Compare candidates against the current derivative at first/middle/last frames and through full playback, including foliage, skin tones, movement, and gradients. Choose the smallest candidate with acceptable quality; if none meets the size goal, retain the better-quality asset and record its size.
- [x] Generate the poster from the chosen conversion. Use ffprobe to verify duration, codecs, dimensions, and color metadata; inspect MP4 atom ordering to confirm metadata precedes media data. Verify playback at the unchanged URL.
- [x] Document the input command, FFmpeg version, conversion settings, poster time, and before/after size. Preserve the source and existing derivative until the replacement has passed inspection.

## Task 5: Verification Debt and Final Review — Completion Gate

**Files:** Modify only stale assertions in `tests/editorial-structure.test.mjs`, `tests/v4-ending.test.mjs`, `tests/v4-invitation-chapters.test.mjs`, `tests/v4-location.test.mjs`, `tests/v4-opening.test.mjs`, and `tests/wedding-content.test.mjs` after checking their intended behavior. Complete `docs/reviews/2026-09-30-wedding-improvements-validation.md`.

**Interfaces:** Keep current product contracts and the Node test runner. Do not revert newer features just to satisfy obsolete source-string assertions.

- [x] Re-run `npm test` at the start of execution and list exact failures. For each baseline failure, compare the expectation with current code, the original plan, and existing design documents. Identify stale expectations separately from actual product defects; unresolved design conflicts stay explicitly recorded.
- [x] Update confirmed obsolete expectations, including removed FAQ/navigation content, current photo assignments, and current song configuration. Replace brittle class/source-string checks with behavior assertions where feasible. Never delete a failing test merely to make the suite green.
- [x] Run `npm test`, `npm run lint`, and `npx tsc --noEmit --incremental false`. Acceptance: no new failures or warnings; fully clean tests after confirmed test debt is repaired. Report any unresolved inherited failure by name.
- [x] Run `npm run build` with Google Fonts access available. If network access still blocks it, report build unverified and preserve the existing font setup. Bundling local fonts is a separate optional improvement, not a mandatory redesign for this task.
- [ ] Validate envelope opening/replay at 375×667, 390×844, and desktop sizes, with reduced motion. Smoke-test RSVP limits and declining normalization using mocked storage. Reconfirm the eight original requirements against the final diff.
- [x] Complete the report with before/after timing evidence, exact commands/results, card exports, film sizes, screenshots, and browser/device coverage. Record measurements from this follow-up's starting implementation; do not present them as a pre-Grok baseline.
- [x] Review the combined diff, including the original uncommitted implementation, for unused assets, accidental changes, and missing coverage. Mark original-plan checklist items complete only when evidence supports them; leave blocked checks explicitly unresolved.

## Recommended Execution and Acceptance

Implement sequentially in the current session: Tasks 1 and 2 first, Task 3 next, Task 4 after playback is reliable, and Task 5 last. No reimplementation of the aligned RSVP/design work is needed.

Completion requires visible loading placeholders, responsive non-staggered reveals, grapheme-safe name layout with inspected PNG output, recoverable playback rejection, and a documented verification result. Smaller source files or passing source-string tests alone do not prove these outcomes.

## Execution outcome — September 30, 2026

Implementation delivered and automated checks passed (99 tests, TypeScript, production build; lint retains one inherited warning). See `docs/reviews/2026-09-30-wedding-improvements-validation.md` for inspected PNGs, media metadata, screenshots, and exact scope. Unchecked mixed/manual steps retain verification gaps: comparable cold-cache production measurements, browser failure emulation, and Safari/iOS save/playback coverage. Film recompression used the validated SDR derivative because installed FFmpeg lacks zscale; direct HDR conversion remains unverified. No live submissions, deployment, or commits.
