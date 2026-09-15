"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { WEDDING } from "@/content/wedding";

const viewport = { once: true, amount: 0.35 } as const;

function reveal(reduceMotion: boolean) {
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 24 },
        whileInView: { opacity: 1, y: 0 },
        viewport,
        transition: {
          duration: 0.72,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };
}

export default function FamilyChapter() {
  const reduceMotion = useHydrationSafeReducedMotion();
  const { brideName, groomName, message, hashtag } = WEDDING.invitation;

  return (
    <section
      id="families"
      aria-labelledby="families-title"
      className="garden-section garden-texture bg-cream px-5 py-14 md:px-10 md:py-20"
    >
      <motion.div
        {...reveal(reduceMotion)}
        className="relative mx-auto w-full max-w-6xl border border-wine/25 bg-paper px-6 py-12 text-center shadow-[0_20px_55px_rgba(104,65,75,0.08)] before:pointer-events-none before:absolute before:inset-x-4 before:top-2 before:h-px before:bg-accent-primary/35 after:pointer-events-none after:absolute after:inset-x-4 after:bottom-2 after:h-px after:bg-accent-primary/35 md:px-16 md:py-16"
      >
        <p className="relative text-[10px] uppercase tracking-[0.32em] text-wine">
          Our day will be brighter with you
        </p>
        <h2
          id="families-title"
          aria-label={`${brideName} and ${groomName}`}
          className="relative mt-7 flex flex-col items-center justify-center gap-4 font-serif text-5xl italic leading-none text-wine sm:flex-row sm:gap-6 sm:text-6xl md:text-7xl lg:text-8xl"
        >
          <span>{brideName}</span>
          <span aria-hidden="true" className="relative block h-9 w-14 shrink-0 sm:h-10 sm:w-16">
            <span className="absolute left-1 top-1 size-8 rounded-full border-2 border-accent-primary sm:size-9" />
            <span className="absolute right-1 top-1 size-8 rounded-full border-2 border-accent-primary sm:size-9" />
          </span>
          <span>{groomName}</span>
        </h2>
        <div
          aria-hidden="true"
          className="relative mx-auto mt-8 h-px w-20 bg-accent-primary/70"
        />
        <p className="relative mx-auto mt-8 max-w-xl font-serif text-lg leading-relaxed text-wine md:text-xl">
          {message}
        </p>
        <p className="relative mt-8 text-[11px] font-medium tracking-[0.18em] text-wine/75 md:text-xs">
          {hashtag}
        </p>
      </motion.div>
    </section>
  );
}
