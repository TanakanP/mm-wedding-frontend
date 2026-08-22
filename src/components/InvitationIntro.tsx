"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { PHOTOS } from "@/content/wedding";
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
      className="fixed inset-0 z-[100] overflow-hidden bg-wine/70 backdrop-blur-xl"
      animate={{ opacity: opening ? 0 : 1 }}
      transition={
        reduceMotion
          ? { duration: 0.16 }
          : { duration: 0.65, delay: opening ? 2.55 : 0 }
      }
    >
      <div
        className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,250,243,0.22),transparent_46%),linear-gradient(145deg,rgba(81,49,58,0.46),rgba(169,112,124,0.24))]"
        aria-hidden="true"
      />

      <motion.div
        className="absolute inset-x-0 top-[43%] z-10 flex flex-col items-center md:top-[54%]"
        initial={false}
        animate={{ opacity: ready ? 1 : 0, y: ready ? 0 : 12 }}
      >
        <motion.p
          className="absolute inset-x-0 bottom-full mb-4 text-center text-[10px] uppercase tracking-[0.32em] text-cream/80 md:mb-24"
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          A little invitation
        </motion.p>

        <div className="relative h-[46vw] min-h-56 max-h-[335px] w-[min(88vw,610px)] [perspective:1200px]">
          <div className="absolute inset-0 [transform-style:preserve-3d]">
            <div className="absolute inset-0 bg-petal shadow-[0_31px_64px_rgba(55,23,32,0.34)]" />

            <motion.div
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
              className="absolute inset-x-0 top-0 z-[4] h-[58%] origin-top bg-paper [clip-path:polygon(0_0,100%_0,50%_100%)]"
              animate={{ rotateX: opening ? 178 : 0 }}
              transition={{
                duration: reduceMotion ? 0 : 0.72,
                ease: [0.65, 0, 0.35, 1],
              }}
              style={{ backfaceVisibility: "hidden" }}
            />

            <div
              className="absolute inset-0 z-[3] bg-petal [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
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
              className={`absolute left-1/2 top-[54%] z-[5] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-foreground/15 bg-accent-primary text-foreground shadow-[0_11px_25px_rgba(75,44,34,0.22)] outline-none focus-visible:ring-4 focus-visible:ring-cream/80 disabled:pointer-events-none md:h-[68px] md:w-[68px] ${reduceMotion ? "" : "transition-transform hover:scale-105"}`}
              animate={
                !opening
                  ? { opacity: 1, scale: 1 }
                  : { opacity: 0, scale: 0.55, rotate: -12 }
              }
              transition={{ duration: reduceMotion ? 0 : 0.35 }}
            >
              <span className="font-serif text-sm tracking-[0.08em]">
                M&amp;M
              </span>
            </motion.button>
          </div>
        </div>

        <motion.div
          className="mt-6 text-center md:absolute md:inset-x-0 md:bottom-full md:mb-5 md:mt-0"
          animate={{ opacity: opening ? 0 : 1 }}
          transition={{ duration: reduceMotion ? 0 : 0.2 }}
        >
          <h2
            id="invitation-intro-title"
            className="font-serif text-3xl text-cream md:text-4xl"
          >
            You&apos;re invited
          </h2>
          <p
            id="invitation-intro-description"
            className="mt-2 text-xs uppercase tracking-[0.2em] text-cream/75"
            aria-live="polite"
          >
            {opening
              ? "Opening your invitation"
              : "Tap the M & M seal to open"}
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
