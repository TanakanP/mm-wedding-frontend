# Invitation, Gallery Frame, and Dress Code Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task in the current conversation. Keep the user's lightweight, feature-first workflow; visually review each section with the user.

**Goal:** Personalize the three sections immediately after the countdown and vinyl player: a wide invitation banner, an upright gallery portrait over a tinted photograph, and a seven-color dress-code section with a retro video player.

**Architecture:** Keep the existing section components and content configuration. Add a small video component only to isolate playback controls and the retro frame. Use CSS for borders, tint, and ornamentation; no new UI or animation dependencies.

**Tech Stack:** Next.js 16.2.7, React 19, Tailwind CSS, Framer Motion, native HTML video, FFmpeg for local media preparation.

**Spec:** User's September 15 request in this conversation, with the proposed design and copy below. This is a plan for review, not authorization to implement new code during the planning turn.

## Global constraints

- Personal website: prioritize visible features and quick manual checks, not additional test infrastructure.
- Scope: `families`, `framed-photo`, and `dress-code`; preserve section IDs and navigation.
- Preserve the user's existing countdown, vinyl player, song, and other working-tree changes.
- Read relevant guides in `node_modules/next/dist/docs/` before implementation, particularly styling, images, and video guidance if present.
- Use existing fonts and cream, wine, and gold accents. Keep reduced-motion behavior for new animations.
- Proposed wording, background photo, and retro styling below are defaults to review with the user.
- Do not change global `WEDDING.couple` from `M & M`: add invitation-specific names so the established monogram elsewhere stays intact.

## Task 1: Wide invitation banner

**Files:** `src/content/wedding.ts`, `src/components/v4/FamilyChapter.tsx`, and scoped styles in `src/app/globals.css` if needed.

**Design:** A wide cream/paper banner with restrained gold rules, generous horizontal space, and content-driven height. Replace the current tall bordered card and its 68/76svh minimum heights. On desktop use approximately `max-w-6xl`, `py-12 md:py-16`; allow names to stack gracefully on narrow screens.

**Proposed content:**

Small line: `Together with our families`

Names: `Natthida` — decorative interlocking rings — `Tanakan`

Body: `Beneath an enchanted sky, where two paths become one, we invite you to share in the magic of our wedding day. Join us for a celebration of love, laughter, and the beginning of our forever.`

Last line: `#MeenToBeWithMi`

- [ ] Add `WEDDING.invitation` with `brideName`, `groomName`, `message`, and `hashtag` containing the exact values above.
- [ ] Replace the initials split in `FamilyChapter` with the new invitation names, bride first. Set the heading's accessible name to `Natthida and Tanakan`.
- [ ] Use two overlapping gold outlined circles as a small decorative ring motif between names, hidden from assistive technology. Keep the rings between the names when the layout stacks.
- [ ] Replace the short invitation sentence with the proposed fantasy-inspired copy; constrain body width to around 42rem for readability.
- [ ] Place the hashtag last, clearly legible and visually quieter than the names.
- [ ] Remove the tall card/min-height treatment; retain only a subtle entrance fade and restrained border ornaments.
- [ ] Preview at 375px and 1280px: names fit, rings remain visible, hashtag is last, and desktop reads as a banner rather than a square card.

## Task 2: Photograph backdrop and upright gallery frame

**Files:** `src/components/v4/FramedPhotoChapter.tsx`, `src/app/globals.css`.

**Design:** Use existing `PHOTOS[6]` as a full-section background, with `#756078` laid over the photograph at 28% opacity. Keep `PHOTOS[7]` as the central portrait. The tint opacity applies only to the overlay, never the foreground photograph or entire section.

- [ ] Make the section `relative isolate`; add a decorative background `Image` with `fill`, `sizes="100vw"`, `object-cover`, and empty alt text.
- [ ] Add an absolute violet overlay using `backgroundColor: "#756078", opacity: 0.28`; layer the central figure above it. Keep a violet fallback while the background loads.
- [ ] Replace the scalloped treatment with a straight art-gallery frame: slim muted walnut/gold outer edge, subtle inner bevel, and a generous warm ivory mat (roughly 16–20px mobile, 28–36px desktop).
- [ ] Remove `rotate` from both initial and final animation values. Keep an optional gentle fade/scale reveal that settles at scale 1.
- [ ] Delete the bottom M&M medallion and its space allowance.
- [ ] Keep the portrait upright with its existing crop as the starting point. Update image `sizes` to reflect the new mat and frame widths.
- [ ] Remove the old scalloped CSS only if a repository search confirms it has no remaining consumer.
- [ ] Preview mobile and desktop: background is recognizable, violet tint is subtle, central photo stays clear, and there is no rotation or seal at any animation stage.

## Task 3: Seven-color dress code and retro video

**Files:** `src/content/wedding.ts`, `src/components/v4/DressCodeChapter.tsx`, new `src/components/v4/RetroVideoPlayer.tsx`, `src/app/globals.css`, new assets under `public/videos/`.

### Palette and copy

Colors sampled from the centers of the seven reference swatches, left to right. These are image-derived approximations rather than an original brand palette specification.

| Name | Hex |
| --- | --- |
| Apricot Peach | `#F5C19E` |
| Petal Blush | `#E3C8C0` |
| Mist Grey | `#C2C2BB` |
| Champagne Sand | `#E1D1BA` |
| Buttercream Yellow | `#ECDFA6` |
| Blue Mist | `#C3CECD` |
| Soft Sage | `#B4C1AE` |

Title: `An Enchanted Garden Palette`

Description: `Dress in the gentle colors of our enchanted garden: apricot peach, petal blush, mist grey, champagne sand, buttercream yellow, blue mist, or soft sage. Choose a shade you love and join us in soft, romantic elegance.`

- [ ] Replace `WEDDING.dressCode.title`, `description`, and `colors` with the values above.
- [ ] Render circular swatches with ivory/white rims to echo the reference. Show each name and hex below its swatch, using wine text for legibility.
- [ ] Use a responsive swatch grid: four columns then three centered on narrow layouts; seven in a row only where all labels fit comfortably. Avoid squeezing seven full labels into the current half-width desktop card.
- [ ] Keep the existing two-column dress-code/video relationship on sufficiently wide screens; stack the video below the palette on smaller screens. Move the two-column breakpoint to `lg` if necessary to avoid cramped content at `md`.

### Media preparation

Source: `/Users/tanakan.pramot/Library/Group Containers/group.com.apple.coreservices.useractivityd/shared-pasteboard/items/2DD135CC-BB14-48A5-BCD0-5CC3D7E7CA78/IMG_8823.mov`.

Inspected properties: 18.1 seconds, approximately 20.4 MB, HEVC video with AAC audio, encoded 1920×1080 with 90-degree rotation metadata; displayed portrait 9:16. HDR HLG/BT.2020 color metadata. A frame at 3 seconds shows the couple beside a lake; preserve portrait orientation and avoid cropping the couple.

- [ ] At implementation time, convert the source to `public/videos/garden-memory.mp4` with H.264, yuv420p, fast-start metadata, no audio, and a 720×1280 target. Preserve the full 18.1-second clip and upright orientation.
- [ ] Tone-map HLG to SDR/BT.709 during conversion; do not merely relabel the HDR color space. Check FFmpeg's available `zscale` and `tonemap` filters first. Use autorotation once and inspect the output dimensions to avoid double rotation.
- [ ] Extract an upright SDR poster from the converted clip at 3 seconds as `public/videos/garden-memory-poster.jpg`.
- [ ] Compare the poster and video with the original for natural skin/foliage color and correct orientation. Aim for a few MB without visibly degrading the couple; do not ship the original MOV as the only browser source.

### Player and styling

- [ ] Create `RetroVideoPlayer` using the prepared local MP4 and poster. Use a native `<video muted autoPlay loop playsInline preload="metadata">` with a `video/mp4` source.
- [ ] Render the full portrait video at 9:16, `object-fit: contain`, with a maximum display width around 320px. Let the dress-code section accommodate its natural height.
- [ ] Use a straight retro frame: muted charcoal bezel, rounded inner corners, cream/champagne outer shell, subtle shadow, small `OUR LITTLE FILM` caption, and restrained speaker-line decoration. Keep effects off the image itself; no scanlines or distortion over faces.
- [ ] Remove the old `PHOTOS[2]` photo, Polaroid caption, and rotation styling from `DressCodeChapter`.
- [ ] Include one actual pause/play button on the frame with an accessible label; synchronize its state using video play/pause events. If autoplay is blocked, the poster and play button remain usable.
- [ ] Keep video muted so the user's vinyl song can continue without competing audio. Under reduced motion, show the poster and allow manual play.
- [ ] Pause when the player leaves the viewport and resume on return only if it was not manually paused. A small local IntersectionObserver is sufficient; no global player state.
- [ ] On a media load failure, retain the poster and show `Our little film is taking a moment to load.` with a retry/play action.

## Review and verification

- [ ] Implement and visually review Task 1, then Task 2, then Task 3 with the user. Keep adjustments small and easy to reverse.
- [ ] Run `git diff --check` and a TypeScript no-emit check after implementation.
- [ ] Manually inspect the three sections at 375px, 768px, and 1280px widths, checking text wrap, horizontal overflow, frame proportions, and swatch readability.
- [ ] Check video autoplay/loop, manual pause/resume, portrait orientation, and simultaneous vinyl-song playback. Check mobile Safari playback when available; do not claim device verification if unavailable.
- [ ] Use existing focused tests only if relevant; update obsolete expectations for the intentionally replaced copy/frame. Do not add a testing framework or broad test suite for these visual changes.
- [ ] Report actual visual checks and remaining content decisions. Commit only when requested, preserving unrelated working-tree files.
