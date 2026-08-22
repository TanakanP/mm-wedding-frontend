"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useState, type ReactNode } from "react";

import RSVPForm from "@/components/RSVPForm";
import { PHOTOS } from "@/content/wedding";

interface RSVPChapterProps {
  children: ReactNode;
}

export default function RSVPChapter({ children }: RSVPChapterProps) {
  const [isRSVPOpen, setIsRSVPOpen] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-title"
      className="garden-section overflow-hidden bg-[linear-gradient(145deg,#f1dadd,#c8929b)] text-wine"
    >
      <div className="relative grid min-h-[53rem] place-items-center overflow-hidden px-5 py-28 md:px-[7vw] md:py-36">
        <Image
          src={PHOTOS[6].src}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[.14] saturate-[.7]"
          style={{ objectPosition: PHOTOS[6].objectPosition }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-petal/30 via-transparent to-dusty/20"
        />

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
          className="relative z-10 w-full max-w-[46.875rem]"
        >
          <div
            aria-hidden="true"
            className="absolute inset-0 translate-x-3 translate-y-4 rotate-[2.5deg] bg-paper shadow-[0_25px_68px_rgba(72,36,46,.17)]"
          />
          <article className="relative border border-dusty/35 bg-cream px-7 py-24 text-center shadow-[0_25px_68px_rgba(72,36,46,.19)] md:px-28 md:py-28">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-4 border border-dusty/30"
            />
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-0 z-20 grid size-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent-primary font-serif text-sm italic tracking-[0.06em] text-wine shadow-[0_11px_25px_rgba(75,44,34,.22)] md:size-[4.5rem] md:text-base"
            >
              M&amp;M
            </div>

            <div
              aria-hidden="true"
              className="absolute left-3 top-8 z-10 w-[4.5rem] -rotate-[7deg] bg-white p-1.5 shadow-[0_10px_22px_rgba(72,36,46,.19)] md:-left-12 md:top-11 md:w-28 md:p-2"
            >
              {[PHOTOS[1], PHOTOS[8]].map((photo) => (
                <div
                  key={photo.id}
                  className="relative mb-1 aspect-[4/3] last:mb-0"
                >
                  <Image
                    src={photo.src}
                    alt=""
                    fill
                    sizes="(max-width: 767px) 72px, 112px"
                    className="object-cover"
                    style={{ objectPosition: photo.objectPosition }}
                  />
                </div>
              ))}
            </div>

            <p className="relative text-[10px] font-medium uppercase tracking-[0.28em] text-wine">
              Kindly respond
            </p>
            <h2
              id="rsvp-title"
              className="relative mt-4 font-serif text-7xl italic leading-[0.8] text-wine sm:text-8xl md:text-[7.75rem]"
            >
              RSVP
            </h2>
            <p className="relative mx-auto mt-8 max-w-sm font-serif text-base leading-7 text-wine md:text-lg">
              We would be honored to celebrate this chapter with you.
            </p>
            <button
              type="button"
              onClick={() => setIsRSVPOpen(true)}
              className="relative mt-8 rounded-full bg-dusty px-7 py-3.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-cream transition-colors hover:bg-wine focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-wine"
            >
              Open response card
            </button>
          </article>
        </motion.div>
      </div>

      <RSVPForm
        isOpen={isRSVPOpen}
        onClose={() => setIsRSVPOpen(false)}
      />
      {children}
    </section>
  );
}
