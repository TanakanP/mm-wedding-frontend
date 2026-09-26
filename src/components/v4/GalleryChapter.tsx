"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import Image from "next/image";
import { GALLERY_PHOTOS } from "@/content/wedding";

const galleryLayouts = [
  "col-span-2 aspect-[3/4] w-full md:h-[36rem] md:aspect-auto",
  "aspect-[3/4] md:h-[36rem] md:aspect-auto",
  "aspect-[3/4] md:h-[36rem] md:aspect-auto",
  "col-span-2 aspect-[3/2] w-full md:h-[28rem] md:aspect-auto",
] as const;

export default function GalleryChapter() {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <section
      id="gallery"
      aria-label="Our photo gallery"
      className="garden-section grid w-full grid-cols-2 gap-0 overflow-hidden bg-wine"
    >
      {GALLERY_PHOTOS.map((photo, index) => {
        const imageSizes = index === 0 || index === 3 ? "100vw" : "50vw";
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
            key={photo.src}
            className={`relative overflow-hidden ${galleryLayouts[index]}`}
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
                sizes={imageSizes}
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
