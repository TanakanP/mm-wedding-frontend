"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { EASE, TIMING, type PhotoPlacement } from "./constants";
import StoryPhotoImage from "./StoryPhotoImage";

type PhotoCarouselProps = {
  photos: PhotoPlacement[];
  direction: "ltr" | "rtl";
  visible: boolean;
};

function CarouselPhoto({ placement }: { placement: PhotoPlacement }) {
  return (
    <figure className="shrink-0 my-4">
      <StoryPhotoImage
        placement={placement}
        className="w-[140px] h-[175px] border-[5px] border-white shadow-lg"
        sizes="140px"
      />
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