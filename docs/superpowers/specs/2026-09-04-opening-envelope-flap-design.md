# Opening Envelope Two-Sided Flap Design

**Date:** 2026-09-04  
**Status:** Approved  
**Section:** Opening (`#hero`) and first-visit invitation intro  
**Parent:** `docs/superpowers/specs/2026-08-23-pink-editorial-v4-design.md`

## Goal

When the invitation envelope is open, the closing flap remains visible as folded-back inner paper above the envelope, instead of disappearing.

## Problem

The flap is a single downward triangle that rotates to `rotateX: 178` with `backface-visibility: hidden` on the rotating element. Past 90° the front face is culled, so the paper vanishes.

This is visible in two places:

- `InvitationIntro` after the guest taps the seal
- `OpeningChapter`, which settles in the open pose on load

## Chosen Approach

A two-sided 3D flap. The parent hinges at the top edge from `0°` to `178°`. The front face is the closed ivory paper. The back face is the inner lining. When open, that lining reads as an inverted triangle sitting above the envelope.

Rejected:

- Parking the flap half-open, which never looks fully opened and fights the rising photograph
- Fading in a second triangle while hiding the flipping flap, which is less physical

## Visual Behavior

**Closed**

- Ivory downward triangle covers the pocket
- Gold M&M seal sits on the flap
- Photograph is inside the envelope and not the focus

**Opening**

- Seal fades and becomes non-interactive
- Flap hinges at the top edge and folds up
- Photograph then rises from the pocket

**Open**

- Inner lining stays on screen as an inverted triangle above the envelope
- Photograph sits in front of the pocket and in front of the folded flap
- Envelope body (petal pocket) still frames the lower part of the paper

**Reduced motion**

- Envelope starts and stays in the open pose
- Lining is visible immediately
- No flip, rise, or seal motion

## Palette

Use existing tokens only.

- Flap front (outside): `bg-paper` (`#F8EEE9`)
- Flap back (lining): `bg-petal` (`#EED4D8`), matching the envelope body
- Envelope body: unchanged `bg-petal`
- Seal: unchanged `bg-accent-primary`

Do not add a second ivory sheet on the inner face.

## Architecture

Extract one shared envelope used by the intro and the hero so size, position, and flap behavior cannot drift.

**File:** `src/components/InvitationEnvelope.tsx`

**Props:**

- `open: boolean` — closed vs folded-open pose
- `seal: "button" | "decorative"` — intro uses a focusable open control; hero uses a non-interactive seal that fades when open
- `onOpen?: () => void` — only for `seal="button"`
- `openButtonRef?: Ref<HTMLButtonElement>` — intro focus target
- `reduceMotion: boolean`

The envelope keeps the current viewport anchor and size: `top-[43%] md:top-[54%]`, `h-[46vw] min-h-56 max-h-[335px] w-[min(88vw,610px)]`, `perspective: 1200px`.

### Flap construction

- Wrapper: `transform-style: preserve-3d`, `origin-top`, height `58%`, `inset-x-0 top-0`
- Wrapper animates `rotateX` from `0` (closed) to `178` (open)
- Do **not** set `backface-visibility: hidden` on the wrapper
- Front child: absolute fill, downward triangle clip `polygon(0 0, 100% 0, 50% 100%)`, `bg-paper`, `backface-visibility: hidden`
- Back child: absolute fill, same clip, `bg-petal`, `transform: rotateX(180deg)`, `backface-visibility: hidden`

Both faces occupy the same box. After the wrapper rotates about the top edge, the visible lining triangle points up above the envelope.

### Stacking

- Closed: seal above flap above pocket above photograph
- Open: photograph above flap and pocket, so the risen print is not covered by the folded lining
- Pocket clip-path stays as it is today

### Consumers

- `InvitationIntro` passes `open={stage === "opening"}` and stays closed while `sealed`. The seal is the existing “Open M and M wedding invitation” button.
- `OpeningChapter` passes `open` as true with a decorative seal. When motion is allowed, the envelope still plays the closed-to-open animation on mount, then stays open. Reduced motion skips to the open pose. The chapter still owns the cover photograph, title, countdown, and vinyl; only the envelope markup moves into the shared component.

## Motion

Reuse the current timings unless they fight the new back face:

- Flap: `0.72s`, ease `[0.65, 0, 0.35, 1]`
- Photograph rise: `1.05s` starting at `0.72s`
- Seal fade: `0.35s`

Reduced motion: `rotateX` is `178` with duration `0`; photograph sits at its risen transform; seal opacity `0`.

## Out of Scope

- Countdown copy, layout, or timing
- Vinyl control or `WEDDING.song.audioUrl`
- Envelope size, page position, or photograph choice (photo 1 inside, photo 6 behind the cover)
- Other V4 sections
- Changing the first-visit storage key or replay event

## Testing

- Source tests assert the shared envelope has a front face, a `rotateX(180deg)` lining face, and no `backface-visibility: hidden` on the rotating wrapper
- Intro and hero both render `InvitationEnvelope` and keep the shared `top-[43%] md:top-[54%]` anchor
- Reduced-motion path still renders the lining in the open pose
- Existing intro focus, handoff, and opening-contract tests stay green

## Success

On desktop and mobile, a closed envelope shows ivory paper and a seal. An open envelope shows petal lining folded up above the pocket, with the invitation photograph risen and unobstructed. The intro and hero envelopes match. Reduced motion skips the flip and still shows the lining.
