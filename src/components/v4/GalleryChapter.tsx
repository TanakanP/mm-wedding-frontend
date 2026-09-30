"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import Image from "next/image";
import { GALLERY_PHOTOS } from "@/content/wedding";

const galleryLayouts = [
  "col-span-2 aspect-[3/4] w-full md:h-[36rem] md:aspect-auto",
  "aspect-[3/4] md:h-[36rem] md:aspect-auto",
  "aspect-[3/4] md:h-[36rem] md:aspect-auto",
  "col-span-2 aspect-[3/2] w-full md:h-[28rem] md:aspect-auto",
] as const;

const revealEase = [0.22, 1, 0.36, 1] as const;

function GalleryPhoto({
  photo,
  index,
  reduceMotion,
}: {
  photo: (typeof GALLERY_PHOTOS)[number];
  index: number;
  reduceMotion: boolean;
}) {
  const [failed, setFailed] = useState(false);
  const imageSizes = index === 0 || index === 3 ? "100vw" : "50vw";
  const revealMotion = reduceMotion
    ? {
        initial: false as const,
        animate: { opacity: 1, scale: 1 },
        transition: { duration: 0 },
      }
    : {
        initial: { opacity: 0, scale: 1.08 },
        whileInView: { opacity: 1, scale: 1 },
        viewport: { once: true, amount: 0.35 },
        transition: { duration: 0.95, delay: index * 0.08, ease: revealEase },
      };

  return (
    <figure className={`relative overflow-hidden bg-wine ${galleryLayouts[index]}`}>
      {/* This stays visible independently of loading and the scroll reveal. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={photo.blurDataURL}
        alt=""
        aria-hidden="true"
        style={{ objectPosition: photo.objectPosition }}
        className="absolute inset-0 h-full w-full scale-105 object-cover opacity-35"
      />
      <motion.div
        {...revealMotion}
        whileHover={reduceMotion ? undefined : { scale: 1.04 }}
        className="absolute inset-0"
        style={{ visibility: failed ? "hidden" : "visible" }}
      >
        <Image
          src={photo.src}
          alt={photo.alt}
          fill
          sizes={imageSizes}
          loading="eager"
          fetchPriority="low"
          placeholder="blur"
          blurDataURL={photo.blurDataURL}
          className="object-cover"
          style={{ objectPosition: photo.objectPosition }}
          onError={() => setFailed(true)}
        />
      </motion.div>
    </figure>
  );
}

export default function GalleryChapter() {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <section
      id="gallery"
      aria-label="Our photo gallery"
      className="garden-section grid w-full grid-cols-2 gap-0 overflow-hidden bg-wine"
    >
      {GALLERY_PHOTOS.map((photo, index) => (
        <GalleryPhoto key={photo.src} photo={photo} index={index} reduceMotion={reduceMotion} />
      ))}
    </section>
  );
}
