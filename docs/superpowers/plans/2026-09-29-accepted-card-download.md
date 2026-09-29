# Accepted Card Download Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update the accepted RSVP modal with the approved Romantic artwork, a circular download control beside close, guest-specific filenames, and a mobile-only animated saving hint.

**Architecture:** Keep the existing card-proportioned modal and component CSS module. Let `AcceptedResult` own the accepted-state toolbar and prepared PNG lifecycle; pass it the existing close callback. Keep the export boundary around `InvitationCard` only, so controls, hints, and errors never enter the saved picture.

**Tech Stack:** Next.js 16.2.7, React 19, TypeScript, CSS Modules, lucide-react, html2canvas, existing Node test runner. No new dependencies.

**Spec:** The approved design in this conversation, restated below as the implementation contract.

## Implementation contract

- Use the approved Romantic image with the added sentence: “We can’t wait to celebrate with you.”
- Remove the bottom Save Picture button. Add a circular download icon immediately left of the top-right close button.
- Name files `{Guest name}-Mimeen-Wedding-Invitation.png`.
- Remove “On iPhone…” copy. On mobile, show exactly “Touch and hold the card to save it” with a gentle floating animation. This is visible guidance, not a tooltip requiring mouse hover.
- Preserve guest personalization and the full-card, uncropped modal layout.
- Make the personalized image available to long-press without first pressing download.

## Global constraints

- Work on the existing `codex/rsvp-revise` branch; preserve unrelated changes.
- Read relevant installed Next.js guides in `node_modules/next/dist/docs/` before implementation.
- Keep styling in `InvitationCard.module.css`. The previous global stylesheet was stale in development; do not restore those global rules or inject alternate styles for verification.
- Keep the existing 1500 × 2114 PNG export dimensions and guest-name placement unless visual checks reveal overlap.
- Keep the RSVP form, declined result, submission APIs, and Blessing behavior unchanged.
- Do not send test submissions to Google Sheets. Intercept the RSVP response in an isolated test browser.
- This plan is documentation only; implementation, deployment, and commits are separate actions.

## Review focus

1. Thai names, spaces, punctuation, and filename separators must produce usable filenames without losing the guest identity.
2. Slow/failed PNG generation must not offer the unpersonalized source image as the suggested long-press target.
3. Closing, reopening, or changing the guest must not show an old PNG or retain unused object URLs.
4. Touch/mobile guidance must work without hover and respect reduced-motion preferences.
5. The actual submitted modal must retain correct sizing and loaded styles, including after refresh; an isolated styled mockup is insufficient.

## File map

| File | Responsibility |
| --- | --- |
| `public/invitations/romantic-keepsake-thank-you.png` (new) | Approved updated artwork, versioned to avoid stale asset caching |
| `src/components/rsvp/InvitationCard.tsx` | Artwork reference and accessible description |
| `src/components/rsvp/AcceptedResult.tsx` | Toolbar, prepared image, download/share, hint and errors |
| `src/components/rsvp/InvitationCard.module.css` | Toolbar layout, circular controls, mobile hint and animation |
| `src/components/RSVPForm.tsx` | Pass close callback; render its own close button only outside accepted state |
| `src/lib/invitationFilename.ts` (new) | Pure filename helper |
| `tests/invitation-filename.test.mjs` (new) | Filename edge cases |
| `tests/invitation-card.test.mjs` | Existing rendered-component checks updated for artwork and controls |

`src/lib/invitationExport.ts` stays unchanged unless verification identifies a real export defect.

### Task 1: Replace the artwork

**Interfaces:** `InvitationCard({ guestName: string }, ref)` remains unchanged.

- [ ] Copy the approved generated file from `/Users/tanakan.pramot/.codex/generated_images/01a0e2bf-6d1b-7ef3-a62e-92704d897c04/exec-b88c4560-90ae-4e81-ad61-4762bd2e5c5a.png` to `public/invitations/romantic-keepsake-thank-you.png`. Keep the old asset for now.
- [ ] Update the card image source and accessible description, including the new sentence. Keep the name as live text over the blank center.
- [ ] Update the existing card-render test to expect the new asset and continued guest personalization.
- [ ] Run `node --test tests/invitation-card.test.mjs`; confirm the artwork/name assertions pass. Visually check that the name above the new sentence does not overlap it.

### Task 2: Guest-specific filenames

**Produces:** `getInvitationFilename(guestName: string): string` from `src/lib/invitationFilename.ts`.

- [ ] Add meaningful tests for the following outputs before implementing the helper:
  - `Pim & Family` → `Pim & Family-Mimeen-Wedding-Invitation.png`.
  - `คุณมิน และครอบครัว` → `คุณมิน และครอบครัว-Mimeen-Wedding-Invitation.png`.
  - `  Pim   Family  ` → `Pim Family-Mimeen-Wedding-Invitation.png`.
  - `A/B:C` → `A-B-C-Mimeen-Wedding-Invitation.png`.
  - Blank/whitespace-only name → `Guest-Mimeen-Wedding-Invitation.png`.
- [ ] Run the new test file and confirm failure because the helper does not exist.
- [ ] Implement the helper: normalize Unicode to NFC; replace control characters and `<>:"/\\|?*` with hyphens; collapse whitespace; trim whitespace and leading/trailing periods; fall back to `Guest` if empty; append the exact suffix. Preserve Thai and other Unicode letters.
- [ ] Run `node --test tests/invitation-filename.test.mjs` and confirm all cases pass.

### Task 3: Prepared image and top-right toolbar

**Consumes:** `getInvitationFilename(guestName)` and existing `renderInvitationPng(element): Promise<Blob>`.

**Updates:** `AcceptedResult` props to `{ data: RSVPFormValues; onClose: () => void }`.

- [ ] Pass `handleClose` from `RSVPForm` to `AcceptedResult`. Hide the parent's close button only when `isAccepted` is true; keep existing close behavior for the form and declined state.
- [ ] Replace the accepted result's bottom action with one top-right toolbar: download first, close second. Use lucide `Download`, `LoaderCircle`, and `X` icons. Both buttons are 44 × 44 px circles with an 8 px gap, positioned 16 px from top/right, above the image. Match the cream/wine appearance and visible keyboard focus style.
- [ ] Use accessible labels `Download invitation` and `Close RSVP dialog`. While preparing, disable download and show a spinner with label `Preparing invitation`. On preparation failure, make the same control a retry action with label `Retry preparing invitation`. Close must remain available throughout.
- [ ] Refactor preparation into a shared routine used on mount/name changes and retry. Reset stale picture/error state before generating. Publish the PNG Blob and its object URL immediately on success; use the URL for the visible personalized overlay, without requiring a download click.
- [ ] Keep the card being exported separate from its overlay. Allow normal image long-press on the personalized overlay; avoid preventing `contextmenu` or disabling touch callouts. Hide the source artwork from accessibility when the personalized overlay replaces it, avoiding duplicate descriptions.
- [ ] Revoke each object URL on replacement/unmount. Ignore stale asynchronous completions after unmount or name change. Do not create another URL every time download is pressed.
- [ ] Use the filename helper for both `File.name` and anchor `download`. Always download the prepared PNG through an anchor using its existing object URL. The user explicitly requested a download button; mobile long-press remains a separate saving path. Avoid invoking the share sheet from this control.
- [ ] Remove the old “On iPhone…” status. Keep actual preparation/download failures as accessible alerts outside the exported card.
- [ ] Update rendered-component checks for the new `onClose` prop, one close control, preparing/download state, and absence of Save Picture/old iPhone copy. Verify retry, cancellation, and URL lifecycle in the browser during Task 5.

### Task 4: Mobile-only floating hint

**Consumes:** Successful prepared-image state from Task 3.

- [ ] Render the exact hint `Touch and hold the card to save it` only when the personalized PNG is ready and no blocking error exists. Place it outside the export boundary.
- [ ] Hide the hint by default. Show it under `@media (max-width: 767px) and (hover: none) and (pointer: coarse)` so desktop mouse users do not see mobile instructions.
- [ ] Position it centered at `bottom: 12%`, with a compact cream translucent background and readable wine text. Give it `pointer-events: none` so it cannot block long-press on the card.
- [ ] Add a gentle vertical `translateY(0)` to `translateY(-4px)` animation, `2.8s ease-in-out infinite`. Set `animation: none` under `prefers-reduced-motion: reduce`. Do not make the instruction depend on a hover interaction or repeatedly announce the animation.
- [ ] Remove obsolete bottom `.actions` styling; retain separate error styling. Visually verify the hint does not cover the guest name or the artwork's added sentence.

### Task 5: Verify the real RSVP flow

- [ ] Open the actual site in an isolated browser and intercept `/api/rsvp` with the existing success contract (`201`, `{ ok: true, submissionId }`). Complete the real form and reach the accepted state. Do not replace the modal with a test layout or inject CSS overrides.
- [ ] Verify desktop (1440 × 1000), mobile touch (390 × 844), and a short landscape viewport: card fills its modal without cropping; download is left of close; both controls remain reachable; no duplicate close button, old bottom button, or old iPhone text.
- [ ] Assert bounding rectangles: controls are inside the modal, have 44 px hit targets and an 8 px gap. Verify the relevant CSS Module is loaded on both a fresh load and hot reload.
- [ ] Verify the mobile hint is hidden on desktop, visible on touch mobile after preparation, and stationary with reduced motion. Verify native image callouts on a real iPhone Safari when available; report this separately if only emulation is available.
- [ ] Save a PNG using an English name and a Thai name. Confirm the exact guest-specific filename, 1500 × 2114 dimensions, approved new sentence, correct guest name, and absence of controls/hints/errors. Native Photos long-press naming is OS-controlled; the application guarantees the filename supplied to download/share, not the name assigned by Photos.
- [ ] Test a 100-character name, delayed/failed generation and retry, repeated download, and close/reopen. Confirm no stale guest image or broken revoked URL appears.
- [ ] Run `node --test tests/invitation-card.test.mjs tests/invitation-filename.test.mjs tests/rsvp-submission.test.mjs tests/blessing-submission.test.mjs`.
- [ ] Run `npx eslint src/components/rsvp/AcceptedResult.tsx src/components/rsvp/InvitationCard.tsx src/components/RSVPForm.tsx src/lib/invitationFilename.ts`, then `npm run build` and `git diff --check`. Record any existing warnings separately from new failures.
- [ ] Remove temporary test routes or fixtures and retain screenshots/export evidence outside production source. Report completed checks and any real-device verification still outstanding.
