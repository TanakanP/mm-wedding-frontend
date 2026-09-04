"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import Image from "next/image";
import { PHOTOS, WEDDING } from "@/content/wedding";

const viewport = { once: true, amount: 0.25 } as const;

function chapterMotion(reduceMotion: boolean, x: number) {
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, x },
        whileInView: { opacity: 1, x: 0 },
        viewport,
        transition: {
          duration: 0.75,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };
}

function swatchMotion(reduceMotion: boolean, index: number) {
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 12 },
        whileInView: { opacity: 1, y: 0 },
        viewport,
        transition: {
          duration: 0.45,
          delay: 0.18 + index * 0.07,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };
}

export default function DressCodeChapter() {
  const reduceMotion = useHydrationSafeReducedMotion();
  const photo = PHOTOS[2];

  return (
    <section
      id="dress-code"
      aria-labelledby="dress-code-title"
      className="garden-section garden-texture bg-petal px-5 py-20 md:px-[7vw] md:py-28"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-12 md:min-h-[72svh] md:grid-cols-[minmax(0,.92fr)_minmax(0,1.08fr)] md:gap-[clamp(48px,8vw,112px)]">
        <motion.div
          {...chapterMotion(reduceMotion, -32)}
          className="border border-wine/20 bg-cream px-6 py-10 text-center shadow-[0_22px_60px_rgba(104,65,75,0.1)] md:px-10 md:py-14 md:text-left"
        >
          <p className="text-[10px] uppercase tracking-[0.3em] text-wine">
            Dress code
          </p>
          <h2
            id="dress-code-title"
            className="mt-4 font-serif text-4xl italic leading-tight text-wine md:text-5xl"
          >
            {WEDDING.dressCode.title}
          </h2>
          <p className="mt-5 font-serif text-lg leading-relaxed text-wine">
            {WEDDING.dressCode.description}
          </p>

          <ul
            className="mt-8 flex flex-wrap justify-center gap-4 md:justify-start"
            aria-label="Suggested dress-code colors"
          >
            {WEDDING.dressCode.colors.map((color, index) => (
              <motion.li
                key={color.label}
                {...swatchMotion(reduceMotion, index)}
                className="w-16 text-center"
              >
                <span
                  aria-hidden="true"
                  className="mx-auto block h-14 w-10 rounded-t-full rounded-b-md border border-wine/10"
                  style={{ backgroundColor: color.value }}
                />
                <span className="mt-2 block text-xs leading-snug text-wine">
                  {color.label}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.figure
          {...chapterMotion(reduceMotion, 32)}
          className={`relative mx-auto w-full max-w-[560px] bg-cream p-3 pb-12 shadow-[0_28px_68px_rgba(104,65,75,0.2)] md:p-4 md:pb-14 ${reduceMotion ? "" : "md:rotate-[1.25deg]"}`}
        >
          <div className="relative aspect-[4/3] overflow-hidden bg-paper">
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="(max-width: 767px) calc(100vw - 40px), 520px"
              className="object-cover"
              style={{ objectPosition: photo.objectPosition }}
            />
          </div>
          <figcaption className="absolute inset-x-0 bottom-4 text-center font-serif text-sm italic text-wine md:bottom-5 md:text-base">
            Celebrate in color
          </figcaption>
        </motion.figure>
      </div>
    </section>
  );
}
