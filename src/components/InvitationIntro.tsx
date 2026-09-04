"use client";

import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import InvitationEnvelope from "@/components/InvitationEnvelope";
import {
  INVITATION_REPLAY_EVENT,
  INVITATION_STORAGE_KEY,
  shouldShowInvitation,
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

export default function InvitationIntro() {
  const [stage, setStage] = useState<IntroStage>("checking");
  const dialogRef = useRef<HTMLDivElement>(null);
  const openButtonRef = useRef<HTMLButtonElement>(null);
  const dismissTimerRef = useRef<number | null>(null);
  const openedRef = useRef(false);
  const reduceMotion = useHydrationSafeReducedMotion();
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
      } else if (stage === "dismissed" && openedRef.current) {
        document
          .getElementById("wedding-title")
          ?.focus({ preventScroll: true });
      }
    });

    return () => window.cancelAnimationFrame(focusFrame);
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
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="invitation-intro-title"
      aria-describedby="invitation-intro-description"
      tabIndex={-1}
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

        <InvitationEnvelope
          open={opening}
          seal="button"
          reduceMotion={reduceMotion}
          onOpen={openInvitation}
          openButtonRef={openButtonRef}
          sealDisabled={stage === "checking"}
        />

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
