# Opening Envelope Two-Sided Flap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILLS: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task, and use frontend-design:frontend-design for every UI implementation task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep the invitation envelope’s closing flap visible when open by rendering a two-sided 3D flap with a petal lining, shared by the first-visit intro and the hero.

**Architecture:** Extract `src/components/InvitationEnvelope.tsx` as the single envelope. The rotating wrapper hinges at the top from `0°` to `178°` and must not use `backface-visibility: hidden`. A paper front face and a petal back face (`rotateX(180deg)`, both `backface-hidden`) make the lining read as an inverted triangle above the envelope. `InvitationIntro` and `OpeningChapter` pass `open` / `seal` and keep the existing `top-[43%] md:top-[54%]` viewport anchor.

**Tech Stack:** Next.js 16.2.7 App Router, React 19.2.4, TypeScript, Tailwind CSS 4, Framer Motion 12, `next/image`, Node test runner.

**Spec:** `docs/superpowers/specs/2026-09-04-opening-envelope-flap-design.md`

## File map

| File | Responsibility |
|---|---|
| Create `src/components/InvitationEnvelope.tsx` | Shared envelope: body, two-sided flap, photo 1, seal |
| Create `tests/invitation-envelope.test.mjs` | Flap faces, stacking, reduced-motion, shared consumers |
| Modify `src/components/v4/OpeningChapter.tsx` | Replace inlined envelope with shared component, `open` |
| Modify `src/components/InvitationIntro.tsx` | Replace inlined envelope with shared component, sealed vs opening |
| Modify `tests/v4-opening.test.mjs` | Handoff still shares the viewport anchor; hero uses the shared envelope |
| Modify `tests/invitation-intro-focus.test.mjs` | Mock the extracted envelope module |

## Global constraints

- Do not change countdown, vinyl, song URL, envelope size, photograph choice, storage key, or replay.
- Reuse Framer Motion; add no second animation library.
- Use tokens `bg-paper` (flap outside) and `bg-petal` (lining and body) only.
- Respect reduced motion: duration `0`, lining visible in the open pose.
- Do not stage unrelated workspace files (`.superpowers/brainstorm/`, leftover Our Story docs).
- Every UI task must invoke `frontend-design:frontend-design` before editing components.

---

### Task 1: Lock the two-sided flap contract with failing tests

**Files:**

- Create: `tests/invitation-envelope.test.mjs`
- Modify: `tests/v4-opening.test.mjs`

**Step 1: Write the failing envelope contract tests**

Create `tests/invitation-envelope.test.mjs`:

```js
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const envelope = await readFile(
  new URL("../src/components/InvitationEnvelope.tsx", import.meta.url),
  "utf8"
).catch(() => "");
const opening = await readFile(
  new URL("../src/components/v4/OpeningChapter.tsx", import.meta.url),
  "utf8"
);
const intro = await readFile(
  new URL("../src/components/InvitationIntro.tsx", import.meta.url),
  "utf8"
);

test("the flap is two-sided paper with a petal lining", () => {
  assert.match(
    envelope,
    /origin-top \[transform-style:preserve-3d\]/
  );
  assert.match(
    envelope,
    /bg-paper \[clip-path:polygon\(0_0,100%_0,50%_100%\)\] \[backface-visibility:hidden\]/
  );
  assert.match(
    envelope,
    /bg-petal \[clip-path:polygon\(0_0,100%_0,50%_100%\)\] \[transform:rotateX\(180deg\)\] \[backface-visibility:hidden\]/
  );
  assert.match(envelope, /rotateX: open \? 178 : 0/);
  assert.doesNotMatch(envelope, /style=\{\{[\s\S]*backfaceVisibility:\s*"hidden"/);
});

test("an open photograph stacks above the folded flap", () => {
  assert.match(envelope, /open \? "z-\[6\]" : "z-\[2\]"/);
  assert.match(envelope, /z-\[4\] h-\[58%\] origin-top/);
});

test("reduced motion skips the flip and still shows the lining", () => {
  assert.match(envelope, /duration: reduceMotion \? 0 : 0\.72/);
  assert.match(envelope, /duration: reduceMotion \? 0 : 1\.05/);
  assert.match(envelope, /duration: reduceMotion \? 0 : 0\.35/);
});

test("intro and hero render the shared envelope at the handoff anchor", () => {
  const viewportAnchor = /top-\[43%\][^"\n]*md:top-\[54%\]/;

  assert.match(envelope, /InvitationEnvelope/);
  assert.match(opening, /<InvitationEnvelope/);
  assert.match(intro, /<InvitationEnvelope/);
  assert.match(opening, viewportAnchor);
  assert.match(intro, viewportAnchor);
  assert.doesNotMatch(opening, /backfaceVisibility:\s*"hidden"/);
  assert.doesNotMatch(intro, /backfaceVisibility:\s*"hidden"/);
});
```

In `tests/v4-opening.test.mjs`, keep the countdown/vinyl test and the intro-copy test. Replace the handoff test so it still checks the shared anchor and requires the extracted envelope:

```js
test("invitation handoff shares the hero envelope viewport anchor", () => {
  const viewportAnchor = /top-\[43%\][^"\n]*md:top-\[54%\]/;

  assert.match(source, viewportAnchor);
  assert.match(introSource, viewportAnchor);
  assert.match(source, /<InvitationEnvelope/);
  assert.match(introSource, /<InvitationEnvelope/);
  assert.doesNotMatch(introSource, /y:\s*70/);
});
```

- [ ] **Step 2: Run the tests and verify RED**

Run:

```bash
node --test tests/invitation-envelope.test.mjs tests/v4-opening.test.mjs
```

Expected: FAIL. `InvitationEnvelope.tsx` is missing (empty string / no two-sided flap matches). Opening and intro still inline a single-face flap with `backfaceVisibility: "hidden"` and do not render `<InvitationEnvelope`.

- [ ] **Step 3: Commit the failing tests**

```bash
git add tests/invitation-envelope.test.mjs tests/v4-opening.test.mjs
git commit -m "test: require a two-sided opening envelope flap"
```

---

### Task 2: Build `InvitationEnvelope`

**Files:**

- Create: `src/components/InvitationEnvelope.tsx`
- Test: `tests/invitation-envelope.test.mjs`

- [ ] **Step 1: Invoke frontend-design, then implement the shared envelope**

Read and follow `frontend-design:frontend-design`. Do not invent a new envelope silhouette. Create `src/components/InvitationEnvelope.tsx` exactly as follows:

```tsx
"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import type { Ref } from "react";
import { PHOTOS } from "@/content/wedding";

const flapEase = [0.65, 0, 0.35, 1] as const;
const photoEase = [0.22, 1, 0.36, 1] as const;
const tucked = { y: "8%", rotate: -1, opacity: 0 };
const risen = { y: "-62%", rotate: 1.5, opacity: 1 };

export interface InvitationEnvelopeProps {
  open: boolean;
  seal: "button" | "decorative";
  reduceMotion: boolean;
  onOpen?: () => void;
  openButtonRef?: Ref<HTMLButtonElement>;
  sealDisabled?: boolean;
}

export default function InvitationEnvelope({
  open,
  seal,
  reduceMotion,
  onOpen,
  openButtonRef,
  sealDisabled = false,
}: InvitationEnvelopeProps) {
  const photo = PHOTOS[1];
  const sealClassName = `absolute left-1/2 top-[54%] z-[5] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-foreground/15 bg-accent-primary font-serif text-sm tracking-[0.08em] text-foreground shadow-[0_11px_25px_rgba(75,44,34,0.22)] outline-none focus-visible:ring-4 focus-visible:ring-cream/80 disabled:pointer-events-none md:h-[68px] md:w-[68px] ${reduceMotion ? "" : "transition-transform hover:scale-105"}`;

  return (
    <div className="relative mx-auto h-[46vw] min-h-56 max-h-[335px] w-[min(88vw,610px)] [perspective:1200px]">
      <div className="absolute inset-0 [transform-style:preserve-3d]">
        <div className="absolute inset-0 bg-petal shadow-[0_31px_64px_rgba(55,23,32,0.34)]" />

        <motion.div
          aria-hidden={!open}
          className={`absolute inset-x-[8%] top-[9%] h-[82%] bg-cream p-2 pb-8 text-foreground shadow-[0_14px_30px_rgba(60,30,38,0.24)] md:p-3 md:pb-10 ${open ? "z-[6]" : "z-[2]"}`}
          initial={reduceMotion ? false : tucked}
          animate={open ? risen : tucked}
          transition={{
            duration: reduceMotion ? 0 : 1.05,
            delay: reduceMotion ? 0 : open ? 0.72 : 0,
            ease: photoEase,
          }}
        >
          <div className="relative h-full overflow-hidden">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              loading="eager"
              sizes="(max-width: 768px) 74vw, 500px"
              className="object-cover"
              style={{ objectPosition: photo.objectPosition }}
            />
          </div>
          <span className="absolute inset-x-0 bottom-2 text-center font-serif text-sm italic md:bottom-3 md:text-base">
            You&apos;re invited
          </span>
        </motion.div>

        <motion.div
          className="absolute inset-x-0 top-0 z-[4] h-[58%] origin-top [transform-style:preserve-3d]"
          initial={reduceMotion ? false : { rotateX: 0 }}
          animate={{ rotateX: open ? 178 : 0 }}
          transition={{
            duration: reduceMotion ? 0 : 0.72,
            ease: flapEase,
          }}
          aria-hidden="true"
        >
          <div className="absolute inset-0 bg-paper [clip-path:polygon(0_0,100%_0,50%_100%)] [backface-visibility:hidden]" />
          <div className="absolute inset-0 bg-petal [clip-path:polygon(0_0,100%_0,50%_100%)] [transform:rotateX(180deg)] [backface-visibility:hidden]" />
        </motion.div>

        <div
          className="absolute inset-0 z-[3] bg-petal [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 z-[3] border border-cream/35 [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
          aria-hidden="true"
        />

        {seal === "button" ? (
          <motion.button
            ref={openButtonRef}
            type="button"
            onClick={onOpen}
            disabled={open || sealDisabled}
            aria-label="Open M and M wedding invitation"
            className={sealClassName}
            animate={
              !open
                ? { opacity: 1, scale: 1 }
                : { opacity: 0, scale: 0.55, rotate: -12 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
          >
            M&amp;M
          </motion.button>
        ) : (
          <motion.div
            className={sealClassName}
            initial={
              reduceMotion ? false : { opacity: 1, scale: 1, rotate: 0 }
            }
            animate={
              open
                ? { opacity: 0, scale: 0.55, rotate: -12 }
                : { opacity: 1, scale: 1, rotate: 0 }
            }
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
            aria-hidden="true"
          >
            M&amp;M
          </motion.div>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Run the envelope-only tests**

Run:

```bash
node --test tests/invitation-envelope.test.mjs
```

Expected: the first three tests PASS (flap, stacking, reduced motion). The fourth test still FAILS because intro and hero do not render `<InvitationEnvelope` yet. That failure is Task 3 and Task 4. Do not weaken the fourth test.

- [ ] **Step 3: Commit the shared envelope**

```bash
git add src/components/InvitationEnvelope.tsx
git commit -m "feat: add two-sided invitation envelope"
```

---

### Task 3: Use the shared envelope in the hero

**Files:**

- Modify: `src/components/v4/OpeningChapter.tsx`
- Test: `tests/v4-opening.test.mjs`
- Test: `tests/invitation-envelope.test.mjs`

- [ ] **Step 1: Replace the inlined hero envelope**

Read and follow `frontend-design:frontend-design`. In `src/components/v4/OpeningChapter.tsx`:

- Import `InvitationEnvelope` from `@/components/InvitationEnvelope`.
- Remove the inlined envelope block (the `top-[43%]` box and all of its children).
- Remove unused `motion` import if nothing else in the file uses it.
- Keep photo 6, the title, countdown, and vinyl exactly as they are.

The cover should look like this around the envelope:

```tsx
        <div className="absolute inset-x-0 top-[43%] z-10 md:top-[54%]">
          <InvitationEnvelope
            open
            seal="decorative"
            reduceMotion={reduceMotion}
          />
        </div>
```

Full `OpeningChapter` after the edit:

```tsx
"use client";

import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import Image from "next/image";
import { useRef, useState } from "react";
import Countdown from "@/components/hero/Countdown";
import InvitationEnvelope from "@/components/InvitationEnvelope";
import { PHOTOS, WEDDING } from "@/content/wedding";

export default function OpeningChapter() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const reduceMotion = useHydrationSafeReducedMotion();
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

  return (
    <section id="hero" className="garden-section overflow-hidden bg-wine">
      <div className="relative min-h-[100svh] overflow-hidden bg-foreground text-cream">
        <Image
          src={PHOTOS[6].src}
          alt={PHOTOS[6].alt}
          fill
          preload
          sizes="100vw"
          className="object-cover opacity-35 saturate-[.65] contrast-[.92]"
          style={{ objectPosition: PHOTOS[6].objectPosition }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-foreground/30 to-foreground/85"
          aria-hidden="true"
        />

        <header className="absolute inset-x-5 top-[9%] z-20 text-center md:top-[6%]">
          <p className="text-[9px] uppercase tracking-[0.27em] text-cream/85">
            Together with our families
          </p>
          <h1
            id="wedding-title"
            tabIndex={-1}
            className="mt-3 font-serif text-6xl italic leading-[0.86] outline-none focus-visible:ring-2 focus-visible:ring-petal md:text-8xl lg:text-[6.75rem]"
          >
            M &amp; M
          </h1>
          <p className="mt-4 text-[9px] uppercase tracking-[0.22em] text-cream/85">
            {WEDDING.dateLabel} · {WEDDING.venue.name}
          </p>
        </header>

        <div className="absolute inset-x-0 top-[43%] z-10 md:top-[54%]">
          <InvitationEnvelope
            open
            seal="decorative"
            reduceMotion={reduceMotion}
          />
        </div>
      </div>

      <div className="grid min-h-[520px] items-center gap-14 bg-wine px-5 py-20 text-cream md:grid-cols-[1.15fr_.85fr] md:gap-[clamp(30px,7vw,90px)] md:px-[7vw] md:py-24">
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.27em] text-petal">
            The celebration begins in
          </p>
          <h2 className="mt-3 font-serif text-5xl italic md:text-6xl">
            Countdown
          </h2>
          <Countdown targetDateIso={WEDDING.dateIso} />
        </div>

        <div className="text-center">
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
            className="group mx-auto flex flex-col items-center gap-5 rounded-sm p-2 text-cream outline-none focus-visible:ring-2 focus-visible:ring-petal disabled:cursor-not-allowed disabled:opacity-75"
          >
            <span
              aria-hidden="true"
              className={`relative block aspect-square w-[min(58vw,250px)] rounded-full bg-[repeating-radial-gradient(circle,#2e2024_0_4px,#3c292f_5px_7px)] shadow-[0_18px_38px_rgba(30,14,19,0.3)] before:absolute before:inset-[34%] before:grid before:place-items-center before:rounded-full before:bg-dusty before:font-serif before:text-xl before:italic before:text-cream before:content-['M&M'] after:absolute after:left-1/2 after:top-1/2 after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-cream ${isPlaying && !reduceMotion ? "animate-spin [animation-duration:6s]" : ""}`}
            />
            <span className="text-[9px] uppercase tracking-[0.22em]">
              {audioUrl
                ? isPlaying
                  ? "Pause our song"
                  : "Listen to our song"
                : "Our song coming soon"}
            </span>
          </button>
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="none"
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
```

Because `open` is always true, Framer still plays closed → open on mount when `reduceMotion` is false (`initial` is `{ rotateX: 0 }` / tucked photo). Reduced motion uses `initial={false}` and settles open.

- [ ] **Step 2: Run focused tests**

Run:

```bash
node --test tests/v4-opening.test.mjs tests/invitation-envelope.test.mjs
```

Expected: opening tests PASS. Envelope consumer test still FAILS on intro (`<InvitationEnvelope` missing there). Do not change intro yet.

- [ ] **Step 3: Commit the hero wiring**

```bash
git add src/components/v4/OpeningChapter.tsx
git commit -m "feat: use the shared envelope in the opening chapter"
```

---

### Task 4: Use the shared envelope in the intro

**Files:**

- Modify: `src/components/InvitationIntro.tsx`
- Modify: `tests/invitation-intro-focus.test.mjs`
- Test: `tests/invitation-envelope.test.mjs`
- Test: `tests/invitation-intro-focus.test.mjs`
- Test: `tests/v4-opening.test.mjs`

- [ ] **Step 1: Update the intro focus test mock**

In `tests/invitation-intro-focus.test.mjs`, add a module mock so compiling `InvitationIntro` does not pull the real envelope:

```js
  if (specifier === "@/components/InvitationEnvelope") {
    return { __esModule: true, default: () => null };
  }
```

Place it with the other `specifier ===` branches, before the final `throw`.

- [ ] **Step 2: Replace the inlined intro envelope**

Read and follow `frontend-design:frontend-design`. In `src/components/InvitationIntro.tsx`:

- Import `InvitationEnvelope`.
- Remove `Image` and `PHOTOS` imports if unused.
- Keep the overlay, copy, focus trap, storage, and timings.
- Replace the inner `relative h-[46vw] ...` envelope tree with:

```tsx
        <InvitationEnvelope
          open={opening}
          seal="button"
          reduceMotion={reduceMotion}
          onOpen={openInvitation}
          openButtonRef={openButtonRef}
          sealDisabled={stage === "checking"}
        />
```

Keep the parent cluster:

```tsx
      <motion.div
        className="absolute inset-x-0 top-[43%] z-10 flex flex-col items-center md:top-[54%]"
        initial={false}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
      >
```

`opening` remains `stage === "opening"`. Sealed stays `open={false}`. Reduced-motion intro still uses `reduceMotion ? 160 : 3200` for dismiss.

- [ ] **Step 3: Run focused tests and verify GREEN**

Run:

```bash
node --test tests/invitation-envelope.test.mjs tests/v4-opening.test.mjs tests/invitation-intro-focus.test.mjs tests/invitation-intro.test.mjs
```

Expected: all PASS, including “intro and hero render the shared envelope at the handoff anchor”.

- [ ] **Step 4: Commit the intro wiring**

```bash
git add src/components/InvitationIntro.tsx tests/invitation-intro-focus.test.mjs
git commit -m "feat: use the shared envelope in the invitation intro"
```

---

### Task 5: Verify the open flap on the live page

**Files:** none unless an observed defect needs a focused fix.

- [ ] **Step 1: Run the full automated baseline**

Run:

```bash
npm test
npx tsc --noEmit
npm run lint
```

Expected: all tests pass. TypeScript is clean. Lint has no new errors. The existing `react-hooks/incompatible-library` warning in `src/components/RSVPForm.tsx` is acceptable only if unchanged.

- [ ] **Step 2: Browser-check closed, opening, and open**

Use the existing dev server if it is this app; otherwise `npm run dev`. At desktop `1440×1000` and mobile `390×844`:

1. Clear `mm-invitation-v1` and reload.
2. Closed intro: ivory downward flap, gold seal, no risen photo.
3. Tap the seal: flap folds up; **petal lining stays visible as an inverted triangle above the envelope**; photo rises in front of the pocket and flap.
4. After dismiss, the hero envelope matches: lining visible above, photo unobstructed.
5. Emulate `prefers-reduced-motion: reduce`: intro jumps open with lining visible; hero loads already open with lining visible; no flip.

If a defect appears, add the smallest source assertion to `tests/invitation-envelope.test.mjs`, fix only that defect, and rerun the focused test plus Step 1.

- [ ] **Step 3: Commit only if Step 2 produced a fix**

If no code changed, do not create an empty commit.

If a fix landed:

```bash
git add src/components/InvitationEnvelope.tsx tests/invitation-envelope.test.mjs
git commit -m "fix: keep the open envelope lining unobstructed"
```

---

## Self-review

**Spec coverage**

| Spec requirement | Task |
|---|---|
| Two-sided flap, wrapper not backface-hidden | 1, 2 |
| Front `bg-paper`, lining `bg-petal` | 1, 2 |
| Open pose is inverted triangle above the envelope | 2, 5 |
| Photo in front of flap when open | 1, 2 |
| Shared `InvitationEnvelope` | 2, 3, 4 |
| Intro sealed vs opening | 4 |
| Hero always open, mount animation when motion allowed | 3 |
| Reduced motion duration 0, lining visible | 1, 2, 5 |
| Viewport anchor unchanged | 1, 3, 4 |
| Countdown / vinyl / song untouched | 3 |
| Existing intro focus tests | 4, 5 |

**Placeholders:** none. **Names:** `InvitationEnvelope`, `open`, `seal`, `sealDisabled` are consistent across tasks.
