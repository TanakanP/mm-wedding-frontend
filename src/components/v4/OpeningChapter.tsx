"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import Image from "next/image";
import { useRef, useState } from "react";
import PetalsCanvas from "@/components/hero/PetalsCanvas";
import Countdown from "@/components/hero/Countdown";
import { OPENING_PHOTOS, WEDDING } from "@/content/wedding";

export default function OpeningChapter({ invitationOpened = false }: { invitationOpened?: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const reduceMotion = useHydrationSafeReducedMotion();
  const audioUrl = WEDDING.song.audioUrl;

  const toggleSong = async () => {
    const audio = audioRef.current;
    if (!audio || !audioUrl) {
      setHasPlayed(true);
      setIsPlaying((playing) => !playing);
      return;
    }

    if (audio.paused) {
      await audio.play();
      setHasPlayed(true);
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
          src={OPENING_PHOTOS.background.src}
          alt={OPENING_PHOTOS.background.alt}
          fill
          preload
          placeholder="blur"
          blurDataURL={OPENING_PHOTOS.background.blurDataURL}
          sizes="100vw"
          className="object-cover opacity-35 saturate-[.65] contrast-[.92]"
          style={{ objectPosition: OPENING_PHOTOS.background.objectPosition }}
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-foreground/10 via-foreground/30 to-foreground/85"
          aria-hidden="true"
        />

        {!reduceMotion && <PetalsCanvas />}

        <header className="absolute inset-x-5 top-[9%] z-20 text-center md:top-[6%]">
          <p className="text-[9px] uppercase tracking-[0.27em] text-cream/85">
            Together with our families
          </p>
          <h1
            id="wedding-title"
            className="mt-3 font-serif text-6xl italic leading-[0.86] md:text-8xl lg:text-[6.75rem]"
          >
            <span className="sr-only">M &amp; M</span>
            <span
              aria-hidden="true"
              style={{
                display: "block",
                height: "0.99em",
                backgroundColor: "currentColor",
                mask: "url('/seal-logo.svg') center / contain no-repeat",
              }}
            />
          </h1>
          <p className="mt-4 text-[9px] uppercase tracking-[0.22em] text-cream/85">
            {WEDDING.dateLabel} · US WEDDING VENUE
          </p>
        </header>

        <div className="absolute inset-x-0 bottom-[20%] z-10 mx-auto h-[41.4vw] min-h-[201.6px] max-h-[301.5px] w-[min(79.2vw,549px)] [perspective:1200px] md:h-[250px] md:w-[460px]">
          <div className="envelope-paper absolute inset-0 bg-petal shadow-[0_31px_64px_rgba(55,23,32,0.34)]" />
          <motion.div
            className="absolute inset-x-[8%] top-[9%] z-[2] h-[82%] bg-cream p-2 pb-8 shadow-[0_14px_30px_rgba(60,30,38,0.24)] md:p-3 md:pb-10"
            initial={reduceMotion ? false : { y: "8%", rotate: -1, opacity: 0 }}
            animate={{
              y: invitationOpened && !reduceMotion ? ["-62%", "-64%", "-62%"] : "-62%",
              rotate: 1.5,
              opacity: 1,
            }}
            transition={{
              duration: reduceMotion ? 0 : 1.05,
              delay: reduceMotion ? 0 : 0.72,
              ease: [0.22, 1, 0.36, 1],
              ...(invitationOpened && !reduceMotion
                ? { y: { duration: 4, delay: 0, repeat: Infinity, ease: "easeInOut" } }
                : {}),
            }}
          >
            <div className="relative h-full overflow-hidden">
              <Image
                src={OPENING_PHOTOS.envelope.src}
                alt={OPENING_PHOTOS.envelope.alt}
                fill
                loading="eager"
                placeholder="blur"
                blurDataURL={OPENING_PHOTOS.envelope.blurDataURL}
                sizes="(max-width: 768px) 74vw, 500px"
                className="scale-[1.35] object-cover"
                style={{ objectPosition: OPENING_PHOTOS.envelope.objectPosition }}
              />
            </div>
            <span className="absolute inset-x-0 bottom-2 text-center font-serif text-sm italic text-foreground md:bottom-3 md:text-base">
              You&apos;re invited
            </span>
          </motion.div>
          <motion.div
            className="absolute inset-x-0 top-0 z-[4] h-[58%] origin-top [transform-style:preserve-3d]"
            initial={reduceMotion ? false : { rotateX: 0, zIndex: 4 }}
            animate={{ rotateX: 178, zIndex: 1 }}
            transition={{
              duration: reduceMotion ? 0 : 0.72,
              ease: [0.65, 0, 0.35, 1],
                zIndex: { delay: reduceMotion ? 0 : 0.36, duration: 0 },
            }}
            aria-hidden="true"
          >
              <div className="envelope-paper envelope-lid absolute inset-0 bg-paper [backface-visibility:hidden] [clip-path:polygon(0_0,100%_0,50%_100%)]" />
              <div className="envelope-paper envelope-lining absolute inset-0 bg-petal [backface-visibility:hidden] [transform:rotateX(180deg)] [clip-path:polygon(0_100%,100%_100%,50%_0)]" />
            </motion.div>
          <div
            className="envelope-paper envelope-pocket absolute inset-0 z-[3] bg-petal [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
            aria-hidden="true"
          />
          <div
            className="absolute inset-0 z-[3] border border-cream/35 [clip-path:polygon(0_12%,50%_60%,100%_12%,100%_100%,0_100%)]"
            aria-hidden="true"
          />
          <motion.div
            className="envelope-seal absolute left-1/2 top-[54%] z-[5] grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-accent-primary font-serif text-sm text-foreground shadow-[0_11px_25px_rgba(75,44,34,0.22)] md:h-[68px] md:w-[68px]"
            initial={
              reduceMotion ? false : { opacity: 1, scale: 1, rotate: 0 }
            }
            animate={{ opacity: 0, scale: 0.55, rotate: -12 }}
            transition={{ duration: reduceMotion ? 0 : 0.35 }}
            aria-hidden="true"
          >
            <span
                aria-hidden="true"
                style={{
                  width: 40,
                  height: 36,
                  backgroundColor: "currentColor",
                  mask: "url('/seal-logo.svg') center / contain no-repeat",
                  filter: "drop-shadow(0 1px 0 rgba(255,239,188,0.8))",
                }}
              />
          </motion.div>
        </div>
      </div>

      <div className="grid min-h-[520px] items-center gap-14 bg-wine px-5 py-20 text-cream md:grid-cols-[1.15fr_.85fr] md:gap-[clamp(30px,7vw,90px)] md:px-[7vw] md:py-24">
        <div className="text-center">
          <p className="text-[9px] uppercase tracking-[0.27em] text-petal">
            EVERY MOMENT LEADS TO YOU
          </p>
          <h2 className="mt-3 font-serif text-5xl italic md:text-6xl">
            Until Forever
          </h2>
          <Countdown targetDateIso={WEDDING.dateIso} />
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={toggleSong}
            aria-pressed={isPlaying}
            aria-label={
              audioUrl
                ? `${isPlaying ? "Pause" : "Play"} ${WEDDING.song.title}`
                : `${isPlaying ? "Stop" : "Start"} spinning the disc`
            }
            className="group mx-auto flex cursor-pointer flex-col items-center gap-5 rounded-sm p-2 text-cream outline-none focus-visible:ring-2 focus-visible:ring-petal"
          >
            <span className="turntable-base block" aria-hidden="true">
            <span className="relative block">
            <span
              aria-hidden="true"
              className="vinyl-record relative block aspect-square w-[min(58vw,250px)] animate-spin rounded-full [animation-duration:6s]"
              style={{ animationPlayState: isPlaying && !reduceMotion ? "running" : "paused" }}
            >
              <span className="vinyl-label absolute inset-[33%] rounded-full">
                <span className="absolute inset-x-0 top-[12%] text-[5px] font-semibold tracking-[0.2em] text-wine/80">MIMEEN RECORDS</span>
                <span
                  className="absolute left-[28%] top-[26%] block h-[43%] w-[44%] bg-wine"
                  style={{ mask: "url('/seal-logo.svg') center / contain no-repeat" }}
                />
                <span className="absolute inset-x-0 bottom-[12%] text-[4px] font-semibold tracking-[0.15em] text-wine/80">SIDE A · 33⅓ RPM</span>
              </span>
              <span className="vinyl-spindle absolute left-1/2 top-1/2 size-[7px] -translate-x-1/2 -translate-y-1/2 rounded-full" />
            </span>
            <span className="vinyl-tonearm-base" />
            <span
              className="vinyl-tonearm"
              style={{
                transform: `rotate(${isPlaying ? 24 : -12}deg)`,
                transitionDuration: reduceMotion ? "0ms" : "250ms",
              }}
            >
              <span className={`vinyl-tonearm-body ${isPlaying && !reduceMotion ? "vinyl-tonearm-playing" : ""}`}>
                <span className="vinyl-tonearm-weight" />
                <span className="vinyl-tonearm-shaft" />
                <span className="vinyl-tonearm-head" />
              </span>
            </span>
            </span>
            </span>
            <span
              className={`relative text-[9px] uppercase tracking-[0.22em] ${reduceMotion || isPlaying ? "" : hasPlayed ? "song-label-twitch" : "song-label-float"}`}
            >
              {isPlaying ? "LOVE IS PLAYING" : hasPlayed ? "RESUME THE VIBE" : "LISTEN TO OUR SONG"}
              {isPlaying && (
                <span className="absolute left-full ml-1 inline-block w-[3em] text-left" aria-hidden="true">
                  <span className={reduceMotion ? "" : "song-playing-dots"}>. . .</span>
                </span>
              )}
            </span>
          </button>
          {audioUrl && (
            <audio
              ref={audioRef}
              src={audioUrl}
              preload="none"
              loop
              onEnded={() => setIsPlaying(false)}
            />
          )}
        </div>
      </div>
    </section>
  );
}
