"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PHOTOS } from "@/content/wedding";
import {
  INVITATION_REPLAY_EVENT,
} from "@/lib/invitation";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { lockDocumentScroll } from "@/lib/scroll";

type IntroStage = "checking" | "sealed" | "opening" | "dismissed";

const focusableSelector = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function containIntroFocus(
  event: KeyboardEvent,
  dialog: HTMLElement,
  activeElement: Element | null = document.activeElement
) {
  if (event.key !== "Tab") return;

  const focusableElements = Array.from(
    dialog.querySelectorAll<HTMLElement>(focusableSelector)
  ).filter((element) => element.getClientRects().length > 0);

  if (focusableElements.length === 0) {
    event.preventDefault();
    dialog.focus({ preventScroll: true });
    return;
  }

  const first = focusableElements[0];
  const last = focusableElements[focusableElements.length - 1];
  const focusIsInside = activeElement !== null && dialog.contains(activeElement);

  if (event.shiftKey && (activeElement === first || !focusIsInside)) {
    event.preventDefault();
    last.focus({ preventScroll: true });
  } else if (!event.shiftKey && (activeElement === last || !focusIsInside)) {
    event.preventDefault();
    first.focus({ preventScroll: true });
  }
}

export default function InvitationIntro({ onOpenChange }: { onOpenChange?: (open: boolean) => void }) {
  const [stage, setStage] = useState<IntroStage>("checking");
  const dialogRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const reduceMotion = useHydrationSafeReducedMotion();
  const isVisible = stage !== "dismissed";

  useEffect(() => {
    const checkFrame = window.requestAnimationFrame(() => {
      setStage("sealed");
    });
    const replay = () => {
      onOpenChange?.(false);
      setStage("sealed");
    };

    window.addEventListener(INVITATION_REPLAY_EVENT, replay);
    return () => {
      window.cancelAnimationFrame(checkFrame);
      window.removeEventListener(INVITATION_REPLAY_EVENT, replay);
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }
    };
  }, [onOpenChange]);

  useEffect(() => {
    if (!isVisible) return;

    const page = document.getElementById("wedding-page");
    const previousAriaHidden = page?.getAttribute("aria-hidden") ?? null;
    if (page) {
      page.inert = true;
      page.setAttribute("aria-hidden", "true");
    }
    const unlock = lockDocumentScroll();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (dialogRef.current) containIntroFocus(event, dialogRef.current);
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      unlock();
      if (!page) return;
      page.inert = false;
      if (previousAriaHidden === null) page.removeAttribute("aria-hidden");
      else page.setAttribute("aria-hidden", previousAriaHidden);
    };
  }, [isVisible]);

  useEffect(() => {
    const focusFrame = window.requestAnimationFrame(() => {
      if (stage === "sealed") {
        openButtonRef.current?.focus({ preventScroll: true });
      } else if (stage === "opening") {
        dialogRef.current?.focus({ preventScroll: true });

      }
    });

    return () => window.cancelAnimationFrame(focusFrame);
  }, [stage]);

  const openInvitation = () => {
    if (stage !== "sealed") return;
    setStage("opening");
    dismissTimerRef.current = window.setTimeout(
      () => {
        setStage("dismissed");
        onOpenChange?.(true);
      },
      reduceMotion ? 160 : 2420
    );
  };

  if (!isVisible) return null;

  const opening = stage === "opening";
  const ready = stage !== "checking";

  return (
    <motion.div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invitation-intro-title"
      aria-describedby="invitation-intro-description"
      tabIndex={-1}
      className="fixed inset-0 z-[100] overflow-hidden bg-wine"
      animate={{ opacity: opening ? 0 : 1 }}
      transition={
        reduceMotion
          ? { duration: 0.16 }
          : { duration: 0.65, delay: opening ? 1.77 : 0 }
      }
    >
      <motion.div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,250,243,0.22),transparent_46%),linear-gradient(145deg,rgba(81,49,58,0.46),rgba(169,112,124,0.24))]"
        initial={false}
        animate={
          stage === "sealed" && !reduceMotion
            ? { opacity: [0.65, 1, 0.65], scale: [1, 1.06, 1] }
            : { opacity: 1, scale: 1 }
        }
        transition={
          stage === "sealed" && !reduceMotion
            ? { duration: 5, repeat: Infinity, ease: "easeInOut" }
            : { duration: reduceMotion ? 0 : 0.4 }
        }
        aria-hidden="true"
      />

      <motion.div
        className="absolute inset-x-0 top-[43%] md:top-[47%] z-10 flex flex-col items-center"
        initial={false}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
      >
        <motion.p
          className="sr-only"
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          A little invitation
        </motion.p>

        <div className="relative h-[41.4vw] min-h-[201.6px] max-h-[301.5px] w-[min(79.2vw,549px)] [perspective:1200px] md:h-[250px] md:w-[460px]">
          <motion.div
            className="absolute inset-0"
            initial={false}
            animate={
              stage === "sealed" && !reduceMotion
                ? { rotate: [0, -0.7, 0.7, -0.4, 0] }
                : { rotate: 0 }
            }
            transition={
              stage === "sealed" && !reduceMotion
                ? { duration: 0.6, delay: 4.2, repeat: Infinity, repeatDelay: 3.6, ease: "easeInOut" }
                : { duration: reduceMotion ? 0 : 0.15 }
            }
          >
            <div className="envelope-paper absolute inset-0 bg-petal shadow-[0_31px_64px_rgba(55,23,32,0.34)]" />

            <motion.div
              initial={false}
              aria-hidden={!opening}
              className="absolute inset-x-[8%] top-[9%] z-[2] h-[82%] bg-cream p-2 pb-8 text-foreground shadow-[0_14px_30px_rgba(60,30,38,0.24)] md:p-3 md:pb-10"
              animate={
                !opening
                  ? { y: "8%", rotate: -1, opacity: 0 }
                  : { y: "-62%", rotate: 1.5, opacity: 1 }
              }
              transition={{
                duration: reduceMotion ? 0 : 1.05,
                delay: reduceMotion ? 0 : opening ? 0.72 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <div className="relative h-full overflow-hidden">
                <Image
                  src={PHOTOS[1].src}
                  alt={PHOTOS[1].alt}
                  fill
                  loading="eager"
                  sizes="(max-width: 768px) 74vw, 500px"
                  className="object-cover"
                  style={{ objectPosition: PHOTOS[1].objectPosition }}
                />
              </div>
              <span className="absolute inset-x-0 bottom-2 text-center font-serif text-sm italic md:bottom-3 md:text-base">
                You&apos;re invited
              </span>
            </motion.div>

            <motion.div
              className="absolute inset-x-0 top-0 z-[4] h-[58%] origin-top [transform-style:preserve-3d]"
              animate={{ rotateX: opening ? 178 : 0, zIndex: opening ? 1 : 4 }}
              transition={{
                duration: reduceMotion ? 0 : 0.72,
                ease: [0.65, 0, 0.35, 1],
                zIndex: { delay: reduceMotion ? 0 : opening ? 0.36 : 0, duration: 0 },
              }}
              >
              <div className="envelope-paper envelope-lid absolute inset-0 bg-paper [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              <div className="envelope-paper envelope-lining absolute inset-0 bg-petal [backface-visibility:hidden] [transform:rotateX(180deg)] [clip-path:polygon(0_100%,100%_100%,50%_0)]" />
            </motion.div>

            <div
              className="envelope-paper envelope-pocket absolute inset-0 z-[3] bg-petal [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 z-[3] border border-cream/35 [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
              aria-hidden="true"
            />

            <motion.button
              ref={openButtonRef}
              type="button"
              onClick={openInvitation}
              disabled={opening || stage === "checking"}
              aria-label="Open M and M wedding invitation"
              className={`envelope-seal absolute left-1/2 top-[54%] z-[5] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-foreground/15 bg-accent-primary text-foreground shadow-[0_11px_25px_rgba(75,44,34,0.22)] outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-cream disabled:pointer-events-none md:h-[68px] md:w-[68px] ${reduceMotion ? "" : "transition-transform hover:scale-105"}`}
              animate={
                !opening
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.55, rotate: -12 }
              }
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
            >
              <span
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 36,
                  backgroundColor: "currentColor",
                  mask: "url('/seal-logo.svg') center / contain no-repeat",
                  filter: "drop-shadow(0 1px 0 rgba(255,239,188,0.8))",
                }}
              />
            </motion.button>
          </motion.div>
        </div>

        <motion.div
          className="mt-6 text-center"
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{
            duration: reduceMotion ? 0 : 0.2,
            delay: opening && !reduceMotion ? 1.77 : 0,
          }}
        >
          <h2
            id="invitation-intro-title"
            className="sr-only"
          >
            You&apos;re invited
          </h2>
          <motion.p
            id="invitation-intro-description"
            className="mt-2 text-xs uppercase tracking-[0.2em] text-cream/75"
            initial={false}
            animate={
              stage === "sealed" && !reduceMotion
                ? { x: [0, -2, 2, -2, 0] }
                : { x: 0 }
            }
            transition={
              stage === "sealed" && !reduceMotion
                ? { duration: 0.4, delay: 3, repeat: Infinity, repeatDelay: 2.6, ease: "easeInOut" }
                : { duration: 0 }
            }
            aria-live="polite"
          >
            {opening
              ? "Opening your invitation"
              : "TAP THE SEAL TO OPEN"}
          </motion.p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
