# RSVP film background — implementation validation

Implemented on `codex/rsvp-film-background`, 2026-10-01. The user requested a local commit and merge into main, preserving v1.4 and tagging this release v1.5. No push or deployment was requested.

## Delivered behavior

Dense, continuous cream film strips cover the entire RSVP visual wrapper. The card, seal, response text and form retain their existing design and behavior. Rows alternate direction with staggered, slow CSS transform loops. Geometry follows the wrapper dimensions rather than hardcoding three rows. Browser tuning uses film opacity 0.78 and a light 0.18 blush wash.

The supplied `I found you -167.jpg` is preserved at `assets/rsvp-film/placeholder-source.jpg`, outside the public directory. Its prepared 640×360 WebP is 14,248 bytes. A 16:9 crop at `cropTop: 0.30` retains both faces and rings. All 60 editable slots share this source and its inline blur placeholder; identical photo files and cache-busting URLs were not created.

To replace the placeholder later, add source/crop entries to `scripts/prepare-rsvp-film-photos.mjs` and run `node scripts/prepare-rsvp-film-photos.mjs`. It regenerates `src/content/rsvpFilmPhotos.json`; the 60-slot library distributes those prepared entries in order. Source images remain untouched. Preparation rejects derivatives above 80 KB and supports portrait and wide landscape sources.

Images load only within 600px of RSVP, at most four new sources per batch. Active selections are capped at 16 mobile, 32 desktop, and 8 with Save-Data. Duplicated frames share image URLs. Failed images retain fixed inline placeholders. Stalled batches stop after 15 seconds; leaving and returning permits a bounded retry, and obsolete callbacks cannot settle the new attempt.

Motion pauses offscreen, in hidden documents, while the form is open, and when manually paused. Reduced motion and Save-Data produce the complete static background. The visible pause control supports keyboard input and stays outside the decorative `aria-hidden` subtree.

## Automated verification

- Full suite: 116 tests passed after implementation and final fallback/fixture coverage (baseline: 101).
- TypeScript: `npx tsc --noEmit --incremental false` passed.
- Lint: no errors; one inherited React Hook Form `react-hooks/incompatible-library` warning in `RSVPForm.tsx`.
- Production build: passed. The sandboxed build initially could not reach Google Fonts; the authorized network-enabled build succeeded.
- `git diff --check`: passed.

Tests exercise real component handlers and effects, pure corner/loop geometry, bounded loading, identical duplicate groups, image failures, stalls/retries/cleanup, manual/modal/visibility pause combinations, reduced motion/Save-Data, missing-observer fallbacks, resize/invalid measurements, the parent RSVP opener/close callbacks, and photo preparation. Synthetic 8-, 48- and 60-photo fixtures confirm fixed frame counts and source caps. Content tests verify future multi-photo mapping rather than silently repeating only the first source.

An independent reviewer identified expired retry deadlines and first-source-only future mapping; both were reproduced and fixed with regression coverage. The review also prompted support for wide landscape preparation, verified with a real Sharp-generated fixture.

## Production browser evidence

Installed Chrome, headless, on the local machine; screenshots use DPR 2. Tested widths 320, 390, 768, 1440 and 2560, initially at heights 844/900. All measured corners have at least 48px of plane clearance, no body overflow, recognizable crops, and one shared loaded photo URL. Browser tests verify movement, retained position while paused, form-open pause, Escape close, focus return, reduced-motion static rendering, and blocked-image fallback. No page errors occurred in the normal-width checks.

[Desktop screenshot](assets/2026-10-01-rsvp-film-desktop.png) · [Mobile screenshot](assets/2026-10-01-rsvp-film-mobile.png) · [Browser results](assets/2026-10-01-rsvp-film-browser-checks.json)

## Performance comparison

Five cold-cache production loads before and after, at 390×844 and 1440×900, DPR 2. Chrome CDP applied 4× CPU slowdown, 1.6 Mbps down, 750 Kbps up and 150ms latency. Initial metrics were sampled before opening the invitation; these measure the initial page/intro, not field INP or the full wedding-page experience. Source and final measurements use the same machine, browser and profile; normal timing variance remains.

| Metric | Mobile baseline → final | Desktop baseline → final |
| --- | --- | --- |
| Median initial LCP | 932 → 904 ms | 896 → 908 ms |
| Initial LCP range | 900–2580 → 892–984 ms | 872–1576 → 908–940 ms |
| Initial CLS | 0.000184 → 0.000184 | 0.000110 → 0.000110 |
| Initial resource transfer | 1,057,299 → 1,010,568 bytes | 2,485,635 → 1,831,262 bytes |
| Initial RSVP photo requests | 0 → 0 | 0 → 0 |
| Incremental RSVP image body | — → 7,002 bytes | — → 13,304 bytes |
| RSVP image requests | — → 1 | — → 1 |

Initial LCP regression is within the greater of 200ms or 10%; additional CLS is zero. Shared-photo transfer is far below the 800 KB mobile / 1.6 MB desktop budgets. Delivered bodies are counted from actual encoded Next Image responses; the optimized URLs contain percent-encoded paths. Initial total transfer decreases because the previous large single-photo RSVP backdrop was removed.

[Baseline measurements](assets/2026-10-01-rsvp-film-baseline.json) · [Final measurements](assets/2026-10-01-rsvp-film-final.json)

## Remaining coverage

Safari/iOS and a physical mobile device are unavailable in this environment. Natural-speed observation of two complete cycles for every row has not been performed; deterministic wrap-boundary and sustained playback results are recorded below. JavaScript heap and DOM samples cannot establish decoded-image or GPU memory. A future genuinely distinct 48–60-photo collection must be measured again for transfer, decoding and mobile smoothness; shared-placeholder results do not certify that future library. Baseline RSVP button-to-next-paint was not captured, so final latency checks have an absolute budget only.

## Final extended checks

- Direct `/#rsvp` navigation, DPR 1/2/3, 320×568, 390×844, 768×1024, 2560×1440, landscape 844×390, and 200% CSS zoom at 1440×900 passed without horizontal overflow. At 200% zoom, geometry expanded to 11 rows to keep the taller wrapper covered. CSS zoom is not a substitute for native browser zoom or a physical orientation-change test.
- Keyboard Space pauses and Enter resumes. Scripted RSVP click to two animation-frame callbacks measured 43–61ms with 4× CPU slowdown after loading settled, within the 200ms target. This timing is a synthetic next-paint proxy, not field INP; these extra checks did not emulate the network profile used for initial-load measurements.
- Delivered photo bodies at DPR 1/2/3 ranged from 4,178 to 13,304 bytes, one request in each tested context.
- Paused screenshots at time zero and one complete period were byte-identical across the moving background, verifying that both groups meet at the loop boundary.
- Three-minute desktop steady-state observation: image-resource count remained one; DOM nodes settled from 2,505 to 1,495 and stayed there. JS heap samples were approximately 9.49, 7.49, 7.41 and 7.98 MB; no monotonic growth was observed. This does not certify decoded-image/GPU memory.
- The first 30 seconds yielded 1,801 animation-frame callbacks, zero gaps above 25ms (maximum 16.8ms), and no observed long tasks. This is an unthrottled headless desktop proxy rather than a physical-device compositor trace. The overall three-minute observer also reported no long tasks.
- The complete-page missing-IntersectionObserver experiment encountered an existing animation-library dependency before the invitation opened. The new RSVP component's missing-IntersectionObserver and missing-ResizeObserver fallbacks are covered by isolated handler tests; full-site support without IntersectionObserver is not established.

[Extended screen/interaction results](assets/2026-10-01-rsvp-film-extra.json) · [Steady-state samples](assets/2026-10-01-rsvp-film-steady.json)

## User-requested adjustment

Removed the visible pause/resume control and manual-pause state. Automatic modal, viewport, document visibility, reduced-motion and Save-Data behavior remains. Updated the existing lifecycle test to verify the absent control and automatic state changes; focused RSVP/gallery/content tests pass (17/17). Swapped the first two gallery records, including matching descriptions and blur placeholders. Earlier manual-control evidence above describes the original implementation before this requested adjustment.
