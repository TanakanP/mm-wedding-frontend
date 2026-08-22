"use client";

import { useEffect, type RefObject } from "react";
import { useMotionValue, type MotionValue } from "framer-motion";
import { getSectionScrollProgress } from "@/lib/scrollAnimations";

function bindScrollMetrics(
  ref: RefObject<HTMLElement | null>,
  update: (rect: DOMRect) => void
) {
  const run = () => {
    const section = ref.current;
    if (!section) return;
    update(section.getBoundingClientRect());
  };

  run();
  window.addEventListener("scroll", run, { passive: true });
  window.addEventListener("resize", run);

  return () => {
    window.removeEventListener("scroll", run);
    window.removeEventListener("resize", run);
  };
}

export function useElementScrollProgress(
  ref: RefObject<HTMLElement | null>
): MotionValue<number> {
  const progress = useMotionValue(0);

  useEffect(() => {
    return bindScrollMetrics(ref, (rect) => {
      progress.set(getSectionScrollProgress(rect.top, rect.height));
    });
  }, [progress, ref]);

  return progress;
}
