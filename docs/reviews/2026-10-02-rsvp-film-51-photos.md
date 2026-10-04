# RSVP film library — 51 chosen photos

The 50 JPEGs in `/Users/tanakan.pramot/Downloads/Photos-1-001` and the existing `I found you -167.jpg` now form one unique 51-photo library. The library has no extra repeated records to pad it to 60. The original files remain untouched; the new public files are 640×360 WebP derivatives with inline blur placeholders.

## Arrangement and crops

`assets/rsvp-film/photo-manifest.json` records each chosen source, its individual crop, description and scene group. The groups reflect visual review of the originals: close portraits, stone path/pond, lakeside, bench, running, playful moments, flower portraits, detail shots, bridge and grove.

`scripts/lib/rsvp-film-order.mjs` produces a deterministic scrambled sequence, scoring related shots by their circular separation. It also accounts for row offsets and the 16/32-source active-set wrap. The reviewed sequence has no pair from the same group within three positions, including the library seam; related shots also do not meet at the mobile or desktop active-set seam. This is best-effort separation based on human-assigned scenes, not proof of a mathematically optimal visual arrangement. Starting position still varies between visits; the sequence does not reshuffle during playback.

Portrait crops were individually adjusted after inspecting the prepared contact sheet, with special crops for hands, flowers, wide shots and close portraits. Detail and deliberately soft-focus photographs retain their original character.

To regenerate: `node scripts/prepare-rsvp-film-photos.mjs`. If the source folder moves, pass its new path as the first argument. The existing original uses its preserved repository source. Only prepared derivatives and metadata are needed to run the site.

[Prepared crops](assets/2026-10-02-rsvp-film-crops.png) · [Desktop](assets/2026-10-02-rsvp-film-desktop.png) · [Mobile](assets/2026-10-02-rsvp-film-mobile.png)

## Performance and verification

The 51 derivatives total 1,052,414 bytes; the largest is 64,682 bytes, below the 80 KB ceiling. The largest possible 16-source set is 525,288 bytes and the largest 32-source set is 825,746 bytes. These are prepared-file bounds; actual delivered bodies are measured separately below.

Existing limits remain: 16 selected records on mobile, 32 desktop, 8 with Save-Data, and batches of at most four new sources. The full 51-photo library is a pool across visits; the loaded active selection repeats during each visit rather than fetching every photo. Actual layout can display fewer distinct sources than the selection cap.

Production Chrome, DPR 2, 4× CPU slowdown, 1.6 Mbps down / 750 Kbps up / 150ms latency:

| Check | Mobile 390×844 | Desktop 1440×900 |
| --- | --- | --- |
| Film requests before approaching RSVP | 0 | 0 |
| Distinct photos rendered/downloaded | 16 | 27 |
| Delivered image bodies | 140,364 bytes | 474,934 bytes |
| Frame elements | 128 | 96 |
| Scripted RSVP click to two frame callbacks | 49.2ms | 55.9ms |
| Horizontal overflow / page errors | None | None |

These single-run real-photo checks pass the image-transfer and interaction budgets. The click measurement is a synthetic next-paint proxy, not field INP. [Raw loading results](assets/2026-10-02-rsvp-film-loading.json).

Full test suite: 117 passed. Lint: zero errors and the existing React Hook Form warning. TypeScript and production build passed. Tests verify exactly 51 distinct prepared files, the preserved original, dimensions/byte bounds, shipped ordering, separation across both library and active-set seams, and existing lifecycle/loading behavior.

Physical mobile and Safari/iOS validation remain unavailable. Initial-page LCP was not benchmarked again with five-run samples; the earlier initial-page results do not certify the changed library bundle. Sustained resource observations below concern Chrome's JavaScript/DOM/resource metrics, not decoded-image or GPU memory.

## Sustained playback and wrap verification

Completed verification on 2026-10-03. With the real desktop photo selection loaded, a three-minute Chrome observation kept film resource entries at 27. DOM nodes settled from 2,328 to 1,321 and remained there; sampled JavaScript heap was approximately 10.62, 7.78, 8.19 and 7.66 MB, with no monotonic growth. The first 30 seconds produced 1,801 animation-frame callbacks, zero gaps above 25ms (maximum 16.8ms), and no observed long tasks. This is an unthrottled headless desktop observation, not physical-device compositor profiling.

The initial wrap screenshot comparison ran while the independent RSVP card entrance was still settling, so it reported a difference despite identical track transforms. Repeating after all duplicate images had loaded and the card entrance had settled gave byte-identical screenshots, zero differing pixel channels, and identical computed track transforms/phases at time zero and one full period. No product change was needed for that diagnostic result.

[Steady-state samples](assets/2026-10-02-rsvp-film-steady.json) · [Settled wrap comparison](assets/2026-10-02-rsvp-film-wrap.json)
