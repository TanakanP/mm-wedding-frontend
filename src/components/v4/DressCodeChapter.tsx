"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import { WEDDING } from "@/content/wedding";

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

function PaletteSample({ color }: { color: string }) {
  return (
    <span aria-hidden="true" className="relative block h-16 w-[4.5rem]">
      {[-14, 0, 14].map((rotation, cardIndex) => (
        <span
          key={rotation}
          className="absolute bottom-0 left-1/2 h-14 w-8 origin-bottom rounded-sm border border-wine/10 shadow-[0_3px_8px_rgba(81,49,58,0.14)]"
          style={{
            backgroundColor: color,
            backgroundImage:
              "linear-gradient(110deg, rgba(255,255,255,.14), transparent 48%)",
            filter: `brightness(${0.94 + cardIndex * 0.06})`,
            transform: `translateX(-50%) rotate(${rotation}deg)`,
          }}
        />
      ))}
      <span className="absolute bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-wine/45" />
    </span>
  );
}

export default function DressCodeChapter() {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <section
      id="dress-code"
      aria-labelledby="dress-code-title"
      className="garden-section garden-texture bg-petal px-5 py-20 md:px-[7vw] md:py-28"
    >
      <div className="mx-auto max-w-4xl">
        <motion.div
          {...chapterMotion(reduceMotion, -32)}
          className="border border-wine/20 bg-cream px-6 py-10 text-center shadow-[0_22px_60px_rgba(104,65,75,0.1)] md:px-10 md:py-14"
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
            className="mx-auto mt-8 flex max-w-[42rem] flex-wrap justify-center gap-x-4 gap-y-6"
            aria-label="Suggested dress-code colors"
          >
            {WEDDING.dressCode.colors.map((color, index) => (
              <motion.li
                key={color.label}
                {...swatchMotion(reduceMotion, index)}
                className="w-20 text-center"
              >
                <span className="flex h-16 items-center justify-center">
                  <PaletteSample color={color.value} />
                </span>
                <span className="mt-2 block text-[11px] leading-tight text-wine">
                  {color.label}
                </span>
              </motion.li>
            ))}
          </ul>
        </motion.div>

      </div>
    </section>
  );
}
