"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import Image from "next/image";
import { PHOTOS } from "@/content/wedding";

const viewport = { once: true, amount: 0.3 } as const;

function frameMotion(reduceMotion: boolean) {
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.92, rotate: -1.5 },
        whileInView: { opacity: 1, scale: 1, rotate: 1.25 },
        viewport,
        transition: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };
}

export default function FramedPhotoChapter() {
  const reduceMotion = useHydrationSafeReducedMotion();
  const photo = PHOTOS[7];

  return (
    <section
      id="framed-photo"
      aria-label="A framed memory together"
      className="garden-section garden-texture grid min-h-[92svh] place-items-center overflow-hidden bg-violet px-5 py-20 md:min-h-[100svh] md:px-10 md:py-28"
    >
      <motion.figure
        {...frameMotion(reduceMotion)}
        className="relative w-[min(88vw,600px)] sm:w-[min(82vw,600px)]"
      >
        <div className="v4-scalloped-frame bg-cream p-3 shadow-[0_32px_72px_rgba(46,32,36,0.32)] sm:p-4 md:p-5">
          <div className="relative aspect-[4/5] overflow-hidden bg-paper">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 639px) calc(88vw - 24px), (max-width: 731px) calc(82vw - 32px), (max-width: 767px) 568px, 560px"
              className="object-cover"
              style={{ objectPosition: photo.objectPosition }}
            />
          </div>
        </div>
        <div
          aria-hidden="true"
          className="absolute -bottom-8 left-1/2 grid h-20 w-20 -translate-x-1/2 place-items-center rounded-full border border-cream/80 bg-accent-primary font-serif text-base italic tracking-[0.08em] text-wine shadow-[0_12px_28px_rgba(46,32,36,0.24)] md:-bottom-10 md:h-24 md:w-24 md:text-lg"
        >
          M&amp;M
        </div>
      </motion.figure>
    </section>
  );
}
