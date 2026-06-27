"use client";

import { motion } from "framer-motion";
import { PHOTO_SIZE_CLASS, type PhotoPlacement } from "./constants";

type PinnedPhotoProps = {
  placement: PhotoPlacement;
  index: number;
  visible: boolean;
};

function LeafWatermark() {
  return (
    <svg
      viewBox="0 0 48 48"
      className="absolute bottom-2 right-2 w-8 h-8 opacity-20"
      aria-hidden
    >
      <path
        d="M24 42 C8 32 4 18 24 6 C44 18 40 32 24 42 Z"
        fill="white"
      />
      <path d="M24 10 L24 38" stroke="white" strokeWidth="1" opacity="0.5" />
    </svg>
  );
}

function PushPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 md:w-6 md:h-6 z-20 drop-shadow-sm"
      aria-hidden
    >
      <circle cx="12" cy="7" r="6" fill="#b89e68" />
      <circle cx="12" cy="6" r="3" fill="#d4bc8a" opacity="0.6" />
      <path d="M12 13 L12 22" stroke="#8a7a5a" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

export default function PinnedPhoto({
  placement,
  index,
  visible,
}: PinnedPhotoProps) {
  if (!visible) return null;

  return (
    <motion.figure
      className={`absolute z-20 hidden md:block ${placement.position}`}
      style={{ rotate: `${placement.rotation}deg` }}
      initial={{ opacity: 0, y: -20, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.45,
        delay: index * 0.35,
        ease: [0.34, 1.4, 0.64, 1],
      }}
    >
      <PushPin />
      <div
        className={`relative border-[5px] border-white shadow-lg overflow-hidden ${PHOTO_SIZE_CLASS[placement.size ?? "md"]}`}
        style={{
          background: `linear-gradient(145deg, ${placement.gradient[0]}, ${placement.gradient[1]})`,
        }}
      >
        <span
          className="absolute inset-0 flex items-center justify-center font-serif text-3xl md:text-4xl font-semibold text-white/90 drop-shadow-md pointer-events-none select-none"
          aria-hidden
        >
          {placement.id}
        </span>
        <LeafWatermark />
      </div>
      <figcaption className="sr-only">{placement.alt}</figcaption>
    </motion.figure>
  );
}