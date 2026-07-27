"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import PhotoCarousel from "./our-story/PhotoCarousel";
import PinnedPhoto from "./our-story/PinnedPhoto";
import StoryLetter from "./our-story/StoryLetter";
import {
  MOBILE_CAROUSEL_BOTTOM,
  MOBILE_CAROUSEL_TOP,
  PHOTO_PLACEMENTS,
  STORY_LETTER,
  STORY_TITLE,
  TIMING,
  type LetterPhase,
  type Phase,
} from "./our-story/constants";
import { usePreloadStoryPhotos } from "./our-story/usePreloadStoryPhotos";

function letterPhaseFrom(phase: Phase): LetterPhase {
  switch (phase) {
    case "letter":
      return "empty";
    case "typing":
      return "typing";
    case "photos":
    case "done":
      return "complete";
    default:
      return "hidden";
  }
}

const IS_DEV = process.env.NODE_ENV === "development";

function estimateTypingMs() {
  return (
    STORY_TITLE.length * TIMING.typeTitleSpeed +
    200 +
    STORY_LETTER.length * TIMING.typeBodySpeed +
    300
  );
}

export default function OurStory() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.45 });
  const [phase, setPhase] = useState<Phase>("waiting");
  const [animationKey, setAnimationKey] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const startedRef = useRef(false);
  const typingDoneRef = useRef(false);
  const runIdRef = useRef(0);

  const schedule = useCallback((fn: () => void, ms: number) => {
    const runId = runIdRef.current;
    return window.setTimeout(() => {
      if (runIdRef.current === runId) fn();
    }, ms);
  }, []);

  const startAnimation = useCallback(() => {
    runIdRef.current += 1;
    typingDoneRef.current = false;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      setReduceMotion(true);
      setPhase("done");
      return;
    }

    setReduceMotion(false);
    setPhase("letter");
    schedule(
      () => setPhase("typing"),
      TIMING.letterAppear + TIMING.letterAppearHold
    );
  }, [schedule]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
  }, []);

  useEffect(() => {
    if (!isInView || startedRef.current) return;
    startedRef.current = true;
    startAnimation();
  }, [isInView, startAnimation]);

  const handleRestart = useCallback(() => {
    setAnimationKey((k) => k + 1);
    startAnimation();
  }, [startAnimation]);

  const handleTypingComplete = useCallback(() => {
    if (typingDoneRef.current) return;
    typingDoneRef.current = true;
    setPhase("photos");
    schedule(
      () => setPhase("done"),
      PHOTO_PLACEMENTS.length * TIMING.photoStagger + 500
    );
  }, [schedule]);

  useEffect(() => {
    if (phase !== "typing") return;
    const fallback = schedule(handleTypingComplete, estimateTypingMs());
    return () => window.clearTimeout(fallback);
  }, [phase, handleTypingComplete, schedule]);

  const currentLetterPhase = letterPhaseFrom(phase);
  const showLetter = phase !== "waiting";
  const showPhotos = phase === "photos" || phase === "done";

  usePreloadStoryPhotos(phase === "letter" || phase === "typing");

  return (
    <section
      ref={sectionRef}
      id="our-story"
      className="garden-section relative w-full flex flex-col items-center justify-center bg-cream garden-texture px-0 md:px-6 overflow-visible pt-[var(--nav-offset)] md:pt-0"
    >
      {IS_DEV && (
        <button
          type="button"
          onClick={handleRestart}
          className="absolute top-[calc(var(--nav-offset)+0.5rem)] left-1/2 -translate-x-1/2 z-50 rounded-md border border-sage/30 bg-background/90 px-3 py-1.5 text-xs font-medium text-foreground/70 shadow-sm backdrop-blur-sm hover:bg-background hover:text-foreground transition-colors"
        >
          ↺ Restart animation
        </button>
      )}

      {/* Mobile: top carousel */}
      <div className="w-full shrink-0 md:hidden">
        <PhotoCarousel
          key={`top-${animationKey}`}
          photos={MOBILE_CAROUSEL_TOP}
          direction="ltr"
          visible={showPhotos}
        />
      </div>

      <div className="relative mx-auto w-full flex-1 flex items-center justify-center min-h-0 md:h-[min(580px,84dvh)] max-w-[min(100%,520px)] md:max-w-[920px] overflow-visible">
        <div
          className="absolute inset-0 rounded-lg opacity-[0.35] pointer-events-none hidden md:block"
          style={{
            backgroundImage: `radial-gradient(circle, rgba(74,102,79,0.08) 1px, transparent 1px)`,
            backgroundSize: "12px 12px",
          }}
          aria-hidden
        />

        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative overflow-visible px-4 md:px-28">
            {PHOTO_PLACEMENTS.map((placement, index) => (
              <PinnedPhoto
                key={`${animationKey}-${placement.id}`}
                placement={placement}
                index={index}
                visible={showPhotos}
              />
            ))}
            {showLetter && (
              <StoryLetter
                key={animationKey}
                letterPhase={currentLetterPhase}
                onTypingComplete={handleTypingComplete}
              />
            )}
          </div>
        </div>
      </div>

      {/* Mobile: bottom carousel — bottom padding matches section top nav offset */}
      <div
        className={`w-full shrink-0 md:hidden`}
      >
        <PhotoCarousel
          key={`bottom-${animationKey}`}
          photos={MOBILE_CAROUSEL_BOTTOM}
          direction="rtl"
          visible={showPhotos}
        />
      </div>

      {reduceMotion && phase === "done" && (
        <motion.span className="sr-only" aria-live="polite">
          Our story letter and photos
        </motion.span>
      )}
    </section>
  );
}
