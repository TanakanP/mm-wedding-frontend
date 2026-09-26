"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import Image from "next/image";
import { FRAMED_PHOTOS } from "@/content/wedding";

const viewport = { once: true, amount: 0.3 } as const;

function frameMotion(reduceMotion: boolean) {
  return reduceMotion
    ? {}
    : {
        initial: { opacity: 0, scale: 0.94 },
        whileInView: { opacity: 1, scale: 1 },
        viewport,
        transition: {
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1] as const,
        },
      };
}

export default function FramedPhotoChapter() {
  const reduceMotion = useHydrationSafeReducedMotion();
  const photo = FRAMED_PHOTOS.center;

  return (
    <section
      id="framed-photo"
      aria-label="A framed memory together"
      className="garden-section relative isolate grid min-h-[92svh] place-items-center overflow-hidden bg-[#62406f] px-5 py-20 md:min-h-[100svh] md:px-10 md:py-28"
    >
      <Image
        src={FRAMED_PHOTOS.background.src}
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover"
        style={{ objectPosition: FRAMED_PHOTOS.background.objectPosition }}
      />
      <div className="absolute inset-0 -z-10 bg-[#62406f]/50" aria-hidden="true" />
      <motion.figure
        {...frameMotion(reduceMotion)}
        className="relative z-10 aspect-[834/1200] w-[min(66vw,450px)] drop-shadow-[0_30px_70px_rgba(38,20,43,0.46)] sm:w-[min(58.5vw,450px)]"
      >
        <div className="absolute left-[15.5%] top-[12.2%] h-[74.3%] w-[70.9%] overflow-hidden bg-paper">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes="(max-width: 639px) 47vw, (max-width: 767px) 41vw, 320px"
            className="object-cover"
            style={{ objectPosition: photo.objectPosition }}
          />
        </div>
        <Image
          src="/photos/frames/ornate-ivory.png"
          alt=""
          fill
          sizes="(max-width: 639px) 66vw, (max-width: 767px) 58.5vw, 450px"
          className="pointer-events-none object-contain"
        />
      </motion.figure>
    </section>
  );
}
