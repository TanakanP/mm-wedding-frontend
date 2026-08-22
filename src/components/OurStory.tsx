"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { PHOTOS, WEDDING } from "@/content/wedding";

const viewport = { once: true, amount: 0.2 } as const;

function reveal(reduceMotion: boolean, delay = 0) {
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, y: 16 },
        whileInView: { opacity: 1, y: 0 },
        transition: {
          duration: 0.6,
          delay,
          ease: [0.23, 1, 0.32, 1] as const,
        },
        viewport,
      };
}

export default function OurStory() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="our-story"
      aria-labelledby="our-story-title"
      className="garden-section bg-cream garden-texture px-5 py-20 md:px-8 md:py-28"
    >
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] md:items-center md:gap-16">
        <motion.div
          className="md:col-start-2 md:row-start-1"
          {...reveal(reduceMotion)}
        >
          <p className="text-xs font-medium tracking-[0.22em] text-accent-secondary uppercase">
            A little of us
          </p>
          <div className="mt-4 h-px w-16 bg-accent-primary/70" />
          <h2
            id="our-story-title"
            className="mt-5 font-serif text-4xl leading-none text-foreground md:text-5xl"
          >
            Our story
          </h2>
          <p className="mt-6 max-w-prose font-serif text-lg leading-relaxed text-foreground/75 md:text-xl md:leading-loose">
            {WEDDING.story}
          </p>
        </motion.div>

        <motion.figure
          className="relative aspect-[4/5] overflow-hidden border-[10px] border-[#fffaf1] bg-[#fffaf1] shadow-[0_18px_45px_rgba(70,51,31,0.18)] md:col-start-1 md:row-span-2 md:row-start-1"
          {...reveal(reduceMotion, 0.1)}
        >
          <Image
            src={PHOTOS[7].src}
            alt={PHOTOS[7].alt}
            fill
            sizes="(max-width: 767px) 100vw, 58vw"
            className="object-cover"
            style={{ objectPosition: PHOTOS[7].objectPosition }}
          />
          <span
            className="absolute -top-2 left-1/2 h-5 w-24 -translate-x-1/2 rotate-[-2deg] bg-accent-secondary/65"
            aria-hidden
          />
          <figcaption className="absolute bottom-4 left-4 bg-[#fffaf1]/90 px-3 py-2 text-[10px] tracking-[0.18em] text-foreground/70 uppercase">
            The beginning
          </figcaption>
        </motion.figure>

        <motion.div
          className="grid grid-cols-2 gap-4 md:col-start-2 md:row-start-2"
          {...reveal(reduceMotion, 0.15)}
        >
          {[PHOTOS[1], PHOTOS[2]].map((photo, index) => (
            <figure
              key={photo.id}
              className={`relative aspect-[4/5] overflow-hidden border-[7px] border-[#fffaf1] bg-[#fffaf1] shadow-[0_10px_26px_rgba(70,51,31,0.14)] ${
                reduceMotion
                  ? ""
                  : index === 0
                    ? "rotate-[-2deg]"
                    : "translate-y-4 rotate-[2deg]"
              }`}
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 767px) 50vw, 18vw"
                className="object-cover"
                style={{ objectPosition: photo.objectPosition }}
              />
              <span
                className="absolute -top-2 left-1/2 h-4 w-14 -translate-x-1/2 bg-accent-secondary/60"
                aria-hidden
              />
            </figure>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
