# Wedding Follow-up Validation — September 30, 2026

Implementation plan: `docs/superpowers/plans/2026-09-30-wedding-follow-up-improvements.md`.

## Execution ledger

Continued sequentially in the existing feature checkout, preserving the user's uncommitted implementation. Starting tracked diff saved to `/private/tmp/wedding-follow-up-start.patch`. No reset, staging, commits, live RSVP submission, or deployment. Read the installed Next Image and video guides before edits. Reviewed task interfaces before implementation; existing media URLs, chapter structure, invitation dimensions, artwork, and RSVP contracts remain intact.

## Delivered

- Gallery and framed photograph reveal in 0.4 seconds, without gallery stagger or filter animation, beginning 100px before the viewport. Gallery placeholders are static decorative images outside the animated wrapper; loading/failure cannot hide them. Full photographs stay mounted with eager, low-priority requests. Reduced-motion tests verify immediate visibility.
- Guest-name layout prefers word boundaries and falls back to whole graphemes. Width includes the selected font and spacing. Names shrink only when needed; drawing checks the inscription band and fails explicitly instead of silently clipping. Export waits for the selected font with the actual name and checks canvas availability.
- Autoplay and manual retry share a guarded playback path. Rejections retain poster/retry, media errors reload on retry, pending requests cannot duplicate, and late completion cannot update unmounted state. Visibility/page restoration uses the same path. An accessible failure status remains available.
- Final review reproduced a buffered-playback defect: a network `stalled` event hid a still-playing video. Removed that handler; actual buffering (`waiting`) still restores the poster. Added and passed a regression test.
- Added reproducible film/poster preparation script and README instructions. Selected a smaller CRF 25 derivative after first/middle/last-frame comparison and browser playback.
- Updated the 12 confirmed inherited test failures to reflect current chapter/modal wiring, palette, song, photograph assignments, and location behavior. Location, gallery, and playback tests exercise component output/handlers; other existing source assertions remain limited evidence.

## Checks

| Check | Result |
| --- | --- |
| Starting `npm test` | 71/83 passed; 12 inherited failures |
| Final `npm test` | 99/99 passed, no skips |
| `npm run lint` | 0 errors; unchanged React Hook Form compiler warning at RSVPForm.tsx:85 |
| `npx tsc --noEmit --incremental false` | Passed |
| Final `npm run build` | Passed with configured Google Fonts access; production routes contain no temporary QA routes |
| `ffprobe` and MP4 atom inspection | Passed; details below |

Focused gallery, name-layout, and playback tests were observed failing before their fixes and passing afterward. The additional stalled-playback regression was also red before the final fix. Final logs: `/private/tmp/wedding-follow-up-tests.log`, `/private/tmp/wedding-follow-up-lint.log`, `/private/tmp/wedding-follow-up-final-build.log`. A transient corrupted generated development route-types file caused one TypeScript check to fail during concurrent preview/build activity; removed only generated development types and reran the clean production build and TypeScript check successfully.

Starting failures: page renders nine chapters; V4 ending; RSVP action contrast; supporting invitation copy contrast; framed-photo crop; location furniture breakpoint; location image widths; opening audio label; navigation chapters; primary photo assignment; final photo description; song/palette fallback. Expectations conflicted with current approved product content rather than new follow-up behavior. No failing tests were deleted to obtain the final result.

## Actual invitation PNGs

Generated through the production `renderInvitationPng` function using a temporary local QA screen and local file capture, with no live submission. Every file is 1056×1489. Removed that QA screen and capture route before final build. Inspected the actual pixels and mobile accepted-result preview: names remain between the printed messages, Thai marks stay attached, long names wrap, and no toolbar is exported.

| Sample | File |
| --- | --- |
| Short Latin: Pim & Family | [PNG](assets/invitation-sample-0.png) |
| Thai: คุณมิน และครอบครัว | [PNG](assets/invitation-sample-1.png) |
| Mixed: Minnie คุณมิน | [PNG](assets/invitation-sample-2.png) |
| 100 Latin characters: W × 100 | [PNG](assets/invitation-sample-3.png) |
| 100 Thai code units with combining marks: กิ × 50 | [PNG](assets/invitation-sample-4.png) |

[Name-band comparison](assets/name-layout-comparison.png) and [mobile accepted preview](assets/card-short-name.png). AcceptedResult uses the prepared PNG for both preview and download. Native browser blob-download capture timed out in the control tool; local export capture verified the actual PNG, not the native save gesture. iOS touch-and-hold remains untested.

## Film

| Asset | Bytes |
| --- | ---: |
| Starting SDR derivative | 10,716,084 |
| CRF 23 candidate | 9,575,320 |
| Selected CRF 25 candidate | 7,331,435 |

Reduction: 31.6%. The optional ≤6 MB goal was not reached; retained the visually acceptable candidate. Verified H.264, 720×1280 portrait, yuv420p, BT.709 primaries/transfer/matrix, AAC, duration 18.1 seconds. MP4 order: `ftyp`, `moov`, `free`, `mdat`; metadata precedes media. Poster sampled at 1 second from the selected film. Browser observed playing, visible, muted, loop enabled, correct native dimensions and duration at unchanged URLs.

Command used: `node scripts/prepare-wedding-film.mjs /private/tmp/wedding-film-before-follow-up.mp4 --crf 25 --output /private/tmp/wedding-film-crf25`, with FFmpeg 9.0.1, libx264 slow preset, AAC 128k. Original derivative/poster preserved temporarily before replacement. The original pasteboard MOV had expired; matching original was found in Downloads. Installed FFmpeg lacks zscale, so this run recompressed the already validated SDR derivative. The new script supports explicit HDR tone mapping when zscale/libzimg is available and clearly rejects HDR input otherwise; direct HDR conversion was not exercised here. Source MOV remains untouched.

## Browser and original requirements

In-app Chromium checks covered normal/rapid scrolling and immediate gallery navigation, production film playback, opening/top replay, and settled envelope layouts at 375×667, 390×844, and 1440×900. Earlier mobile accepted preview used the development build. Saved evidence: [375 gallery](assets/gallery-mobile-375.png), [desktop gallery](assets/gallery-desktop.png), [375 envelope](assets/envelope-mobile-375.png), [390 envelope](assets/envelope-mobile-390.png), [desktop envelope](assets/envelope-desktop.png).

Original requirements rechecked in final code/tests: envelope's approved bottom positioning preserved; Family before School; name/relation max 100 and note max 500 in form and schema; additional guests restricted to 0–99; supplied clip derivative remains local; theme frame preserved; supplied artwork and centered inscription preserved; active photo eager fetching remains independent of scroll animation. RSVP tests cover accepted/rejected boundaries and declining normalization using fake storage.

## Remaining verification limits

- No production before/after cold-cache timing dataset: the initial production baseline build was blocked by sandboxed font downloads. The available browser control surface exposes no network/CPU throttling or cache-clearing controls, so five comparable cold runs, transfer totals, LCP regression threshold, and measured layout shifts remain unverified. Do not interpret source-size reduction or screenshots as a browser-performance benchmark. Existing eager strategy is retained; there is no measured regression justifying hero-gated fetching.
- Slow/failed gallery responses and reduced motion are covered by component behavior tests; not emulated end-to-end in the browser.
- Safari/iOS, native download/touch-and-hold, end-to-end font/preparation failure retry, real hidden-tab restoration, blocked autoplay, and keyboard retry were not manually verified on devices. Playback rejection/error/cleanup/restoration logic has focused automated coverage, but does not prove every browser's media policy.
- No new external test dependencies or unrelated product redesign. Final review found one concrete playback defect, fixed and regression-tested; no other concrete defect was reported.

## October 1 correction: restore visible scroll reveals

The user reported that the original photo animations appeared absent. Investigation in the running browser showed the 100px early trigger and 0.4-second duration completed the first gallery reveal when only about 7px had entered the viewport. Reduced motion was off. The user approved restoring the original animation character independently of image fetching.

Restored framed-photo `amount: 0.3`, duration 0.9s; gallery `amount: 0.2`, duration 0.75s, index × 0.08s stagger, and saturation 0.6 → 1. Removed the positive observer margins. Retained once-only reveals, reduced-motion handling, eager low-priority fetching, static gallery placeholders, and failure handling. This supersedes the September 30 faster/early animation settings and those checklist expectations.

Two regression tests failed against the early settings before the fix. Final `npm test`: 101/101 passed. TypeScript and diff whitespace checks passed. Lint: no errors, one unchanged React Hook Form warning. No production build rerun for this scoped animation-settings correction.

Browser evidence at 453×853: the framed photo stayed hidden when insufficiently visible, then opacity increased from 0.109 to 0.881 while its top was around 475–465px; the gallery stayed at opacity 0 near the viewport edge, then opacity increased from 0.419 to 0.927 and saturation from 0.767 to 0.971 while clearly visible. Those samples verify actual animation progress rather than only source/configuration. [Restored framed photo](assets/restored-framed-photo.png). No code, content, or media outside these two animation components and their tests was changed for this correction.

### October 1 tuning: 40% visibility, 1.1 seconds

At the user's request, both photo sections now use a 40% visibility trigger and a 1.1-second reveal. Gallery stagger and saturation transition remain, as do eager loading, placeholders, and reduced-motion behavior. Updated regression expectations failed before the change and passed afterward. Full suite: 101/101 passed; TypeScript and diff whitespace checks passed. The browser animation-progress evidence above describes the prior timing; this tuning was verified through the component regression checks.

### October 1 tuning: 35% visibility, 0.95 seconds; gallery history check

At the user's request, both sections now reveal at 35% visibility over 0.95 seconds. Full suite: 101/101 passed; TypeScript and diff whitespace checks passed. Updated threshold/duration tests were observed failing before the code change.

Checked all four saved V4 GalleryChapter revisions (bd5a39a, afb7198, e6af694, a730860) and the captured pre-follow-up diff. The V4 gallery has always used opacity 0 → 1, scale 0.97 → 1, and saturation 0.6 → 1 with index stagger, not an x/y slide. The persistent blurred placeholder added during follow-up makes today's reveal feel different: the image area already contains a blurred photograph before the full-photo fade. No slide effect was added as part of this timing change.

### October 1 enhancement: stronger gallery entrance without additional loading

The gallery now fades in while sliding upward from 48px and settling from scale 1.08 to 1. It keeps the 35% trigger, 0.95-second duration, and index stagger. The static inline blur placeholder is dimmed to 35% opacity so the full-photo reveal has stronger contrast. Removed the animated saturation filter: motion now uses opacity/transform only. No new media requests, dependencies, asset sizes, or delayed loading; eager low-priority full-image fetching and failure placeholders remain. Reduced motion renders immediately with y=0 and scale=1. Framed-photo settings remain unchanged.

Regression expectations failed before the edit, then the full suite passed 101/101. TypeScript and diff checks passed. Lint retains one inherited React Hook Form warning and has no errors. The original browser tab became unresponsive, so visual checks used a temporary fresh tab in the same browser. Actual samples showed opacity increasing 0 → 0.848 and vertical translation decreasing 48px → 7.29px; computed filter stayed `none` throughout. Hover zoom was active during part of this desktop sample. No loading-performance benchmark was performed; the claim is unchanged request/loading configuration and removal of animated filtering, not measured network-speed improvement.

### October 1 correction: zoom only

The user clarified that the dramatic reveal must not slide. Removed vertical translation from normal and reduced-motion gallery settings. Kept scale 1.08 → 1, fade, dim placeholder, stagger, 35% visibility, and 0.95-second duration. Loading configuration stays unchanged. Regression checks rejected the slide before the edit; final suite passed 101/101, with TypeScript and diff whitespace checks passing. This supersedes the preceding slide enhancement. No additional browser check was performed for this removal.

### October 1 preview repair: missing video frame

The running page used `film-frame`/`film-frame-viewport` classes, but its generated stylesheet still contained only the obsolete `retro-player-shell` styling. Live computed styles showed zero padding, zero border/radius, no shadow, and no pseudo-element corner decorations, despite the correct styles existing in `src/app/globals.css`. Refreshing/touching the stylesheet did not invalidate the stale output.

Stopped the verified local preview process in this checkout, preserved `.next/dev` at `/private/tmp/wedding-frame-dev-cache-1790791150142332000`, and restarted the preview with a fresh development cache. After recompilation the browser confirmed 11px frame padding, a 1px blush border, an 18.4px radius, ivory background, layered shadow, and the decorative pseudo-element. No application source changes were required. This establishes stale generated CSS as the frame disappearance cause; the precise original cache invalidation failure remains undetermined.

### 2026-10-01 — New gallery attachments; video attachment unavailable

Replaced gallery photos 1 and 2 with the supplied JPG attachments in order: bench portrait first, lifting portrait second. Preserved original JPGs as `public/photos/display/gallery-1-bench.jpg` and `gallery-2-embrace.jpg`; refreshed the optimization script jobs, WebP derivatives, accessible descriptions, and matching blur placeholders. New asset URLs avoid reusing cached prior photos. Outputs are 1600×2400 / 195,750 bytes and 1500×2400 / 190,082 bytes. Existing reveal animation is unchanged.

Verification: 101/101 tests pass; TypeScript check and whitespace check pass. Browser confirmed both new URLs load successfully and visually confirmed both images in order. Screenshot: `assets/replaced-gallery-2026-10-01.png`.

Video replacement remains pending: the supplied `EA8E30D7-7A67-4AF7-B187-C60D75A8A6C8.mov` clipboard path no longer exists. A focused search of the clipboard items, temporary files, project, and Downloads found no copy. Current film and poster remain unchanged; the new video must be reattached.
