"use client";

import { motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { PHOTOS, V4_GALLERY_PHOTO_IDS } from "@/content/wedding";

export default function GalleryChapter() {
  const reduceMotion = Boolean(useReducedMotion());

  return (
    <section
      id="gallery"
      aria-label="Our photo gallery"
      className="garden-section grid w-full grid-cols-2 gap-0 overflow-hidden bg-wine"
    >
      {V4_GALLERY_PHOTO_IDS.map((id, index) => {
        const photo = PHOTOS[id];
        const revealMotion = reduceMotion
          ? {}
          : {
              initial: {
                opacity: 0,
                scale: 0.97,
                filter: "saturate(0.6)",
              },
              whileInView: {
                opacity: 1,
                scale: 1,
                filter: "saturate(1)",
              },
              viewport: { once: true, amount: 0.2 },
              transition: {
                duration: 0.75,
                delay: index * 0.08,
                ease: [0.22, 1, 0.36, 1] as const,
              },
            };

        return (
          <figure
            key={photo.id}
            className={`relative overflow-hidden ${
              index === 0
                ? "col-span-2 aspect-[4/5] md:col-span-1 md:row-span-2 md:aspect-auto md:min-h-[44rem]"
                : index === 3
                  ? "col-span-2 aspect-[16/10] md:aspect-[16/7]"
                  : "aspect-[3/4] md:min-h-[22rem] md:aspect-auto"
            }`}
          >
            <motion.div
              {...revealMotion}
              whileHover={reduceMotion ? undefined : { scale: 1.04 }}
              className="absolute inset-0"
            >
              <Image
                src={photo.src}
                alt={photo.alt}
                fill
                sizes="(max-width: 767px) 100vw, 50vw"
                className="object-cover"
                style={{ objectPosition: photo.objectPosition }}
              />
            </motion.div>
          </figure>
        );
      })}
    </section>
  );
}
