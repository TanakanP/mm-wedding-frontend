"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { useEffect, useState } from "react";

import RSVPForm from "@/components/RSVPForm";
import PetalsCanvas from "@/components/hero/PetalsCanvas";

export default function RSVPChapter() {
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const [isPageVisible, setIsPageVisible] = useState(true);
  const reduceMotion = useHydrationSafeReducedMotion();
  const animationPlayState = isInView && isPageVisible && !isRSVPOpen && !reduceMotion ? "running" : "paused";

  useEffect(() => {
    const onVisibilityChange = () => setIsPageVisible(!document.hidden);
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => document.removeEventListener("visibilitychange", onVisibilityChange);
  }, []);

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-title"
      className="garden-section rsvp-section bg-paper text-wine"
    >
      <motion.div
        className="garden-texture relative grid min-h-[53rem] place-items-center overflow-hidden px-5 py-28 md:px-[7vw] md:py-36"
        onViewportEnter={() => { setIsInView(true); setIsPageVisible(!document.hidden); }}
        onViewportLeave={() => setIsInView(false)}
        viewport={{ amount: 0.1 }}
      >
        <motion.div
          aria-hidden="true"
          className="rsvp-paper-light pointer-events-none absolute inset-0"
          initial={reduceMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: reduceMotion ? 0 : 3, ease: "easeOut" }}
        />
        <PetalsCanvas variant="confetti" splitDepth paused={isRSVPOpen} />
        <motion.div
          initial={
            reduceMotion
              ? false
              : { opacity: 0, scale: 0.88, rotate: -5 }
          }
          whileInView={{ opacity: 1, scale: 1, rotate: -1 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: reduceMotion ? 0 : 0.72,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="relative z-10 w-[92%] max-w-[38rem] sm:w-full"
        >
          <div
            aria-hidden="true"
            className="rsvp-card-glow"
            style={{ animationPlayState }}
          />
          <div
            className="rsvp-card-float"
            style={{ animationPlayState }}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 translate-x-3 translate-y-4 rotate-[2.5deg] bg-paper shadow-[0_15px_38px_rgba(72,36,46,.08)]"
            />
            <article className="relative border border-dusty/35 bg-cream px-6 py-14 text-center shadow-[0_14px_36px_rgba(72,36,46,.1)] md:px-12 md:py-16">
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-4 border border-dusty/30"
              />
              <div
                aria-hidden="true"
                className="envelope-seal absolute left-1/2 top-0 z-20 grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center md:size-16"
              >
                <span
                  className="block size-8 bg-[#70552d] md:size-9"
                  style={{
                    mask: "url('/seal-logo.svg') center / contain no-repeat",
                  }}
                />
              </div>

              <p className="relative text-[10px] font-medium uppercase tracking-[0.28em] text-wine">
                Kindly respond
              </p>
              <h2
                id="rsvp-title"
                className="relative mx-auto mt-4 max-w-2xl font-serif text-5xl italic leading-[0.95] text-wine sm:text-6xl md:text-7xl"
              >
                RSVP
              </h2>
              <p className="relative mx-auto mt-6 max-w-lg font-serif text-lg leading-relaxed text-wine md:mt-7 md:text-xl">
                We would be honored to celebrate this chapter with you.
              </p>
              <button
                type="button"
                onClick={() => setIsRSVPOpen(true)}
                className="relative mt-9 rounded-full bg-wine px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-foreground focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
              >
                Share your response
              </button>
            </article>
          </div>
        </motion.div>
      </motion.div>

      <div
        aria-hidden="true"
        className="rsvp-section-transition pointer-events-none absolute inset-x-0"
      />

      <RSVPForm
        isOpen={isRSVPOpen}
        onClose={() => setIsRSVPOpen(false)}
      />
    </section>
  );
}
