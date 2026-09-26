"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";
import ScheduleIllustration from "@/components/v4/ScheduleIllustration";

interface ScheduleItem {
  readonly time: string;
  readonly description: string;
  readonly icon: "feastPhotography" | "reception";
}

interface GardenPathProps {
  schedule: readonly ScheduleItem[];
}

export default function GardenPath({ schedule }: GardenPathProps) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <div className="relative mx-auto mt-12 max-w-xl md:mt-16">
      <ol className="grid gap-20 md:gap-24">
        {schedule.map((item, index) => {
          const entryMotion = reduceMotion
            ? {}
            : {
                initial: { opacity: 0, y: 20 },
                whileInView: { opacity: 1, y: 0 },
                viewport: { once: true, amount: 0.45 },
                transition: { duration: 0.55, delay: index * 0.08 },
              };

          return (
            <motion.li
              key={`${item.time}-${item.description}`}
              {...entryMotion}
              className="relative flex flex-col items-center px-4 text-center"
            >
              <span className="flex items-center justify-center text-accent-primary">
                <ScheduleIllustration kind={item.icon} />
              </span>
              <time className="mt-5 text-[10px] uppercase tracking-[0.3em] text-petal">
                {item.time}
              </time>
              <p className="mt-3 max-w-md font-serif text-2xl italic leading-snug text-cream md:text-3xl">
                {item.description}
              </p>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
