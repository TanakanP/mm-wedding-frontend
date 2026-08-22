"use client";

import { motion, useReducedMotion, useTransform } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

import { PHOTOS } from "@/content/wedding";
import { useElementScrollProgress } from "@/hooks/useElementScrollProgress";
import { mapScrollProgress } from "@/lib/scrollAnimations";

export default function FinalImageChapter() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = Boolean(useReducedMotion());
  const scrollProgress = useElementScrollProgress(sectionRef);
  const imageScale = useTransform(scrollProgress, (progress) =>
    mapScrollProgress(progress, [0, 1], [1, 1.045])
  );
  const photo = PHOTOS[9];

  return (
    <section
      ref={sectionRef}
      id="final-image"
      aria-label="One final memory before RSVP"
      className="garden-section relative h-[130vw] min-h-[38rem] max-h-[59.375rem] w-full overflow-hidden bg-wine md:h-[88vw]"
    >
      <motion.div
        className="absolute inset-0"
        style={reduceMotion ? undefined : { scale: imageScale }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes="100vw"
          className="object-cover"
          style={{ objectPosition: photo.objectPosition }}
        />
      </motion.div>
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-wine/80"
      />
      <div className="absolute inset-x-5 bottom-[8%] z-10 text-cream md:inset-x-[7vw] md:bottom-[9%]">
        <h2 className="font-serif text-5xl italic leading-none drop-shadow-[0_2px_16px_rgba(46,32,36,.7)] md:text-7xl">
          One more memory
        </h2>
        <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.24em] text-cream drop-shadow-[0_2px_10px_rgba(46,32,36,.85)] md:text-xs">
          Before the next chapter begins
        </p>
      </div>
    </section>
  );
}
