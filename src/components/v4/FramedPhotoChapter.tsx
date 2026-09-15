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
  const photo = PHOTOS[7];

  return (
    <section
      id="framed-photo"
      aria-label="A framed memory together"
      className="garden-section relative isolate grid min-h-[92svh] place-items-center overflow-hidden bg-[#62406f] px-5 py-20 md:min-h-[100svh] md:px-10 md:py-28"
    >
      <Image
        src={PHOTOS[6].src}
        alt=""
        fill
        sizes="100vw"
        className="-z-20 object-cover"
        style={{ objectPosition: PHOTOS[6].objectPosition }}
      />
      <div className="absolute inset-0 -z-10 bg-[#62406f]/50" aria-hidden="true" />
      <motion.figure
        {...frameMotion(reduceMotion)}
        className="relative z-10 w-[min(88vw,600px)] sm:w-[min(78vw,600px)]"
      >
        <div className="border border-[#e4d29d]/80 bg-[#a98d55] p-[5px] shadow-[0_30px_70px_rgba(38,20,43,0.46),inset_0_0_0_1px_rgba(88,57,29,0.35)]">
          <div className="border border-[#76512f]/45 bg-[#f4ecdf] p-3 shadow-[inset_0_0_14px_rgba(91,59,35,0.12)] sm:p-4">
            <div className="relative aspect-[4/5] overflow-hidden border-2 border-[#62414b]/55 bg-paper shadow-[0_0_0_1px_rgba(255,250,243,0.7)]">
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 639px) calc(88vw - 34px), (max-width: 767px) calc(78vw - 42px), 554px"
                className="object-cover"
                style={{ objectPosition: photo.objectPosition }}
              />
            </div>
          </div>
        </div>
      </motion.figure>
    </section>
  );
}
