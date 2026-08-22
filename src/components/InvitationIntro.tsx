"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { WEDDING } from "@/content/wedding";
import {
  INVITATION_REPLAY_EVENT,
  INVITATION_STORAGE_KEY,
  shouldShowInvitation,
} from "@/lib/invitation";
import { lockDocumentScroll } from "@/lib/scroll";

type IntroStage = "checking" | "sealed" | "opening" | "dismissed";

export default function InvitationIntro() {
  const [stage, setStage] = useState<IntroStage>("checking");
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const openedRef = useRef(false);
  const reduceMotion = Boolean(useReducedMotion());
  const isVisible = stage !== "dismissed";

  useEffect(() => {
    const checkFrame = window.requestAnimationFrame(() => {
      try {
        setStage(
          shouldShowInvitation(localStorage.getItem(INVITATION_STORAGE_KEY))
            ? "sealed"
            : "dismissed"
        );
      } catch {
        setStage("sealed");
      }
    });
    const replay = () => setStage("sealed");

    window.addEventListener(INVITATION_REPLAY_EVENT, replay);
    return () => {
      window.cancelAnimationFrame(checkFrame);
      window.removeEventListener(INVITATION_REPLAY_EVENT, replay);
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    const page = document.getElementById("wedding-page");
    const previousAriaHidden = page?.getAttribute("aria-hidden") ?? null;
    if (page) {
      page.inert = true;
      page.setAttribute("aria-hidden", "true");
    }
    const unlock = lockDocumentScroll();

    return () => {
      unlock();
      if (!page) return;
      page.inert = false;
      if (previousAriaHidden === null) page.removeAttribute("aria-hidden");
      else page.setAttribute("aria-hidden", previousAriaHidden);
    };
  }, [isVisible]);

  useEffect(() => {
    if (stage === "sealed") {
      window.requestAnimationFrame(() => openButtonRef.current?.focus());
    }
    if (stage === "dismissed" && openedRef.current) {
      window.requestAnimationFrame(() =>
        document.getElementById("wedding-title")?.focus()
      );
    }
  }, [stage]);

  const openInvitation = () => {
    if (stage !== "sealed") return;
    openedRef.current = true;
    try {
      localStorage.setItem(INVITATION_STORAGE_KEY, "opened");
    } catch {
      // Storage can be unavailable in private browsing; the invitation still opens.
    }
    setStage("opening");
    dismissTimerRef.current = window.setTimeout(
      () => setStage("dismissed"),
      reduceMotion ? 160 : 3200
    );
  };

  if (!isVisible) return null;

  const opening = stage === "opening";
  const ready = stage !== "checking";

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby="invitation-intro-title"
      aria-describedby="invitation-intro-description"
      className="fixed inset-0 z-[100] grid place-items-center overflow-hidden bg-foreground/35 px-5 backdrop-blur-xl"
      animate={{ opacity: opening ? 0 : 1 }}
      transition={
        reduceMotion
          ? { duration: 0.16 }
          : { duration: 0.65, delay: opening ? 2.55 : 0 }
      }
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(247,243,235,0.32),transparent_46%),linear-gradient(145deg,rgba(12,42,31,0.28),rgba(196,138,127,0.16))]"
        aria-hidden="true"
      />

      <motion.div
        className="relative z-10 flex w-full max-w-xl flex-col items-center"
        initial={false}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
      >
        <p className="mb-4 text-[10px] uppercase tracking-[0.32em] text-cream/80">
          A little invitation
        </p>

        <div className="relative w-[min(86vw,520px)] [perspective:1200px]">
          <motion.div
            className="relative aspect-[16/10] w-full [transform-style:preserve-3d]"
            animate={
              reduceMotion || !opening
                ? { y: 0, scale: 1 }
                : { y: 70, scale: 0.94 }
            }
            transition={{ duration: 0.8, delay: opening ? 1.85 : 0 }}
          >
            <div className="absolute inset-0 rounded-sm bg-[#eadfcd] shadow-[0_28px_65px_rgba(12,42,31,0.28)]" />

            <motion.div
              aria-hidden={!opening}
              className="absolute inset-x-[8%] top-[9%] z-[2] flex h-[82%] flex-col items-center justify-center border border-accent-primary/40 bg-[#fffaf1] px-8 text-center text-foreground shadow-lg"
              animate={
                reduceMotion || !opening
                  ? { y: "8%", rotate: -1, opacity: 0 }
                  : { y: "-72%", rotate: 1.5, opacity: 1 }
              }
              transition={{
                duration: 1.05,
                delay: opening ? 0.72 : 0,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              <p className="text-[9px] uppercase tracking-[0.24em] text-accent-primary">
                Together with our families
              </p>
              <p className="mt-3 font-serif text-5xl leading-none md:text-6xl">
                M &amp; M
              </p>
              <div className="my-4 h-px w-16 bg-accent-primary/60" aria-hidden="true" />
              <p className="text-xs uppercase tracking-[0.16em]">
                {WEDDING.dateLabel}
              </p>
              <p className="mt-1 text-xs text-foreground/65">
                {WEDDING.venue.name}
              </p>
            </motion.div>

            <motion.div
              className="absolute inset-x-0 top-0 z-[4] h-[56%] origin-top bg-[#f3eadc] [clip-path:polygon(0_0,100%_0,50%_100%)]"
              animate={{ rotateX: opening && !reduceMotion ? 178 : 0 }}
              transition={{ duration: 0.72, ease: [0.65, 0, 0.35, 1] }}
              style={{ backfaceVisibility: "hidden" }}
            />

            <div
              className="absolute inset-0 z-[3] rounded-sm bg-[#efe4d3] [clip-path:polygon(0_18%,50%_60%,100%_18%,100%_100%,0_100%)]"
              aria-hidden="true"
            />
            <div
              className="absolute inset-0 z-[3] rounded-sm border border-white/50 [clip-path:polygon(0_18%,50%_60%,100%_18%,100%_100%,0_100%)]"
              aria-hidden="true"
            />

            <motion.button
              ref={openButtonRef}
              type="button"
              onClick={openInvitation}
              disabled={opening || stage === "checking"}
              aria-label="Open M and M wedding invitation"
              className={`absolute left-1/2 top-[56%] z-[5] grid h-20 w-20 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-foreground/15 bg-accent-primary text-foreground shadow-[0_10px_24px_rgba(12,42,31,0.24)] outline-none focus-visible:ring-4 focus-visible:ring-cream/80 disabled:pointer-events-none md:h-24 md:w-24 ${reduceMotion ? "" : "transition-transform hover:scale-105"}`}
              animate={
                reduceMotion || !opening
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.55, rotate: -12 }
              }
              transition={{ duration: 0.35 }}
            >
              <span className="font-serif text-lg tracking-[0.08em] md:text-xl">
                M&amp;M
              </span>
            </motion.button>
          </motion.div>
        </div>

        <h2
          id="invitation-intro-title"
          className="mt-6 font-serif text-3xl text-cream md:text-4xl"
        >
          You&apos;re invited
        </h2>
        <p
          id="invitation-intro-description"
          className="mt-2 text-xs uppercase tracking-[0.2em] text-cream/75"
          aria-live="polite"
        >
          {opening ? "Opening your invitation" : "Tap the M & M seal to open"}
        </p>
      </motion.div>
    </motion.div>
  );
}
