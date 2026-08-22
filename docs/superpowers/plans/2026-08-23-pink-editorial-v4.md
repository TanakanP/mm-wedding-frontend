# M&M Pink Editorial V4 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILLS: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task, and use frontend-design:frontend-design for every implementation task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the current wedding page as the approved nine-section V4 pink editorial invitation while preserving the existing countdown, first-visit intro, navigation, RSVP form, wish wall, and footer behavior.

**Architecture:** Replace the three broad page components with nine focused components in `src/components/v4/`, one per approved visual section. Keep wedding facts in `src/content/wedding.ts`, reuse Framer Motion and the existing scroll helpers, and render the existing FAQ inside the ninth RSVP section so the page still has exactly nine top-level visual sections.

**Tech Stack:** Next.js 16.2.7 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Framer Motion 12, `next/image`, `qrcode.react`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-08-23-pink-editorial-v4-design.md`

## Global Constraints

- Preserve exactly nine top-level V4 sections in this order: `hero`, `families`, `framed-photo`, `dress-code`, `schedule`, `gallery`, `venue`, `final-image`, `rsvp`.
- V5 floral background marks are out of scope.
- Keep the page as one document scroll; never introduce nested scroll containers or a three-column page layout.
- Reuse Framer Motion; add no second animation framework.
- Use `next/image` with accurate `sizes`; preload only the opening background photograph.
- Keep the existing RSVP schema, form submission behavior, wish wall, first-visit storage key, replay event, focus restoration, and document scroll lock.
- When `WEDDING.song.audioUrl` is `null`, show a disabled vinyl control labeled “Our song coming soon”; do not ship fake audio.
- When `WEDDING.venue.mapUrl` is `null`, derive a Google Maps search URL from the address and encode that exact URL in the QR code.
- Respect `prefers-reduced-motion`; every component must render in its final stable state without essential continuous motion.
- Do not stage, modify, or delete unrelated existing workspace changes.

## Agentic Worker Design Requirements

- Every worker must read and invoke `frontend-design:frontend-design` before editing files, including workers handling content contracts, visual components, responsive behavior, or acceptance fixes.
- Every worker must treat the approved V4 reference and its nine-section specification as the visual source of truth; do not substitute a generic wedding-template aesthetic.
- Every UI task must include screenshot critique at desktop and mobile sizes before its review checkpoint. Compare hierarchy, typography, spacing, photography, palette, and motion against V4.
- Spend visual complexity on the approved envelope, vinyl, violet frame, schedule path, gallery, location card, final photograph, and RSVP response card. Do not reintroduce V5 floral marks.
- The coordinating agent must include the `frontend-design:frontend-design` requirement explicitly in every subagent task prompt.

---

### Task 1: Lock V4 content contracts, location fallback, and color tokens

**Files:**

- Modify: `src/content/wedding.ts`
- Create: `src/lib/location.ts`
- Modify: `src/app/globals.css`
- Modify: `tests/wedding-content.test.mjs`
- Create: `tests/location.test.mjs`

**Interfaces:**

- Produces: `V4_SECTION_IDS`, `SectionId`, `WEDDING.song`, `WEDDING.dressCode`, `V4_GALLERY_PHOTO_IDS`.
- Produces: `getLocationUrl(mapUrl: string | null, address: string): string`.
- Consumed by: every V4 section, navigation, QR code, and structural tests.

- [ ] **Step 1: Write the failing V4 content tests**

Update `tests/wedding-content.test.mjs` to assert the new contracts:

```js
test("V4 exposes exactly nine editable sections in the approved order", () => {
  assert.deepEqual(content.V4_SECTION_IDS, [
    "hero",
    "families",
    "framed-photo",
    "dress-code",
    "schedule",
    "gallery",
    "venue",
    "final-image",
    "rsvp",
  ]);
  assert.equal(new Set(content.V4_SECTION_IDS).size, 9);
});

test("V4 assigns every primary photograph once", () => {
  assert.deepEqual(content.EDITORIAL_PHOTO_IDS, [6, 1, 7, 2, 8, 3, 5, 4, 10, 9]);
  assert.equal(new Set(content.EDITORIAL_PHOTO_IDS).size, 10);
  assert.deepEqual(content.V4_GALLERY_PHOTO_IDS, [8, 3, 5, 4]);
});

test("song and dress-code content have stable fallbacks", () => {
  assert.deepEqual(content.WEDDING.song, {
    title: "Our song",
    audioUrl: null,
  });
  assert.deepEqual(
    content.WEDDING.dressCode.colors.map((color) => color.value),
    ["#68414B", "#756078", "#A9707C", "#C7929B", "#BDA56E"]
  );
});
```

Create `tests/location.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(
  new URL("../src/lib/location.ts", import.meta.url),
  "utf8"
).catch(() => "");
const { outputText } = ts.transpileModule(source, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2022,
  },
});
const location = await import(
  `data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`
);

test("explicit map URL wins", () => {
  assert.equal(
    location.getLocationUrl("https://maps.example/wedding", "456 Celebration Lane"),
    "https://maps.example/wedding"
  );
});

test("missing map URL becomes a Google Maps address search", () => {
  assert.equal(
    location.getLocationUrl(null, "456 Celebration Lane, New York, NY"),
    "https://www.google.com/maps/search/?api=1&query=456%20Celebration%20Lane%2C%20New%20York%2C%20NY"
  );
});
```

- [ ] **Step 2: Run the focused tests and confirm RED**

Run:

```bash
node --test tests/wedding-content.test.mjs tests/location.test.mjs
```

Expected: failures for missing `V4_SECTION_IDS`, `V4_GALLERY_PHOTO_IDS`, `WEDDING.song`, `WEDDING.dressCode`, and `src/lib/location.ts`.

- [ ] **Step 3: Implement the content and location contracts**

Add these exports and fields to `src/content/wedding.ts`:

```ts
export const V4_SECTION_IDS = [
  "hero",
  "families",
  "framed-photo",
  "dress-code",
  "schedule",
  "gallery",
  "venue",
  "final-image",
  "rsvp",
] as const;

export const SECTION_IDS = [...V4_SECTION_IDS, "garden-whispers"] as const;
export type SectionId = (typeof SECTION_IDS)[number];

export const NAV_ITEMS = [
  { id: "families", label: "Invitation" },
  { id: "schedule", label: "Schedule" },
  { id: "gallery", label: "Gallery" },
  { id: "venue", label: "Venue" },
  { id: "garden-whispers", label: "FAQ" },
] as const satisfies readonly { id: SectionId; label: string }[];
```

Add these fields inside `WEDDING`:

```ts
song: {
  title: "Our song",
  audioUrl: null as string | null,
},
dressCode: {
  title: "Pink garden formal",
  description:
    "Soft rose, violet, champagne, blush, and warm neutral tones are warmly welcomed.",
  colors: [
    { label: "Deep wine", value: "#68414B" },
    { label: "Violet", value: "#756078" },
    { label: "Muted rose", value: "#A9707C" },
    { label: "Dusty pink", value: "#C7929B" },
    { label: "Champagne gold", value: "#BDA56E" },
  ],
},
```

Replace the primary photo plan and add the gallery plan:

```ts
export const EDITORIAL_PHOTO_IDS = [6, 1, 7, 2, 8, 3, 5, 4, 10, 9] as const;
export const V4_GALLERY_PHOTO_IDS = [8, 3, 5, 4] as const;
```

Create `src/lib/location.ts`:

```ts
export function getLocationUrl(mapUrl: string | null, address: string) {
  const explicitUrl = mapUrl?.trim();
  if (explicitUrl) return explicitUrl;

  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}
```

- [ ] **Step 4: Replace the theme tokens and shared paper texture**

In `src/app/globals.css`, replace the green-led root palette with:

```css
:root {
  --background: #fffaf3;
  --foreground: #51313a;
  --color-accent-primary: #bda56e;
  --color-accent-secondary: #a9707c;
  --color-sage: #756078;
  --color-dusty: #c7929b;
  --color-cream: #fffaf3;
  --color-paper: #f8eee9;
  --color-petal: #eed4d8;
  --color-wine: #68414b;
  --color-violet: #756078;
  --nav-offset: 48px;
}
```

Expose `paper`, `petal`, `wine`, and `violet` inside `@theme inline`, and replace `.garden-texture` with a low-opacity paper grain using the same two-gradient technique already in the file. Do not add floral marks.

- [ ] **Step 5: Run focused and full tests**

Run:

```bash
node --test tests/wedding-content.test.mjs tests/location.test.mjs
npm test
```

Expected: all tests pass.

- [ ] **Step 6: Commit Task 1**

```bash
git add src/content/wedding.ts src/lib/location.ts src/app/globals.css tests/wedding-content.test.mjs tests/location.test.mjs
git commit -m "feat: define V4 wedding content system"
```

---

### Task 2: Build section 1 — opening, countdown, and vinyl song control

**Files:**

- Create: `src/components/v4/OpeningChapter.tsx`
- Modify: `src/components/InvitationIntro.tsx`
- Modify: `src/components/hero/Countdown.tsx`
- Create: `tests/v4-opening.test.mjs`

**Interfaces:**

- Consumes: `WEDDING.song`, `WEDDING.dateIso`, `WEDDING.dateLabel`, `WEDDING.venue`, `PHOTOS[1]`, `PHOTOS[6]`.
- Produces: default `OpeningChapter` with top-level `<section id="hero">`.
- Preserves: invitation storage/replay behavior and `#wedding-title` focus target.

- [ ] **Step 1: Write the failing opening contract test**

Create `tests/v4-opening.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/v4/OpeningChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("V4 opening combines envelope, countdown, and vinyl in section one", () => {
  assert.match(source, /id="hero"/);
  assert.match(source, /Countdown/);
  assert.match(source, /audioUrl/);
  assert.match(source, /aria-pressed/);
  assert.match(source, /Our song coming soon/);
  assert.doesNotMatch(source, /cassette/i);
});
```

- [ ] **Step 2: Run the opening test and confirm RED**

Run:

```bash
node --test tests/v4-opening.test.mjs
```

Expected: failure because `OpeningChapter.tsx` does not exist.

- [ ] **Step 3: Create the interactive vinyl control inside `OpeningChapter.tsx`**

Use one client component for the entire first section. Its local playback state must follow this exact state transition:

```tsx
const audioRef = useRef<HTMLAudioElement>(null);
const [isPlaying, setIsPlaying] = useState(false);
const audioUrl = WEDDING.song.audioUrl;

const toggleSong = async () => {
  const audio = audioRef.current;
  if (!audio || !audioUrl) return;

  if (audio.paused) {
    await audio.play();
    setIsPlaying(true);
  } else {
    audio.pause();
    setIsPlaying(false);
  }
};
```

Render the control with this semantic contract:

```tsx
<button
  type="button"
  onClick={toggleSong}
  disabled={!audioUrl}
  aria-pressed={audioUrl ? isPlaying : undefined}
  aria-label={
    audioUrl
      ? `${isPlaying ? "Pause" : "Play"} ${WEDDING.song.title}`
      : "Our song coming soon"
  }
>
  <span aria-hidden="true" className={isPlaying && !reduceMotion ? "animate-spin" : ""} />
  <span>{audioUrl ? (isPlaying ? "Pause our song" : "Listen to our song") : "Our song coming soon"}</span>
</button>
{audioUrl && (
  <audio
    ref={audioRef}
    src={audioUrl}
    preload="none"
    onEnded={() => setIsPlaying(false)}
  />
)}
```

The surrounding `<section id="hero">` must contain, in order:

1. Full-height `PHOTOS[6]` background using `<Image fill preload sizes="100vw">`.
2. M&M title/date/venue layer with `id="wedding-title"` and `tabIndex={-1}`.
3. Pink envelope with `PHOTOS[1]` rising card treatment.
4. Existing `<Countdown targetDateIso={WEDDING.dateIso} />`.
5. Vinyl song control.

Use Framer Motion transforms and opacity only. When reduced motion is true, render the envelope card in its open/final position and stop vinyl rotation.

- [ ] **Step 4: Restyle the countdown for the wine background**

In `src/components/hero/Countdown.tsx`, preserve all timer behavior and change only presentation:

- Use ivory digits and petal labels.
- Keep tabular numbers and hydration suppression.
- Allow wrapping at narrow widths using a grid rather than a single non-wrapping flex row.
- Keep the past-event message visible with champagne-gold text.

- [ ] **Step 5: Align the first-visit overlay with the V4 opening**

In `src/components/InvitationIntro.tsx`:

- Replace green/cream envelope colors with V4 pink/ivory/wine tokens.
- Add `PHOTOS[1]` to the rising invitation card using `next/image`.
- Keep the current state machine, storage key, replay event, scroll lock, inert background, focus restoration, 3.2-second normal dismissal, and 160-millisecond reduced-motion dismissal.
- Keep the same `aria-modal`, label, description, and seal button.
- Make the final card position visually match the envelope card at the top of `OpeningChapter`, so the overlay fade reveals the same composition underneath.

- [ ] **Step 6: Run opening, invitation, type, and lint checks**

Run:

```bash
node --test tests/v4-opening.test.mjs tests/invitation-intro.test.mjs tests/countdown.test.mjs
npx tsc --noEmit
npx eslint src/components/v4/OpeningChapter.tsx src/components/InvitationIntro.tsx src/components/hero/Countdown.tsx tests/v4-opening.test.mjs
```

Expected: all checks pass.

- [ ] **Step 7: Commit Task 2**

```bash
git add src/components/v4/OpeningChapter.tsx src/components/InvitationIntro.tsx src/components/hero/Countdown.tsx tests/v4-opening.test.mjs
git commit -m "feat: build V4 opening chapter"
```

---

### Task 3: Build sections 2–4 as separately editable invitation chapters

**Files:**

- Create: `src/components/v4/FamilyChapter.tsx`
- Create: `src/components/v4/FramedPhotoChapter.tsx`
- Create: `src/components/v4/DressCodeChapter.tsx`
- Create: `tests/v4-invitation-chapters.test.mjs`

**Interfaces:**

- Consumes: `WEDDING.couple`, `WEDDING.dressCode`, `PHOTOS[2]`, `PHOTOS[7]`.
- Produces: three default components with IDs `families`, `framed-photo`, and `dress-code`.

- [ ] **Step 1: Write the failing chapter contract test**

Create `tests/v4-invitation-chapters.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const read = (name) =>
  readFile(new URL(`../src/components/v4/${name}.tsx`, import.meta.url), "utf8").catch(() => "");

test("sections two through four remain separately editable", async () => {
  const [family, frame, dress] = await Promise.all([
    read("FamilyChapter"),
    read("FramedPhotoChapter"),
    read("DressCodeChapter"),
  ]);
  assert.match(family, /id="families"/);
  assert.match(frame, /id="framed-photo"/);
  assert.match(dress, /id="dress-code"/);
  assert.match(dress, /dressCode\.colors\.map/);
});
```

- [ ] **Step 2: Run the test and confirm RED**

Run:

```bash
node --test tests/v4-invitation-chapters.test.mjs
```

Expected: failure for all three missing files.

- [ ] **Step 3: Implement `FamilyChapter.tsx`**

Render one quiet `<section id="families" aria-labelledby="families-title">` with:

- Ivory background and paper grain.
- Centered invitation card with fine outer and inset borders.
- Eyebrow “Together with our families”.
- `<h2 id="families-title">M <span aria-hidden>&amp;</span> M</h2>` with a champagne-gold ampersand.
- Supporting invitation sentence.
- A single reduced-motion-aware opacity/y reveal; no looping animation.

- [ ] **Step 4: Implement `FramedPhotoChapter.tsx`**

Render `<section id="framed-photo" aria-label="A framed memory together">` with:

- Violet background using `bg-violet` and the paper grain utility.
- One ivory scalloped frame built with CSS `clip-path` in `globals.css` as `.v4-scalloped-frame`.
- `PHOTOS[7]` via `<Image fill sizes="(max-width: 767px) 78vw, 560px">`.
- Decorative M&M seal with `aria-hidden="true"`.
- One scale/rotate/opacity entrance; final rotation no greater than two degrees.

Add the shared frame shape to `src/app/globals.css`:

```css
.v4-scalloped-frame {
  clip-path: polygon(
    3% 0,
    97% 0,
    100% 3%,
    98% 8%,
    100% 13%,
    98% 18%,
    100% 23%,
    98% 28%,
    100% 33%,
    98% 38%,
    100% 43%,
    98% 48%,
    100% 53%,
    98% 58%,
    100% 63%,
    98% 68%,
    100% 73%,
    98% 78%,
    100% 83%,
    98% 88%,
    100% 93%,
    97% 100%,
    3% 100%,
    0 97%,
    2% 92%,
    0 87%,
    2% 82%,
    0 77%,
    2% 72%,
    0 67%,
    2% 62%,
    0 57%,
    2% 52%,
    0 47%,
    2% 42%,
    0 37%,
    2% 32%,
    0 27%,
    2% 22%,
    0 17%,
    2% 12%,
    0 7%,
    0 3%
  );
}
```

- [ ] **Step 5: Implement `DressCodeChapter.tsx`**

Render `<section id="dress-code" aria-labelledby="dress-code-title">` as a responsive two-column layout:

- Text card uses `WEDDING.dressCode.title` and `.description`.
- Render every swatch with visible text:

```tsx
<ul className="mt-8 flex flex-wrap gap-4" aria-label="Suggested dress-code colors">
  {WEDDING.dressCode.colors.map((color, index) => (
    <motion.li key={color.label} {...swatchMotion(reduceMotion, index)}>
      <span
        aria-hidden="true"
        className="mx-auto block h-14 w-10 rounded-t-full rounded-b-md border border-wine/10"
        style={{ backgroundColor: color.value }}
      />
      <span className="mt-2 block text-xs text-wine/75">{color.label}</span>
    </motion.li>
  ))}
</ul>
```

- Supporting editorial print uses `PHOTOS[2]` and `next/image`.
- Text enters from the left and photograph from the right; reduced-motion mode removes both transforms.

- [ ] **Step 6: Run focused checks**

Run:

```bash
node --test tests/v4-invitation-chapters.test.mjs
npx tsc --noEmit
npx eslint src/components/v4/FamilyChapter.tsx src/components/v4/FramedPhotoChapter.tsx src/components/v4/DressCodeChapter.tsx tests/v4-invitation-chapters.test.mjs
```

Expected: all checks pass.

- [ ] **Step 7: Commit Task 3**

```bash
git add src/components/v4/FamilyChapter.tsx src/components/v4/FramedPhotoChapter.tsx src/components/v4/DressCodeChapter.tsx src/app/globals.css tests/v4-invitation-chapters.test.mjs
git commit -m "feat: add V4 invitation chapters"
```

---

### Task 4: Build section 5 schedule and section 6 borderless gallery

**Files:**

- Create: `src/components/v4/ScheduleChapter.tsx`
- Create: `src/components/v4/GalleryChapter.tsx`
- Modify: `src/components/GardenPath.tsx`
- Modify: `tests/editorial-structure.test.mjs`
- Create: `tests/v4-gallery.test.mjs`

**Interfaces:**

- Consumes: `WEDDING.schedule`, `V4_GALLERY_PHOTO_IDS`, `PHOTOS`.
- Produces: top-level sections `schedule` and `gallery`.
- Preserves: every schedule item visible without click state.

- [ ] **Step 1: Write failing schedule and gallery tests**

Update `tests/editorial-structure.test.mjs` to read `ScheduleChapter.tsx` and keep the existing no-click-state assertion for `GardenPath.tsx`.

Create `tests/v4-gallery.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/v4/GalleryChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("V4 gallery is a borderless full-width section", () => {
  assert.match(source, /id="gallery"/);
  assert.match(source, /V4_GALLERY_PHOTO_IDS\.map/);
  assert.match(source, /sizes="\(max-width: 767px\) 100vw, 50vw"/);
  assert.doesNotMatch(source, /border-\[/);
  assert.doesNotMatch(source, /max-w-/);
});
```

- [ ] **Step 2: Run focused tests and confirm RED**

Run:

```bash
node --test tests/editorial-structure.test.mjs tests/v4-gallery.test.mjs
```

Expected: missing V4 schedule/gallery files.

- [ ] **Step 3: Implement `ScheduleChapter.tsx` and update `GardenPath.tsx`**

`ScheduleChapter.tsx` renders `<section id="schedule">` with deep-wine background, title, and `<GardenPath schedule={WEDDING.schedule} />`.

Convert `GardenPath.tsx` to a client component using `motion` and `useReducedMotion`, while preserving a semantic `<ol>` and direct `schedule.map`. The connecting path is one decorative absolute element with `aria-hidden="true"`; entries alternate left and right at `md` widths and remain one readable column on mobile.

Use this motion rule for each `<li>`:

```tsx
const entryMotion = reduceMotion
  ? {}
  : {
      initial: { opacity: 0, x: index % 2 === 0 ? -28 : 28 },
      whileInView: { opacity: 1, x: 0 },
      viewport: { once: true, amount: 0.45 },
      transition: { duration: 0.55, delay: index * 0.08 },
    };
```

- [ ] **Step 4: Implement `GalleryChapter.tsx`**

Render one edge-to-edge `<section id="gallery" aria-label="Our photo gallery">` with no outer padding and no max-width container. Map `V4_GALLERY_PHOTO_IDS` to `PHOTOS[id]` and use an asymmetric CSS grid:

- First image spans two rows on desktop.
- Fourth image spans the full two-column width.
- Mobile alternates full-width and two-column cells without horizontal overflow.
- Images use `fill`, `object-cover`, accurate `objectPosition`, and `sizes="(max-width: 767px) 100vw, 50vw"`.
- Reveal uses opacity, scale from `0.97`, and saturation; hover scale is capped at `1.04` and disabled under reduced motion.

- [ ] **Step 5: Run focused checks**

Run:

```bash
node --test tests/editorial-structure.test.mjs tests/v4-gallery.test.mjs
npx tsc --noEmit
npx eslint src/components/v4/ScheduleChapter.tsx src/components/v4/GalleryChapter.tsx src/components/GardenPath.tsx tests/editorial-structure.test.mjs tests/v4-gallery.test.mjs
```

Expected: all checks pass.

- [ ] **Step 6: Commit Task 4**

```bash
git add src/components/v4/ScheduleChapter.tsx src/components/v4/GalleryChapter.tsx src/components/GardenPath.tsx tests/editorial-structure.test.mjs tests/v4-gallery.test.mjs
git commit -m "feat: add V4 schedule and gallery"
```

---

### Task 5: Build section 7 location with a real QR code

**Files:**

- Modify: `package.json`
- Modify: `package-lock.json`
- Create: `src/components/v4/LocationChapter.tsx`
- Create: `tests/v4-location.test.mjs`

**Interfaces:**

- Consumes: `getLocationUrl`, `WEDDING.venue`, `WEDDING.dateLong`, `WEDDING.timeLabel`, `PHOTOS[10]`.
- Produces: top-level section `venue`.
- Adds: `qrcode.react` runtime dependency and `QRCodeSVG` rendering.

- [ ] **Step 1: Write the failing location component test**

Create `tests/v4-location.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const source = await readFile(
  new URL("../src/components/v4/LocationChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("location uses the same resolved URL for link and QR", () => {
  assert.match(source, /id="venue"/);
  assert.match(source, /const locationUrl = getLocationUrl/);
  assert.match(source, /href=\{locationUrl\}/);
  assert.match(source, /<QRCodeSVG/);
  assert.match(source, /value=\{locationUrl\}/);
});
```

- [ ] **Step 2: Run the location test and confirm RED**

Run:

```bash
node --test tests/v4-location.test.mjs
```

Expected: failure because `LocationChapter.tsx` is missing.

- [ ] **Step 3: Install the QR renderer**

Run:

```bash
npm install qrcode.react
```

Expected: `package.json` and `package-lock.json` record `qrcode.react`; no other direct dependency is added.

- [ ] **Step 4: Implement `LocationChapter.tsx`**

Create a client component with:

```tsx
const locationUrl = getLocationUrl(
  WEDDING.venue.mapUrl,
  WEDDING.venue.address
);
```

Render `<section id="venue" aria-labelledby="venue-title">` as a responsive two-column composition:

- Editorial print with `PHOTOS[10]`.
- Venue name, reception name, address, date, and time as text.
- Stylized noninteractive map background with decorative location pin.
- `<a href={locationUrl} target="_blank" rel="noreferrer">Open location</a>`.
- Conditional calendar link when `WEDDING.venue.calendarUrl` is non-null.
- Real QR code:

```tsx
<QRCodeSVG
  value={locationUrl}
  size={144}
  marginSize={2}
  bgColor="#FFFAF3"
  fgColor="#51313A"
  title={`Scan for directions to ${WEDDING.venue.name}`}
/>
```

The visible label beneath the SVG is “Scan for directions”. The photo enters from the left and details from the right; both settle without rotation in reduced-motion mode.

- [ ] **Step 5: Run focused checks**

Run:

```bash
node --test tests/location.test.mjs tests/v4-location.test.mjs
npx tsc --noEmit
npx eslint src/components/v4/LocationChapter.tsx src/lib/location.ts tests/location.test.mjs tests/v4-location.test.mjs
```

Expected: all checks pass.

- [ ] **Step 6: Commit Task 5**

```bash
git add package.json package-lock.json src/components/v4/LocationChapter.tsx tests/v4-location.test.mjs
git commit -m "feat: add V4 location and QR card"
```

---

### Task 6: Build section 8 cinematic image and section 9 RSVP ending

**Files:**

- Create: `src/components/v4/FinalImageChapter.tsx`
- Create: `src/components/v4/RSVPChapter.tsx`
- Modify: `src/components/FAQSection.tsx`
- Modify: `src/components/RSVPForm.tsx`
- Create: `tests/v4-ending.test.mjs`

**Interfaces:**

- Consumes: `PHOTOS[9]`, `PHOTOS[1]`, `PHOTOS[8]`, existing `RSVPForm`, and nested FAQ/footer content.
- Produces: top-level sections `final-image` and `rsvp`.
- `RSVPChapter` accepts `children: ReactNode` so FAQ/footer remain visually inside section 9.

- [ ] **Step 1: Write the failing ending test**

Create `tests/v4-ending.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const finalImage = await readFile(
  new URL("../src/components/v4/FinalImageChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");
const rsvp = await readFile(
  new URL("../src/components/v4/RSVPChapter.tsx", import.meta.url),
  "utf8"
).catch(() => "");

test("V4 ends with a cinematic image and one RSVP section", () => {
  assert.match(finalImage, /id="final-image"/);
  assert.match(finalImage, /PHOTOS\[9\]/);
  assert.match(rsvp, /id="rsvp"/);
  assert.match(rsvp, /RSVPForm/);
  assert.match(rsvp, /children/);
});
```

- [ ] **Step 2: Run the ending test and confirm RED**

Run:

```bash
node --test tests/v4-ending.test.mjs
```

Expected: failure because both V4 ending files are missing.

- [ ] **Step 3: Implement `FinalImageChapter.tsx`**

Render `<section id="final-image" aria-label="One final memory before RSVP">` with:

- `PHOTOS[9]` as a borderless full-width `Image fill sizes="100vw"`.
- A lower gradient overlay.
- Caption “One more memory” and “Before the next chapter begins”.
- Scroll-linked scale from `1` to `1.045` using the existing `useElementScrollProgress` and `mapScrollProgress` helpers.
- No image transform when reduced motion is enabled.

- [ ] **Step 4: Implement `RSVPChapter.tsx`**

Use this public interface:

```tsx
interface RSVPChapterProps {
  children: ReactNode;
}

export default function RSVPChapter({ children }: RSVPChapterProps) {
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);
  // render section, response card, RSVPForm, then children
}
```

Render one `<section id="rsvp" aria-labelledby="rsvp-title">` containing:

- Pink editorial background and subtle `PHOTOS[6]` backdrop.
- Layered ivory response card with M&M seal.
- Decorative photo strip using `PHOTOS[1]` and `PHOTOS[8]` with empty alt text.
- “RSVP” heading, supporting copy, and button opening the existing `RSVPForm`.
- `<RSVPForm isOpen={isRSVPOpen} onClose={() => setIsRSVPOpen(false)} />`.
- `{children}` after the response card and form mount, so FAQ/footer remain part of section 9.

Use a short scale/rotate reveal for the response card and render it settled when reduced motion is enabled.

- [ ] **Step 5: Integrate FAQ/footer into section 9**

In `src/components/FAQSection.tsx`:

- Change the outer `<section>` to `<div id="garden-whispers" aria-labelledby="garden-whispers-title">`.
- Add `id="garden-whispers-title"` to its heading.
- Remove the separate cream page background; inherit the RSVP ending background and use an ivory inner panel.
- Preserve accordion state, accessible controls, back-to-top, invitation replay, and footer copy.

In `src/components/RSVPForm.tsx`, change only visual tokens needed for the V4 palette. Do not change schema, validation, submission, focus trap, download behavior, or wish-wall behavior.

- [ ] **Step 6: Run ending, RSVP, type, and lint checks**

Run:

```bash
node --test tests/v4-ending.test.mjs tests/invitation-intro.test.mjs
npx tsc --noEmit
npx eslint src/components/v4/FinalImageChapter.tsx src/components/v4/RSVPChapter.tsx src/components/FAQSection.tsx src/components/RSVPForm.tsx tests/v4-ending.test.mjs
```

Expected: all checks pass; the known React Hook Form compiler warning may remain, but no new warning is introduced.

- [ ] **Step 7: Commit Task 6**

```bash
git add src/components/v4/FinalImageChapter.tsx src/components/v4/RSVPChapter.tsx src/components/FAQSection.tsx src/components/RSVPForm.tsx tests/v4-ending.test.mjs
git commit -m "feat: add V4 cinematic RSVP ending"
```

---

### Task 7: Assemble the nine-section page and update navigation

**Files:**

- Modify: `src/app/page.tsx`
- Modify: `src/components/GardenNav.tsx`
- Modify: `src/hooks/useSections.tsx`
- Modify: `tests/editorial-structure.test.mjs`
- Modify: `tests/wedding-content.test.mjs`
- Delete: `src/components/HeroSection.tsx`
- Delete: `src/components/OurStory.tsx`
- Delete: `src/components/EventDetails.tsx`
- Delete: `src/components/hero/PetalsCanvas.tsx`

**Interfaces:**

- Consumes: all nine V4 chapter components and existing `FAQSection`.
- Produces: the final page order and updated section announcements/navigation.

- [ ] **Step 1: Write the failing page-order test**

Replace the old component-specific ordering assertion in `tests/editorial-structure.test.mjs` with:

```js
test("page renders the nine V4 chapters in approved order", async () => {
  const source = await readFile(
    new URL("../src/app/page.tsx", import.meta.url),
    "utf8"
  );
  const components = [
    "OpeningChapter",
    "FamilyChapter",
    "FramedPhotoChapter",
    "DressCodeChapter",
    "ScheduleChapter",
    "GalleryChapter",
    "LocationChapter",
    "FinalImageChapter",
    "RSVPChapter",
  ];
  const positions = components.map((name) => source.indexOf(`<${name}`));
  assert.ok(positions.every((position) => position >= 0));
  assert.deepEqual(positions, [...positions].sort((a, b) => a - b));
  assert.match(source, /<RSVPChapter>\s*<FAQSection \/>\s*<\/RSVPChapter>/s);
});
```

Update the navigation assertion in `tests/wedding-content.test.mjs` to expect:

```js
assert.deepEqual(
  content.NAV_ITEMS.map((item) => item.id),
  ["families", "schedule", "gallery", "venue", "garden-whispers"]
);
```

- [ ] **Step 2: Run structure tests and confirm RED**

Run:

```bash
node --test tests/editorial-structure.test.mjs tests/wedding-content.test.mjs
```

Expected: page still imports the old three broad components.

- [ ] **Step 3: Assemble `src/app/page.tsx`**

Replace the old main content with this exact component order:

```tsx
<main className="overflow-x-clip bg-cream">
  <OpeningChapter />
  <FamilyChapter />
  <FramedPhotoChapter />
  <DressCodeChapter />
  <ScheduleChapter />
  <GalleryChapter />
  <LocationChapter />
  <FinalImageChapter />
  <RSVPChapter>
    <FAQSection />
  </RSVPChapter>
</main>
```

Keep `InvitationIntro`, `GardenNav`, `SectionsProvider`, and `#wedding-page` unchanged around the new main content.

- [ ] **Step 4: Update section announcements and navigation styling**

In `src/hooks/useSections.tsx`, replace `SECTION_LABELS` with complete labels for the nine V4 IDs plus `garden-whispers`:

```ts
const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Opening invitation",
  families: "Together with our families",
  "framed-photo": "Framed memory",
  "dress-code": "Dress code",
  schedule: "Schedule",
  gallery: "Photo gallery",
  venue: "Location",
  "final-image": "Final memory",
  rsvp: "RSVP",
  "garden-whispers": "Frequently asked questions",
};
```

In `GardenNav.tsx`, preserve all menu behavior and update green/cream visual classes to wine/ivory/rose tokens. Remove the flower glyph from the RSVP button because V5 floral decoration is excluded.

- [ ] **Step 5: Delete superseded page components**

Delete the old `HeroSection.tsx`, `OurStory.tsx`, `EventDetails.tsx`, and unused `hero/PetalsCanvas.tsx`. Confirm no imports remain:

```bash
rg -n "HeroSection|OurStory|EventDetails|PetalsCanvas" src tests
```

Expected: no matches.

- [ ] **Step 6: Run structure, scroll, type, and lint checks**

Run:

```bash
node --test tests/editorial-structure.test.mjs tests/wedding-content.test.mjs tests/scroll.test.mjs
npx tsc --noEmit
npx eslint src/app/page.tsx src/components/GardenNav.tsx src/hooks/useSections.tsx src/components/v4 tests/editorial-structure.test.mjs tests/wedding-content.test.mjs
```

Expected: all checks pass.

- [ ] **Step 7: Commit Task 7**

```bash
git add src/app/page.tsx src/components/GardenNav.tsx src/hooks/useSections.tsx src/components/v4 tests/editorial-structure.test.mjs tests/wedding-content.test.mjs
git add -u src/components/HeroSection.tsx src/components/OurStory.tsx src/components/EventDetails.tsx src/components/hero/PetalsCanvas.tsx
git commit -m "feat: assemble nine-section V4 journey"
```

---

### Task 8: Responsive, accessibility, and live-browser acceptance pass

**Files:**

- Modify only files with verified issues from the checks below.
- Test: all files under `tests/`.

**Interfaces:**

- Verifies the completed V4 page as one system.
- Produces no new abstraction or dependency.

- [ ] **Step 1: Run the complete automated verification baseline**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
git diff --check
```

Expected: all tests and TypeScript pass; lint has no errors. The existing React Hook Form compiler warning is acceptable only if unchanged.

- [ ] **Step 2: Run the production build**

Run:

```bash
npm run build
```

Expected: Next.js compiles, runs TypeScript, generates `/`, and reports a successful static build. If the sandbox blocks Google Fonts, rerun the same command with network approval; do not change font code to hide the sandbox failure.

- [ ] **Step 3: Verify first-visit and returning-visit behavior in the live browser**

At desktop width `1440×1000`:

1. Clear `mm-invitation-v1`.
2. Reload and confirm the pink envelope dialog is focused and background content is inert.
3. Activate the M&M seal and confirm the rising photograph/fade completes, scrolling unlocks, and focus moves to `#wedding-title`.
4. Reload and confirm the intro is skipped.
5. Use footer “Replay invitation” and confirm scroll position becomes `0` before the dialog locks the page.

- [ ] **Step 4: Verify all nine sections and interactions**

At desktop and mobile width `390×844`, confirm:

- Sections occur once and in approved order.
- No horizontal document overflow.
- Vinyl shows disabled “Our song coming soon” because `audioUrl` is null.
- Dress-code labels are readable beside swatches.
- Schedule entries are all visible without clicking.
- Gallery is edge to edge and has no borders.
- Location link and QR encode the same resolved URL.
- RSVP opens, closes, validates, submits, and preserves focus behavior.
- FAQ accordion, back-to-top, invitation replay, and mobile navigation work.
- Browser console has no warnings or errors caused by V4.

- [ ] **Step 5: Verify reduced-motion mode**

Use browser emulation for `prefers-reduced-motion: reduce` when available. Confirm:

- Intro uses its short fade.
- Envelope/photo, swatches, schedule entries, gallery, and final image render in settled states.
- Vinyl does not rotate.
- Navigation scroll behavior is immediate.

If browser emulation is unavailable, inspect every `useReducedMotion` branch and retain the existing scroll unit tests as evidence.

- [ ] **Step 6: Fix only observed acceptance failures and rerun their narrowest checks**

For each observed issue:

1. Record the exact viewport and reproduction.
2. Add or update the smallest relevant test when behavior can be automated.
3. Apply one focused fix.
4. Rerun the focused test, TypeScript, and scoped ESLint before continuing.

- [ ] **Step 7: Run final verification after all fixes**

Run fresh:

```bash
npm test
npx tsc --noEmit
npm run lint
npm run build
git diff --check
```

Expected: all commands succeed, aside from the previously documented unchanged React Hook Form compiler warning.

- [ ] **Step 8: Record the final verified commit state**

Run:

```bash
git status --short
git log -1 --oneline
```

Expected: only pre-existing unrelated workspace changes remain. If Step 6 exposed a product defect, stop this plan at that defect, use `superpowers:systematic-debugging`, add a failing regression test, and commit the focused fix before repeating Steps 1–7.

---

## Execution Handoff

After every task, run its focused checks, review the diff, and complete the required V4 screenshot critique before beginning the next task. Preserve unrelated dirty files throughout execution. Every dispatched worker prompt must require `frontend-design:frontend-design` in addition to the execution skill selected for this plan.
