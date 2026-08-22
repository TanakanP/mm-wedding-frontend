"use client";

import Image from "next/image";
import { motion, useReducedMotion, useTransform } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import Countdown from "@/components/hero/Countdown";
import PetalsCanvas from "@/components/hero/PetalsCanvas";
import { PHOTOS, WEDDING } from "@/content/wedding";
import { useElementScrollProgress } from "@/hooks/useElementScrollProgress";
import { mapScrollProgress } from "@/lib/scrollAnimations";

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const scrollYProgress = useElementScrollProgress(sectionRef);
  const imageY = useTransform(scrollYProgress, (progress) =>
    mapScrollProgress(progress, [0, 1], [0, -24])
  );
  const imageScale = useTransform(scrollYProgress, (progress) =>
    mapScrollProgress(progress, [0, 1], [1, 1.04])
  );
  const tagY = useTransform(scrollYProgress, (progress) =>
    mapScrollProgress(progress, [0, 1], [0, -24])
  );
  const tagScale = useTransform(scrollYProgress, (progress) =>
    mapScrollProgress(progress, [0, 1], [1, 1.04])
  );
  const tagOpacity = useTransform(scrollYProgress, (progress) =>
    mapScrollProgress(progress, [0, 0.2, 0.75, 1], [1, 1, 0.15, 0])
  );
  const [wind, setWind] = useState(0);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setWind((event.clientX / window.innerWidth - 0.5) * 30);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        id="hero"
        className="garden-section relative min-h-[88svh] overflow-hidden bg-cream"
      >
        <motion.div
          className="absolute inset-0"
          style={reduceMotion ? undefined : { y: imageY, scale: imageScale }}
        >
          <Image
            src={PHOTOS[6].src}
            alt={PHOTOS[6].alt}
            fill
            preload
            sizes="100vw"
            className="object-cover"
            style={{ objectPosition: PHOTOS[6].objectPosition }}
          />
        </motion.div>
        <div className="absolute inset-0 bg-foreground/15" aria-hidden />
        {!reduceMotion && <PetalsCanvas wind={wind} />}
        <motion.div
          className="absolute bottom-[8%] right-[5%] z-10 w-[min(78vw,340px)] rotate-2 bg-[#fffaf1] px-6 py-5 text-foreground shadow-xl md:bottom-[12%] md:right-[8%] md:w-[420px] md:px-9 md:py-7"
          style={
            reduceMotion
              ? undefined
              : { y: tagY, scale: tagScale, opacity: tagOpacity }
          }
        >
          <p className="text-[10px] tracking-[0.2em] uppercase text-accent-primary">
            Together with our families
          </p>
          <h1
            id="wedding-title"
            tabIndex={-1}
            className="mt-3 font-serif text-5xl leading-none outline-none md:text-7xl"
          >
            M &amp; M
          </h1>
          <p className="mt-4 text-sm tracking-[0.12em] uppercase">
            {WEDDING.dateLabel}
          </p>
          <p className="mt-1 text-sm text-foreground/70">{WEDDING.venue.name}</p>
        </motion.div>
      </section>
      <section
        id="countdown"
        aria-labelledby="countdown-title"
        className="garden-section bg-cream garden-texture px-5 py-16 text-center md:px-8 md:py-24"
      >
        <h2 id="countdown-title" className="font-serif text-4xl md:text-5xl">
          The celebration
        </h2>
        <Countdown targetDateIso={WEDDING.dateIso} />
      </section>
    </>
  );
}
