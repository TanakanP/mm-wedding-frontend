# Gallery Frame and Evening Schedule Implementation Plan

**Goal:** Use the supplied decorative frame around the central portrait and present the revised evening schedule on a centered timeline.

**Architecture:** Update the existing FramedPhotoChapter, ScheduleChapter, GardenPath, and shared wedding content. Use the supplied PNG as a decorative overlay and existing Lucide icons for the schedule. No new dependencies.

**Design source:** User request in this task, September 17, 2026. This is a proposed plan; application code has not been changed.

## Constraints

- Keep implementation lightweight; no new automated tests or test-suite runs.
- Read relevant local Next.js guides before implementation.
- Preserve current uncommitted work, including the preview-origin fix, retro video without controls, and replacement photographs.
- Do not commit or touch the unrelated spreadsheets.
- Keep the running-photo background and its 50% purple overlay.

## Task 1: Decorative gallery frame

Files: create `public/photos/frames/ornate-ivory.png`; modify `src/components/v4/FramedPhotoChapter.tsx`.

- [ ] Copy `/Users/tanakan.pramot/Downloads/M4ldk.png` into the public asset path. The PNG is 834 × 1200 and has an alpha channel. Confirm that the central opening is transparent before layering it; do not assume the black preview represents opaque pixels.
- [ ] Replace the antique-gold border and ivory mat with this actual image asset. Preserve its 834:1200 aspect ratio and scalloped silhouette, without stretching or recreating it in CSS.
- [ ] Increase the framed composition width by 50% relative to its current width: `w-[min(66vw,450px)] sm:w-[min(58.5vw,450px)]`. This explicitly means 1.5× linear width, not 50% more area. Keep it centered and upright.
- [ ] Place PHOTOS[12] behind the opening, with a rectangular crop and the existing face-focused object position. Approximate opening bounds from the attachment: left 131px, top 148px, right 718px, bottom 1036px. Convert these to percentages of 834 × 1200; overlap beneath the frame by 1–2px to prevent seams. Verify exact bounds against alpha during implementation.
- [ ] Render the decorative PNG above the portrait with empty alt text and pointer events disabled. Keep meaningful portrait alt text. Use a subtle drop shadow following the frame silhouette.
- [ ] Update the portrait's `sizes` value to reflect the new aperture width; the old value still assumes the earlier large frame.
- [ ] Inspect mobile and desktop crops, ensuring faces remain visible and the supplied frame is fully shown.

## Task 2: Centered evening schedule

Files: modify `src/components/v4/ScheduleChapter.tsx`, `src/components/GardenPath.tsx`, and `src/content/wedding.ts`.

- [ ] Set the small heading to `The celebration` and the main title to `An Evening to Remember`.
- [ ] Replace WEDDING.schedule entries with:

```ts
schedule: [
  { time: "5:00 PM", description: "Feast & Photography begins", icon: "camera" },
  { time: "6:00 PM", description: "Wedding Reception", icon: "wine" },
],
```

- [ ] Extend GardenPath's local ScheduleItem interface with `readonly icon: "camera" | "wine"`. Map these keys to the installed Lucide `Camera` and `Wine` icons. Decorative icons are hidden from assistive technology because the adjacent event text conveys meaning.
- [ ] Replace alternating left/right entries and the curved side path with one centered vertical sequence on every screen size. Each event contains a gold outlined icon medallion, the time underneath, and centered event text.
- [ ] Connect the two event groups with a thin muted-gold vertical segment in the space between them. Do not run a line behind the text. Keep the existing wine background, cream typography, and restrained gold accents.
- [ ] Use a centered content width around 36rem with responsive horizontal padding. Allow the first event label to wrap naturally on small screens. Keep both entries visually equal.
- [ ] Change horizontal reveal motion to a small upward fade, respecting the existing reduced-motion hook. No new animation system.
- [ ] Update shared WEDDING.timeLabel to `5:00 PM - Midnight` so the venue and RSVP references agree with the new start time. Retain the previously established midnight end time; 6:00 PM is the reception start, not the evening's end.

## Task 3: Lightweight preview review

- [ ] Inspect the frame and timeline at mobile width and desktop width in the running preview.
- [ ] Confirm the supplied border is not distorted, the portrait sits precisely behind its opening, and the background is unchanged.
- [ ] Confirm both times, exact event labels, icons, centered alignment, and updated venue/RSVP start-time text.
- [ ] Run `git diff --check` and `./node_modules/.bin/tsc --noEmit` once. No added tests or broad test runs.
- [ ] Report the resulting changes for the user's visual review. Commit only when requested.
