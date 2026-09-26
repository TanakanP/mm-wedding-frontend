# RSVP Modal and Google Sheets Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task once implementation is requested. Steps use checkbox syntax for tracking.

**Goal:** Update the RSVP time and relationship field, then replace simulated submission with confirmed storage in a designated private Google Sheet.

**Architecture:** Keep React Hook Form and Zod in the modal; share validation with a Next.js POST route. The server authenticates to Google and appends a normalized row to a configured spreadsheet and tab. Guests do not sign in to Google.

**Tech Stack:** Existing Next.js 16.2.7 App Router, React 19, TypeScript, React Hook Form, Zod 4; proposed server-only Google API client.

**Spec:** User requirements from 2026-09-26, captured below. This is a proposed implementation plan with research, not an approved or implemented integration.

## Requirements and assumptions

- Change `5:00 PM - Midnight` to `5:00 PM - 9:00 PM`.
- Replace the relationship dropdown with a required free-text input.
- Groom label: `Relationship (SKR, CPE, TechX, etc.)`
- Bride label: `Relationship (SATIT KKU, BAA, EY, SIX, NEX, etc.)`
- Research and plan saving responses to a particular Google Sheet.
- Assumption: update the shared time label, including the downloadable invitation card. The modal heading itself remains `The Invitation`; the time appears beneath it.
- Assumption: reveal the relationship field after side selection, as today; preserve typed relationship text when switching sides and change only its label.
- Assumption: low-volume wedding traffic, private spreadsheet, and hosting that supports Next.js server routes. Actual spreadsheet URL, tab, hosting provider, and Google account permissions remain deployment inputs.
- Proposed response policy: append new submissions. Do not identify or overwrite guests by name; different people may share names. Guest editing and guaranteed exactly-once delivery are outside the basic integration.

## Repository findings

- `src/components/RSVPForm.tsx` contains the inline Zod schema, side-specific dropdown options, `Other` field, and submission handler. Submission currently logs guest data and waits one second before showing success; no persistence exists.
- `src/content/wedding.ts` supplies the time used by both the modal header and invitation card.
- The schema currently requires a nonempty relationship but does not trim whitespace. `guestCount` is an optional string and the UI calls it followers, with `min="1"`.
- There are no existing API routes or Google integration modules under `src/app` / `src/lib`. No production hosting configuration was established from the inspected files.
- Existing tests use `node --test tests/*.test.mjs`; do not assume a React or TypeScript test runner is installed.
- The installed Next.js guides for Route Handlers, environment variables, and deployment were inspected. A server POST route is compatible with this structure; a static export alone cannot run it.
- Branch created before planning: `codex/rsvp-modal-sheets-plan`, based on the current local `main` including its three commits ahead of `origin/main`.

## Google Sheets research and recommendation

### Options

| Approach | Advantages | Trade-offs | Decision |
| --- | --- | --- | --- |
| Next.js API route → Sheets API | Preserves modal, keeps credentials on server, explicit validation and save result, code lives in this repository | Google Cloud setup and server runtime; append retries require care | Recommended baseline |
| Next.js API route → Apps Script web app → Sheet | Script can run as owner; `LockService` can serialize duplicate-check-and-write operations | Separate deployment, owner/account quotas, access-policy constraints, signed server-to-script requests needed | Alternative if service-account access is unavailable or serialized deduplication is preferred |
| Google-hosted Form linked to a Sheet | Managed submission UI and storage setup | Replaces or embeds a different form experience; less control over current modal and confirmation | Fallback if custom form integration is unnecessary |

The recommendation is an engineering judgment based on this repository, not a Google requirement. Google's Forms response API exposes retrieval methods, not a public create-response method; do not base the custom modal on undocumented form submission endpoints. [Forms responses reference](https://developers.google.com/workspace/forms/api/reference/rest/v1/forms.responses)

### Authentication and selecting the destination

1. Identify the exact spreadsheet ID from its URL and choose a dedicated tab, proposed name `RSVP`. Existing data requires an explicit column mapping; never replace an existing header or clear a sheet automatically.
2. Enable Sheets API in a Google Cloud project and use a dedicated service account. Share only the designated spreadsheet with that account's email as Editor. Workspace sharing policy may require owner/admin assistance; Cloud IAM roles alone do not grant access to a private Drive file. [Drive sharing](https://developers.google.com/workspace/drive/api/guides/manage-sharing)
3. Prefer attached identity on Google Cloud or workload identity federation where the host supports it, impersonating the service account. Otherwise use a service-account key stored only in the deployment's secret manager/environment. Do not put credentials in Git, browser code, or `NEXT_PUBLIC_*` variables. Final authentication configuration depends on the host. [Google service-account guidance](https://docs.cloud.google.com/iam/docs/best-practices-service-accounts)
4. Configure `GOOGLE_SHEETS_SPREADSHEET_ID`, `GOOGLE_SHEETS_TAB_NAME`, and host-appropriate Google credentials. For a key-based deployment, use server-only `GOOGLE_SERVICE_ACCOUNT_EMAIL` and `GOOGLE_PRIVATE_KEY`; document escaped-newline handling. Use a separate test spreadsheet in development/preview.
5. Request the `https://www.googleapis.com/auth/spreadsheets` scope for this dedicated account. Scopes cover spreadsheets, not individual tabs; restrict the account's file sharing and keep destination configuration server-owned. Never accept spreadsheet IDs or ranges from the public request. [Sheets scopes](https://developers.google.com/workspace/sheets/api/scopes)

### Row schema and write behavior

Use these fixed columns in A:K:

| Column | Value |
| --- | --- |
| A `submission_id` | Client-generated UUID retained for retries of the same payload |
| B `submitted_at_utc` | Server-generated ISO timestamp |
| C `name` | Trimmed guest name |
| D `side` | `groom` or `bride` |
| E `relationship` | Trimmed free text |
| F `attending` | `yes` or `no` |
| G `additional_guests` | Nonnegative integer; excludes respondent |
| H `total_attendees` | `1 + additional_guests` if attending, otherwise `0` |
| I `drinks_alcohol` | Boolean; false if not attending |
| J `message` | Optional trimmed note |
| K `schema_version` | `1` |

Proposed normalization: blank followers means zero; allow zero in the input. Reject negative, fractional, nonnumeric, or unsafe integers. When attending is `no`, normalize followers and alcohol to zero/false regardless of stale hidden values. Preserve an optional note in the submitted payload. These are explicit proposed clarifications of currently ambiguous fields.

Append one row using `spreadsheets.values.append`, a quoted/escaped tab range such as `'RSVP'!A:K`, `majorDimension: ROWS`, `insertDataOption: INSERT_ROWS`, and `valueInputOption: RAW`. Validate that Google's response reports one updated row before confirming success. Keep the raw response tab free of unrelated tables, blank separating rows, and summaries; put reporting in another tab. [Append reference](https://developers.google.com/workspace/sheets/api/reference/rest/v4/spreadsheets.values/append)

`RAW` stores text without parsing it as formulas, dates, or numbers. Send numeric/boolean columns as actual numbers/booleans and guest text as strings, including strings beginning with `=`. This protects the initial Sheet write; future CSV exports need their own formula-injection handling. [Value input options](https://developers.google.com/workspace/sheets/api/reference/rest/v4/ValueInputOption)

### Failure handling, duplicates, and capacity

- Show confirmation, invitation download, and wish-wall effects only after confirmed storage. Preserve form values on failure and present an accessible error and retry action.
- Disable repeated clicks while submitting. Keep the same submission UUID for retries of an unchanged payload; use a new UUID when the guest edits the payload after an attempted save.
- A UUID column enables duplicate recognition but does not enforce uniqueness. Sheets append has no idempotency-key parameter. A read-before-append check can reduce sequential duplicates but races under concurrent requests; do not present it as exactly-once protection.
- Baseline: do not automatically replay ambiguous timeouts or transport failures. Explain that saving could not be confirmed and that retrying may create a duplicate. Retain the UUID so organizers can identify duplicate rows. Do not overwrite rows by guest name.
- If guaranteed retry deduplication is required, expand scope before implementation: use a durable transactional store/outbox as the source of truth, with a reconciling Sheets exporter; or use a single Apps Script writer that locks around ID lookup and append, flushes before unlocking, and validates payload consistency. An in-memory lock in a serverless function is insufficient. [Apps Script LockService](https://developers.google.com/apps-script/reference/lock/lock-service)
- Google's documented default write quota is 300 requests/minute/project and 60/minute/user/project. Service-account calls count toward a single account. Use bounded backoff with jitter for explicit quota rejections; avoid retry storms. Hosting costs are separate from the Sheets API, which has no additional usage charge. Verify actual quotas before rollout. [Sheets usage limits](https://developers.google.com/workspace/sheets/api/limits)
- For Apps Script, verify deployment access in the actual account. Execution identity affects permissions, and `/dev` is editor-only; use a deployed `/exec` endpoint. Keep any shared signing secret server-side and validate signed payloads in the script. Never send an opaque `no-cors` request and claim it saved. [Web apps](https://developers.google.com/apps-script/guides/web)
- Apps Script has separate execution and concurrency limits that vary by account and may change; include them in capacity checks if that alternative is selected. [Apps Script quotas](https://developers.google.com/apps-script/guides/services/quotas)

## Global constraints

- Keep exact requested labels and current styling, accessibility, focus trapping, scroll locking, reduced-motion support, and successful invitation download.
- Keep schema/normalization shared across client and server, and all Google access server-only.
- Bound payload size to 16 KiB and proposed text lengths to name 100, relationship 200, message 2,000 characters; trim required text and reject whitespace-only values.
- Protect the public endpoint with JSON-only requests, a configured same-origin check, a honeypot, and host-backed rate limiting before launch. Origin checks are defense in depth, not authentication or sufficient bot protection. Start with 5 submissions/minute/IP and 30/minute globally, tune for shared networks, return retry guidance on limits. Never rely on process-local counters across serverless instances.
- No guest data or credentials in logs. Log request ID, duration, result class, and Google error code only. Do not expose a public endpoint for reading RSVP rows.
- Keep existing wish-wall storage/display behavior; saving RSVPs does not imply publishing private spreadsheet data to the wall.

## Review focus

1. Side changes after typing: exact label changes, existing input preserved (Task 1).
2. Whitespace-only relationship, Thai text, emoji, and formula-like text: validation and literal storage (Tasks 1–2).
3. Attending changes after entering followers/alcohol: no stale attendance totals (Task 2).
4. Lost acknowledgment, quota rejection, or permission failure: no false success, recoverable form (Tasks 2–3).
5. Closing and reopening during an active request: old completion must not change the new modal session; cancellation does not imply cancellation of a server write (Task 3).

## Implementation tasks

### Task 1: Modal copy and free-text relationship

**Files:** Modify `src/content/wedding.ts`, `src/components/RSVPForm.tsx`; create `src/lib/rsvp.ts` for shared client-safe schema, labels, and inferred `RSVPFormValues`.

**Interface:** `getRelationshipLabel(side: "groom" | "bride"): string`; exported `rsvpSchema` and `RSVPFormValues` retain existing field names except removal of `otherRelation`.

- [ ] Change shared `timeLabel` to `5:00 PM - 9:00 PM`.
- [ ] Replace select with `input type="text"`, keeping `rsvp-relation`, registration, error association, and required validation. Use the exact side-specific labels above and a full-width layout so the longer bride label wraps naturally.
- [ ] Remove dropdown option arrays, `Other` UI/schema field, and obsolete relationship watcher. Keep side-dependent visibility and typed value across side switches.
- [ ] Extract shared schema; change relationship error to `Please enter your relationship` and enforce trim/length constraints.
- [ ] Verify both labels, empty/whitespace errors, side switching, small-screen wrapping, keyboard focus, and card time in the browser. Avoid new source-string-only tests for this simple copy/layout edit.

### Task 2: Validated server submission and Sheets adapter

**Files:** Create `src/app/api/rsvp/route.ts`, `src/lib/server/googleSheets.ts`, `src/lib/server/submitRsvp.ts`, `tests/rsvp-submission.test.ts`; update `src/lib/rsvp.ts`, `package.json`, lockfile, `.env.example`, `README.md`.

**Interfaces:** `POST(request: Request): Promise<Response>` accepts `{submissionId: string, ...RSVPFormValues, website?: string}`. `normalizeRsvp(input: RSVPFormValues): NormalizedRSVP` produces trimmed text, integer `additionalGuests`, integer `totalAttendees`, boolean `drinksAlcohol`, side and attendance enums. `appendRsvp(input: NormalizedRSVP, submissionId: string, submittedAt: string): Promise<void>` resolves only for confirmed one-row writes. Expose a dependency-injected submission service for testing without real credentials.

- [ ] Add a TS test execution script with a minimal dev runner such as `tsx`, retaining existing `npm test`; add the Google client and `server-only` dependency for the server adapter. Document all environment keys without real values.
- [ ] Write failing behavioral tests in `tests/rsvp-submission.test.ts`: invalid side/UUID/blank text rejected before any write; Thai/emoji preserved; integer followers validated; attendance normalization; exact A:K ordering; `RAW` and configured destination used; one successful append returns success; quota/permission/timeout errors do not return success. Add request-size, origin, honeypot, and limiter tests with injected dependencies.
- [ ] Run `npm run test:rsvp` and confirm assertions fail for the missing behavior.
- [ ] Implement shared validation, server-controlled timestamp/destination, adapter, and route using Node runtime. Normalize form values as described above and change followers input minimum to zero.
- [ ] Return `201 {ok:true, submissionId}` only on confirmed write; use `400` validation, `403` origin, `413` payload, `415` media type, `429` rate limit, and `503` storage-unavailable responses with safe error codes/messages. No fallback success when configuration is absent.
- [ ] Bound upstream calls to the host request budget; classify uncertain outcomes separately from definite rejections and disable blind append retries. Implement host-backed rate limiting once the provider is known; this is a deployment dependency, not a reason to use an in-memory substitute.
- [ ] Run `npm run test:rsvp` and confirm all behavioral tests pass with mocked Google access.

### Task 3: Connect modal to confirmed persistence

**Files:** Modify `src/components/RSVPForm.tsx`; extend submission tests where client orchestration is extracted into a testable helper.

**Interface:** Consume Task 2's route contract. Successful saved data feeds the existing `submittedData` state; errors remain in the form.

- [ ] Replace `console.log` and simulated delay with same-origin `fetch('/api/rsvp', ...)`. Track stable per-payload UUID, submitting state, accessible error state, and the current modal session.
- [ ] Set success state only after HTTP success and a valid `{ok:true, submissionId}` response. Preserve values and UUID on failure; generate a new ID after edits to an attempted payload.
- [ ] Prevent stale completions after close/reopen from displaying success in a new session. Keep a pending request's identity long enough to explain/reconcile uncertain saves; do not equate browser abort with server rollback.
- [ ] Test confirmed success, rejected save, malformed response, offline/timeout, repeated clicks, payload edits after failure, and close/reopen during submission. Verify error announcements and existing invitation/wish behavior in the browser.

### Task 4: Test-sheet rollout and handover

**Files:** Update `README.md` with setup, column mapping, authentication, failure recovery, duplicate-ID reconciliation, and deployment steps.

- [ ] Obtain target sheet URL/tab and hosting details. Confirm sharing policy, chosen auth method, expected burst volume, and acceptance of the baseline duplicate policy before live integration.
- [ ] Provision a separate test sheet with the exact header, enable API/auth, and configure server secrets. Inspect existing production sheet before choosing any migration/mapping.
- [ ] Send attending and declining test responses, including Thai text and `=1+1` as literal relationship/message text. Verify exact row contents, totals, timestamps, and no formula evaluation.
- [ ] Test revoked permission, incorrect tab, upstream failure, and rate limiting; verify no false success. Restore access and retry with the same ID, documenting possible duplicate reconciliation.
- [ ] Run `npm test`, `npm run test:rsvp`, `npx tsc --noEmit`, `npm run lint`, and `npm run build`; resolve new failures and identify any pre-existing failures separately.
- [ ] Browser-check desktop/mobile, both sides, zero followers, attending toggles, modal keyboard controls, success card download, and close/reopen races.
- [ ] Configure production destination only after test-sheet validation. Record one verified production smoke submission and its ID for organizer review; remove only that identified test row if requested.

## Completion criteria

All three requested UI changes work, both attendance answers reach the selected tab, success means a confirmed save, failures retain input, and no Google credentials or response data are exposed to the browser beyond the guest's own submission. The host, spreadsheet, and permissions must be provided to verify live storage; research alone cannot establish access to an unspecified sheet.

Implementation status (2026-09-26): Tasks 1–3 are implemented in this branch with a built-in Next.js route and Node crypto authentication; no extra repository or runtime package was added. The route also has a process-local rate limit. Task 4 remains pending because the target spreadsheet, credentials, and hosting provider have not been supplied. A distributed edge rate limit must be configured before public launch. The live Sheet write and browser submission have not been verified.
