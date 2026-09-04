"use client";

import { motion } from "framer-motion";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";

interface ScheduleItem {
  readonly time: string;
  readonly description: string;
}

interface GardenPathProps {
  schedule: readonly ScheduleItem[];
}

const routeMask =
  'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 100 100%27 preserveAspectRatio=%27none%27%3E%3Cpath d=%27M50 0 C14 24 86 72 50 100%27 fill=%27none%27 stroke=%27black%27 stroke-width=%271.4%27 stroke-linecap=%27round%27/%3E%3C/svg%3E")';

export default function GardenPath({ schedule }: GardenPathProps) {
  const reduceMotion = useHydrationSafeReducedMotion();

  return (
    <div className="relative mx-auto mt-12 max-w-4xl md:mt-16">
      <motion.span
        aria-hidden="true"
        className="absolute -left-2 bottom-[6.25rem] top-3 w-8 origin-top bg-accent-primary md:inset-x-[18%] md:w-auto"
        initial={reduceMotion ? false : { scaleY: 0 }}
        whileInView={{ scaleY: 1 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduceMotion ? 0 : 1.1 }}
        style={{
          maskImage: routeMask,
          maskPosition: "center",
          maskRepeat: "no-repeat",
          maskSize: "100% 100%",
          WebkitMaskImage: routeMask,
          WebkitMaskPosition: "center",
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "100% 100%",
        }}
      />

      <ol className="grid gap-16 md:gap-24">
        {schedule.map((item, index) => {
          const entryMotion = reduceMotion
            ? {}
            : {
                initial: { opacity: 0, x: index % 2 === 0 ? -28 : 28 },
                whileInView: { opacity: 1, x: 0 },
                viewport: { once: true, amount: 0.45 },
                transition: { duration: 0.55, delay: index * 0.08 },
              };

          return (
            <motion.li
              key={`${item.time}-${item.description}`}
              {...entryMotion}
              className={`relative ml-10 min-h-28 md:ml-0 md:w-[calc(50%-3rem)] ${
                index % 2 === 0
                  ? "md:mr-auto md:text-right"
                  : "md:ml-auto md:text-left"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute top-1.5 size-3 rounded-full bg-accent-primary ring-4 ring-wine ${
                  index % 2 === 0
                    ? "-left-[2.4rem] md:-right-[3.4rem] md:left-auto"
                    : "-left-[2.4rem] md:-left-[3.4rem]"
                }`}
              />
              <time className="text-[10px] uppercase tracking-[0.3em] text-petal">
                {item.time}
              </time>
              <p className="mt-3 font-serif text-2xl italic leading-snug text-cream md:text-3xl">
                {item.description}
              </p>
            </motion.li>
          );
        })}
      </ol>
    </div>
  );
}
