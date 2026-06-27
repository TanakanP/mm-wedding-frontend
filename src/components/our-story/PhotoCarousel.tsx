"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, TIMING, type PhotoPlacement } from "./constants";

type PhotoCarouselProps = {
  photos: PhotoPlacement[];
  direction: "ltr" | "rtl";
  visible: boolean;
};

function CarouselPhoto({ placement }: { placement: PhotoPlacement }) {
  return (
    <figure className="shrink-0 w-[140px] h-[175px] border-[5px] border-white shadow-lg overflow-hidden relative my-4">
      <div
        className="w-full h-full relative"
        style={{
          background: `linear-gradient(145deg, ${placement.gradient[0]}, ${placement.gradient[1]})`,
        }}
      >
        <span
          className="absolute inset-0 flex items-center justify-center font-serif text-3xl font-semibold text-white/90 drop-shadow-md pointer-events-none select-none"
          aria-hidden
        >
          {placement.id}
        </span>
      </div>
      <figcaption className="sr-only">{placement.alt}</figcaption>
    </figure>
  );
}

export default function PhotoCarousel({
  photos,
  direction,
  visible,
}: PhotoCarouselProps) {
  const reduceMotion = useReducedMotion();

  const track = [...photos, ...photos];
  const isLtr = direction === "ltr";

  return (
    <AnimatePresence>
      {visible && photos.length > 0 && (
        <motion.div
          className="w-full overflow-hidden"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.65, ease: EASE }}
          aria-hidden
        >
          <motion.div
            className="flex w-max gap-3"
            initial={{ x: isLtr ? "-50%" : "0%" }}
            animate={
              reduceMotion
                ? { x: "-25%" }
                : { x: isLtr ? ["-50%", "0%"] : ["0%", "-50%"] }
            }
            transition={
              reduceMotion
                ? { duration: 0 }
                : {
                    duration: TIMING.carouselDuration,
                    repeat: Infinity,
                    ease: "linear",
                    repeatType: "loop",
                  }
            }
          >
            {track.map((placement, index) => (
              <CarouselPhoto
                key={`${placement.id}-${index}`}
                placement={placement}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}