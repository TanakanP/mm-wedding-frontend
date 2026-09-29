# RSVP Result States Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task after the user requests implementation. Steps use checkbox syntax for tracking.

**Goal:** Replace the accepted and declined RSVP results with a personalized, downloadable invitation and an optional blessing-transfer form, respectively.

**Architecture:** Keep the existing RSVP form and confirmed-save boundary. Extract the two result views from `RSVPForm.tsx`, preserve the confirmed submission identity across asynchronous close/reopen, and add a separate blessing endpoint using the existing spreadsheet credentials.

**Tech Stack:** Next.js 16 App Router, React, TypeScript, Tailwind, React Hook Form, Zod, html2canvas, Google Sheets REST API.

**Spec:** The user request and design brief in this document.

**Implementation status (2026-09-28):** The RSVP result views, personalized PNG export, and optional Blessing endpoint are implemented on `codex/rsvp-revise`. Focused tests, TypeScript, lint, and the production build pass. Desktop and 390 × 844 browser flows were checked with mocked submissions. A real iPhone Safari check, bank-app QR recipient confirmation, and a separate test-spreadsheet write remain for release verification; no payment or production Sheet write was made.

## Branch and current state

- Created and checked out `codex/rsvp-revise` from current `main` on 2026-09-28.
- Carried the uncommitted envelope positioning changes in `globals.css`, `InvitationIntro.tsx`, `OpeningChapter.tsx`, and `v4-opening.test.mjs` into this branch.
- `RSVPForm.tsx` currently includes both result states, a basic html2canvas download, the result header, and a QR placeholder. It retains form values after success but does not explicitly retain the confirmed submission ID in result state.
- `POST /api/rsvp` acknowledges success only after Sheets confirms one row. Preserve that behavior.
- Google credentials and spreadsheet ID are already server-only. The existing RSVP tab uses A:K; its schema remains unchanged.

## Design brief

### Shared result shell

After a confirmed RSVP save, remove the visible title, venue, date/time header, divider, and their reserved spacing. Keep one close (X) button at the top right, outside the scrollable result content and outside the downloadable card. Remove duplicate bottom Close buttons from result views. The initial form keeps its header.

Keep an accessible dialog name and description using visually hidden state-specific text, plus a persistent live status region. Focus the result heading after success; retain Escape, focus trapping, focus restoration, and the existing mobile scroll-lock fix. Use top-aligned scrollable result content so tall cards and forms remain reachable on short screens.

### Accepted result

Revised after the user's correction: build a single portrait keepsake card from HTML and CSS. The supplied printed front and detail images are visual references for the pastel evening sky, warm-brown typography, stars, and garden flowers; neither image is embedded in the virtual card. Couple names, guest name, date, schedule, and venue are real text. Keep the 1500 × 2114 aspect ratio and wrap Thai and English names without clipping.

Place Save Picture below the card and export the card alone, excluding close and action controls. The Plant Your Wish Wall is deprecated and removed from the accepted result.

### Declined result

Show “Thank you, {name}” and “We appreciate your kind wishes from afar.” Follow with a short optional-gift message, the supplied payment QR, and two labeled fields beneath it:

1. Amount (THB): numeric entry, decimal keypad, positive value with at most two decimal places.
2. Transfer date and time: native date/time input, explicitly labeled “Thailand time (UTC+7)”.

The blessing is optional. Guests can close immediately; both fields become required only when submitting transfer details. Leave both fields blank initially to avoid recording an accidental amount or timestamp. Use a separate “Send blessing details” button with pending, confirmed, and retry/error states. Thank-you copy must say the details were recorded, not that payment was verified. There is no banking integration or automatic payment confirmation.

Display the original QR without cropping, recoloring, generative edits, or recreating its payload. Provide a white quiet zone and sufficient rendering size. Offer Save QR image for guests using the same phone to access their banking app. Before shipping, verify that both the displayed and saved QR decode to the same payload as the supplied file and confirm the recipient in a banking app without initiating a payment.

### Defaults to review

- Currency: THB. Transfer times are entered and stored with Thailand's UTC+7 offset, regardless of the guest device's timezone.
- One blessing-detail report per declined RSVP in this flow; later corrections and multiple transfers are outside this change.
- The accepted card is one personalized portrait image, inspired by both references, rather than two downloadable sides.
- Closing a completed result resets the modal as today. A durable link to reopen a card or report a later transfer is outside scope.

## Global constraints

- Read relevant installed Next.js guides in `node_modules/next/dist/docs/` before implementation, per AGENTS.md.
- Accepted/declined results appear only after the original RSVP is confirmed saved.
- Preserve the confirmed RSVP submission ID and name; do not generate a new RSVP ID for blessing details.
- Use the same `GOOGLE_SHEETS_SPREADSHEET_ID`; the additional tab is exactly `Blessing`.
- Preserve existing server-only credential handling, request limits, origin validation, body-size limits, and confirmed-write semantics.
- Do not publish bank recipient identifiers decoded from the QR in logs or general documentation.
- No live spreadsheet changes or test payments during planning. Use a separate test spreadsheet when implementing integration verification.

## Review focus

- Long Thai/English names, including emoji, fit the card and its exported image.
- iPhone Safari export remains usable when direct download or file sharing is unavailable.
- Closing while either request is pending does not lose its identity or display another attempt's result.
- A device in another timezone records the guest's entered Thailand transfer time correctly.
- An uncertain Sheets response must not produce a false success or encourage unqualified duplicate submission.

## Task 1: Preserve result identity and extract the result shell

**Files:** Modify `src/components/RSVPForm.tsx`; create `src/components/rsvp/AcceptedResult.tsx`, `src/components/rsvp/DeclinedResult.tsx`; add result lifecycle coverage in `tests/rsvp-results.test.mjs` using the repository's existing React testing approach.

**Interfaces:** Introduce `ConfirmedRsvp = { submissionId: string; data: RSVPFormValues }`. Both result components receive `rsvp: ConfirmedRsvp`. RSVPForm owns modal close behavior, focus, and the confirmed result. Closed-in-flight outcomes retain the same `ConfirmedRsvp`.

- [ ] Add behavioral tests for accepted/declined results after confirmed save, retained submission identity on close/reopen during a pending request, visible header only in form state, and accessible result naming/focus.
- [ ] Run the focused tests and confirm failures reflect the missing behavior.
- [ ] Store the confirmed ID alongside the form values, including delayed outcomes. Extract result components and move X and live status out of the conditional visible header.
- [ ] Preserve the current form fields and RSVP request contract. Remove result-only bottom close buttons and keep keyboard/mobile scrolling behavior.
- [ ] Re-run focused tests; manually check long result scrolling and keyboard navigation.

## Task 2: Personalized invitation and reliable picture export

**Files:** Create `src/components/rsvp/InvitationCard.tsx` and `src/lib/invitationExport.ts`; style in `src/app/globals.css`; modify `AcceptedResult.tsx`; add card/export coverage.

**References only:** `/Users/tanakan.pramot/Downloads/Invitation_Final/M-Wedding-Invitation-Front-evening.jpg` and `/Users/tanakan.pramot/Downloads/Invitation_Final/M-Wedding-Invitation-Detail-evening.jpg`.

**Interfaces:** `InvitationCard({ guestName }: { guestName: string })`; `renderInvitationPng(element: HTMLElement): Promise<Blob>`. AcceptedResult owns preparing/saving/error state and the prepared image file.

- [ ] Build a standalone CSS invitation inspired by the references. Keep user source files untouched and do not embed either printed image.
- [ ] Use export-compatible sRGB colors and static layout. Avoid unsupported html2canvas effects and Tailwind color functions inside the capture subtree.
- [ ] Implement export after fonts and images have finished loading, at a fixed 1500 × 2114 output size independent of mobile display width or scroll position. Remove the off-screen export node afterward. Catch rendering/download failures and provide retry text.
- [ ] Test missing/failed assets, font readiness, one in-flight export, and cleanup on success/failure. Inspect actual PNGs with short, 100-character, Thai, and emoji guest names.
- [ ] Prepare the PNG before the iOS Save/Share tap so native file sharing can run directly within a user gesture. Use file sharing when supported; otherwise download the PNG, with an image-preview/long-press fallback. Treat user-cancelled sharing as cancellation, not an error.
- [ ] Verify on iPhone Safari and desktop that the downloaded/shared image includes the correct name and excludes all modal controls. Confirm that artwork, text, and colors match the displayed card.

## Task 3: Blessing data contract and Google Sheets endpoint

**Files:** Create `src/lib/blessing.ts`, `src/lib/blessingClient.ts`, `src/lib/server/submitBlessing.ts`, `src/app/api/blessing/route.ts`, `tests/blessing-submission.test.mjs`; modify `src/lib/server/googleSheets.ts`; extract shared request guards from `submitRsvp.ts` into `src/lib/server/submissionGuards.ts` if needed; update `README.md`.

**Request:** `POST /api/blessing` with `{ blessingId, submissionId, name, amount, transferredAt, website }`. IDs are UUIDs. `amount` is a decimal string (for example `"1000.50"`); `transferredAt` is an ISO date/time with explicit `+07:00`. `website` is the existing empty honeypot pattern.

**Validation:** Amount must be positive, no exponent notation, at most two decimals, and representable as a safe integer count of satang. Name uses RSVP's trimmed 2–100 character limit. Reject impossible dates, missing offset, non-Thai offset, and future timestamps. Enforce validation on both client and server.

**Interfaces:** `normalizeBlessing(payload): { blessingId, submissionId, name, amountThb: number, transferredAt: string }`; `postBlessing(payload, fetcher?): Promise<void>`; `createBlessingHandler({ append, resolveRsvp, now?, rateLimit? })`. `resolveRsvp(submissionId)` reads the original RSVP record server-side and returns its name and attendance. Reject unknown, conflicting, or non-declined identities; write the saved RSVP name rather than trusting browser identity fields.

**Sheet:** Append to `'Blessing'!A:F` in this exact order:

| Column | Header | Value |
| --- | --- | --- |
| A | submission_id | Original RSVP UUID |
| B | name | Saved RSVP guest name |
| C | amount_thb | Numeric baht amount |
| D | transferred_at | ISO text with `+07:00` |
| E | recorded_at | Server UTC ISO timestamp |
| F | blessing_id | Stable transfer-report UUID |

- [ ] Write tests for invalid/negative/excess-precision amounts, Thai names, UUIDs, dates, timezone conversion, unknown/mismatched RSVP identity, and future times.
- [ ] Add handler tests for origin/body/honeypot/rate-limit guards and storage errors; preserve the existing RSVP behavior when sharing guards.
- [ ] Add Sheets adapter tests asserting same spreadsheet ID, exact `Blessing` tab and A:F ordering, `RAW`, numeric amount, and one-row confirmation.
- [ ] Implement server-side RSVP lookup and blessing append using existing authentication. Return `201 { ok: true, submissionId, blessingId }` only after confirmed storage; the client verifies both IDs.
- [ ] Keep the blessing ID stable across retries and check for an existing matching report before appending. An existing identical report is success; conflicting details return a conflict. Google Sheets does not provide atomic unique-key insertion: disable simultaneous client sends, preserve the ID for reconciliation, and do not promise exactly-once delivery across concurrent server instances.
- [ ] Document manual creation of `Blessing` with the exact headers, existing service-account access, and appropriate amount/date display formatting. Do not auto-create tabs on guest requests. A missing tab produces a recoverable failure rather than success.
- [ ] Run `node --test tests/blessing-submission.test.mjs tests/rsvp-submission.test.mjs`; expected all focused tests pass.

## Task 4: Declined thank-you, payment QR, and transfer form

**Files:** Modify `src/components/rsvp/DeclinedResult.tsx`; create `public/blessings/payment-qr.jpg`; extend `tests/rsvp-results.test.mjs`.

**QR input:** `/var/folders/7l/b1m80mb52yl4zfwxcf2j4gd40000gn/T/codex-clipboard-63455862-d456-48c9-9d7d-aefb72361fb5.jpg`. Copy it to the repository during implementation before the temporary attachment disappears; preserve its pixels and add any quiet-zone padding through layout.

**Interfaces:** DeclinedResult consumes `ConfirmedRsvp` and `postBlessing` from Task 3. Keep transfer form state and request identity at modal scope when necessary so close/reopen during a pending save can recover the result. Use an attempt/session guard so late responses cannot overwrite a newer session.

- [ ] Render thank-you copy, optional-gift copy, supplied QR, Save QR image, and the two fields below the QR. Use input font sizes of at least 16px on mobile.
- [ ] Convert `datetime-local` to explicit Thailand time by attaching the offset after strict calendar validation; never interpret the bare string in the device timezone. Example: `2026-12-05T18:30` becomes `2026-12-05T18:30:00+07:00`.
- [ ] Show inline field errors and live pending/error/success messages; retain entered values and the original RSVP on failures. Disable repeated sends while pending and after confirmed success.
- [ ] Test that an empty optional blessing does not block closing; submission requires both fields; a failed blessing never resubmits or changes the original RSVP; matching confirmation is required before thank-you success.
- [ ] Test closing during a blessing request and reopening after success/failure, including stale responses from earlier sessions. Clearly report an uncertain write and keep its reference available.
- [ ] Decode and compare the source, displayed, and downloaded QR; test readability on a real phone without sending money.

## Task 5: End-to-end verification and handoff

- [ ] Run focused result/export/blessing tests, `npx tsc --noEmit`, changed-file ESLint, and `git diff --check`.
- [ ] Run the full suite once and compare failures with the current known baseline (63 tests: 50 passing, 13 stale failures); report new failures separately. Do not change unrelated expectations merely to make the suite green.
- [ ] Run `npm run build`; if Google Font fetching is blocked by the environment, report that limitation separately from application failures.
- [ ] Verify accepted and declined flows at 390 × 844 and a desktop viewport, plus real iPhone Safari: X remains reachable, header is absent only after save, fields remain usable with the keyboard, long cards scroll, and card/QR saves work.
- [ ] Against a test spreadsheet, save one declined RSVP and one blessing; confirm the same submission ID/name in both tabs and the exact amount and Thailand transfer time. Check failed/missing-tab behavior and retry reconciliation using that test destination.
- [ ] Review the final diff against the three user requirements. Keep unrelated envelope changes intact. Hand back the implementation, verification evidence, and any remaining device-specific limitations; no deployment is included in this plan.


### Revised visual direction — 29 September
The accepted card has an independent editorial composition: ivory paper, an asymmetric cropped sunset arch, oversized serif names, a dedicated guest inscription, and a compact date/schedule layout. The physical cards inform only the warm sunset palette and romantic mood. All artwork is CSS; no reference photograph is embedded. The Wish Wall remains removed.


### Generated artwork revision — 29 September
Replace the CSS illustration with original generated botanical artwork: ivory paper, sculptural flowers, blush ribbon, gold details, and a miniature sunset garden. Only the couple names, date, and short dedication are baked into the image. Keep the central name area empty in the source asset; overlay the RSVP guest name at runtime and include it in the PNG export. Schedule and venue details stay on the webpage.


### Selected Romantic artwork and card modal
Use romantic-keepsake.png with guest personalization below the dedication. Accepted modal follows card aspect ratio and fits the viewport without cropping. Close floats top-right; Save Picture floats 20% above the bottom. Controls are outside the exported card. After saving, the personalized PNG replaces the visible artwork for iPhone long-press saving without creating a duplicate card.
