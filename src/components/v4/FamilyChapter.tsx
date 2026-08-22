"use client";

import { motion, useReducedMotion } from "framer-motion";
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
  const reduceMotion = Boolean(useReducedMotion());
  const [firstInitial, secondInitial] = WEDDING.couple.split(" & ");

  return (
    <section
      id="families"
      aria-labelledby="families-title"
      className="garden-section garden-texture flex min-h-[68svh] items-center bg-cream px-5 py-20 md:min-h-[76svh] md:px-10 md:py-28"
    >
      <motion.div
        {...reveal(reduceMotion)}
        className="relative mx-auto w-full max-w-3xl border border-wine/25 bg-paper px-6 py-16 text-center shadow-[0_24px_70px_rgba(104,65,75,0.09)] before:pointer-events-none before:absolute before:inset-2 before:border before:border-wine/15 md:px-16 md:py-24"
      >
        <p className="relative text-[10px] uppercase tracking-[0.32em] text-wine">
          Together with our families
        </p>
        <h2
          id="families-title"
          aria-label={WEDDING.couple}
          className="relative mt-7 font-serif text-6xl italic leading-none text-wine sm:text-7xl md:text-8xl"
        >
          {firstInitial}{" "}
          <span aria-hidden="true" className="text-accent-primary">
            &amp;
          </span>{" "}
          {secondInitial}
        </h2>
        <div
          aria-hidden="true"
          className="relative mx-auto mt-8 h-px w-20 bg-accent-primary/70"
        />
        <p className="relative mx-auto mt-8 max-w-xl font-serif text-lg leading-relaxed text-wine md:text-xl">
          Invite you to share in the joy of their wedding celebration.
        </p>
      </motion.div>
    </section>
  );
}
