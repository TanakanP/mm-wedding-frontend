"use client";

import { useCallback, useRef, useState } from "react";
import { motion } from "framer-motion";
import { PHOTO_SIZE_CLASS, type PhotoPlacement } from "./constants";
import StoryPhotoImage from "./StoryPhotoImage";

const MAX_SWING = 9.23;

type PinnedPhotoProps = {
  placement: PhotoPlacement;
  index: number;
  visible: boolean;
};

function PushPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="absolute -top-2 left-1/2 -translate-x-1/2 w-5 h-5 md:w-6 md:h-6 z-20 drop-shadow-sm pointer-events-none"
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
  const figureRef = useRef<HTMLElement>(null);
  const [swing, setSwing] = useState(0);
  const baseRotation = placement.rotation;

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const el = figureRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const next = Math.max(
      -MAX_SWING,
      Math.min(MAX_SWING, (x / (rect.width / 2)) * MAX_SWING)
    );
    setSwing(next);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setSwing(0);
  }, []);

  if (!visible) return null;

  return (
    <motion.figure
      ref={figureRef}
      className={`absolute z-20 hidden md:block cursor-default ${placement.position}`}
      style={{ transformOrigin: "top center" }}
      initial={{ opacity: 0, y: -20, scale: 0.9, rotate: baseRotation }}
      animate={{
        opacity: 1,
        y: 0,
        scale: 1,
        rotate: baseRotation + swing,
      }}
      transition={{
        opacity: { duration: 0.45, delay: index * 0.35, ease: [0.34, 1.4, 0.64, 1] },
        y: { duration: 0.45, delay: index * 0.35, ease: [0.34, 1.4, 0.64, 1] },
        scale: { duration: 0.45, delay: index * 0.35, ease: [0.34, 1.4, 0.64, 1] },
        rotate: { type: "spring", stiffness: 280, damping: 26 },
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      <PushPin />
      <StoryPhotoImage
        placement={placement}
        className={`border-[5px] border-white shadow-lg ${PHOTO_SIZE_CLASS[placement.size ?? "md"]}`}
        sizes="215px"
      />
      <figcaption className="sr-only">{placement.alt}</figcaption>
    </motion.figure>
  );
}