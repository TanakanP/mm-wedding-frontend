"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import Image from "next/image";
import { useRef, useState } from "react";
import Countdown from "@/components/hero/Countdown";
import { PHOTOS, WEDDING } from "@/content/wedding";

export default function OpeningChapter() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const reduceMotion = useHydrationSafeReducedMotion();
  const audioUrl = WEDDING.song.audioUrl;

  const toggleSong = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section id="hero" className="garden-section overflow-hidden bg-wine">
      <div className="relative min-h-[100svh] overflow-hidden bg-foreground text-cream">
        <Image
          src={PHOTOS[6].src}
          alt={PHOTOS[6].alt}
          fill
          preload
          sizes="100vw"
          className="object-cover opacity-35 saturate-[.65] contrast-[.92]"
          style={{ objectPosition: PHOTOS[6].objectPosition }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-foreground/30 to-foreground/85"
          aria-hidden="true"
        />

        <header className="absolute inset-x-5 top-[9%] z-20 text-center md:top-[6%]">
          <p className="text-[9px] uppercase tracking-[0.27em] text-cream/85">
            Together with our families
          </p>
          <h1
            id="wedding-title"
            tabIndex={-1}
            className="mt-3 font-serif text-6xl italic leading-[0.86] outline-none focus-visible:ring-2 focus-visible:ring-petal md:text-8xl lg:text-[6.75rem]"
          >
            M &amp; M
          </h1>
          <p className="mt-4 text-[9px] uppercase tracking-[0.22em] text-cream/85">
            {WEDDING.dateLabel} · {WEDDING.venue.name}
          </p>
        </header>

        <div className="absolute inset-x-0 top-[43%] z-10 mx-auto h-[46vw] min-h-56 max-h-[335px] w-[min(88vw,610px)] [perspective:1200px] md:top-[54%]">
          <div className="absolute inset-0 bg-petal shadow-[0_31px_64px_rgba(55,23,32,0.34)]" />
          <motion.div
            className="absolute inset-x-[8%] top-[9%] z-[2] h-[82%] rotate-[1.5deg] bg-cream p-2 pb-8 shadow-[0_14px_30px_rgba(60,30,38,0.24)] md:p-3 md:pb-10"
            initial={reduceMotion ? false : { y: "8%", rotate: -1, opacity: 0 }}
            animate={{ y: "-62%", rotate: 1.5, opacity: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 1.05,
              delay: reduceMotion ? 0 : 0.72,
              ease: [0.22, 1, 0.36, 1],
            }}
          >
            <div className="relative h-full overflow-hidden">
              <Image
                src={PHOTOS[1].src}
                alt={PHOTOS[1].alt}
                fill
                loading="eager"
                sizes="(max-width: 768px) 74vw, 500px"
                className="object-cover"
                style={{ objectPosition: PHOTOS[1].objectPosition }}
              />
            </div>
            <span className="absolute inset-x-0 bottom-2 text-center font-serif text-sm italic text-foreground md:bottom-3 md:text-base">
              You&apos;re invited
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-x-0 top-0 z-[4] h-[58%] origin-top bg-paper [clip-path:polygon(0_0,100%_0,50%_100%)]"
            initial={reduceMotion ? false : { rotateX: 0 }}
            animate={{ rotateX: 178 }}
            transition={{
              duration: reduceMotion ? 0 : 0.72,
              ease: [0.65, 0, 0.35, 1],
            }}
            style={{ backfaceVisibility: "hidden" }}
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 z-[3] bg-petal [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 z-[3] border border-cream/35 [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
            aria-hidden="true"
          />
          <motion.div
            className="absolute left-1/2 top-[54%] z-[5] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent-primary font-serif text-sm text-foreground shadow-[0_11px_25px_rgba(75,44,34,0.22)] md:h-[68px] md:w-[68px]"
            initial={
              reduceMotion ? false : { opacity: 1, scale: 1, rotate: 0 }
            }
            animate={{ opacity: 0, scale: 0.55, rotate: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
            aria-hidden="true"
          >
            M&amp;M
          </motion.div>
        </div>
      </div>

      <div className="grid min-h-[520px] items-center gap-14 bg-wine px-5 py-20 text-cream md:grid-cols-[1.15fr_.85fr] md:gap-[clamp(30px,7vw,90px)] md:px-[7vw] md:py-24">
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.27em] text-petal">
            The celebration begins in
          </p>
          <h2 className="mt-3 font-serif text-5xl italic md:text-6xl">
            Countdown
          </h2>
          <Countdown targetDateIso={WEDDING.dateIso} />
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleSong}
            disabled={!audioUrl}
            aria-pressed={audioUrl ? isPlaying : undefined}
            aria-label={
              audioUrl
                ? `${isPlaying ? "Pause" : "Play"} ${WEDDING.song.title}`
                : "Our song coming soon"
            }
            className="group mx-auto flex flex-col items-center gap-5 rounded-sm p-2 text-cream outline-none focus-visible:ring-2 focus-visible:ring-petal disabled:cursor-not-allowed disabled:opacity-75"
          >
            <span
              aria-hidden="true"
              className={`relative block aspect-square w-[min(58vw,250px)] rounded-full bg-[repeating-radial-gradient(circle,#2e2024_0_4px,#3c292f_5px_7px)] shadow-[0_18px_38px_rgba(30,14,19,0.3)] before:absolute before:inset-[34%] before:grid before:place-items-center before:rounded-full before:bg-dusty before:font-serif before:text-xl before:italic before:text-cream before:content-['M&M'] after:absolute after:left-1/2 after:top-1/2 after:h-2 after:w-2 after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-cream ${isPlaying && !reduceMotion ? "animate-spin [animation-duration:6s]" : ""}`}
            />
            <span className="text-[9px] uppercase tracking-[0.22em]">
              {audioUrl
                ? isPlaying
                  ? "Pause our song"
                  : "Listen to our song"
                : "Our song coming soon"}
            </span>
          </button>
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="none"
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
