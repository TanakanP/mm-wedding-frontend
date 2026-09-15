"use client";

import { useEffect, useState } from "react";
import { getTimeLeft, shouldContinueCountdown } from "@/lib/countdown";

const unitLabels = ["MONTHS", "DAYS", "HOURS", "MINUTES", "SECONDS"] as const;

export default function Countdown({ targetDateIso }: { targetDateIso: string }) {
  const targetMs = new Date(targetDateIso).getTime();
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(targetMs));

  useEffect(() => {
    let interval: number | undefined;
    const update = () => {
      const nextTimeLeft = getTimeLeft(targetMs);
      setTimeLeft(nextTimeLeft);

      if (!shouldContinueCountdown(nextTimeLeft) && interval !== undefined) {
        window.clearInterval(interval);
        interval = undefined;
      }

      return nextTimeLeft;
    };

    if (shouldContinueCountdown(update())) {
      interval = window.setInterval(update, 1000);
    }

    return () => {
      if (interval !== undefined) window.clearInterval(interval);
    };
  }, [targetMs]);

  if (timeLeft.isPast) {
    return (
      <div className="mt-10 text-[10px] uppercase tracking-[0.2em] text-petal">
        THE NEW CHAPTER BEGINS TODAY, SEE YOU SOON.
      </div>
    );
  }

  const values = [
    timeLeft.months,
    timeLeft.days,
    timeLeft.hours,
    timeLeft.minutes,
    timeLeft.seconds,
  ];

  return (
    <div className="mt-10" suppressHydrationWarning>
      <div className="mb-4 text-[10px] uppercase tracking-[0.2em] text-petal">
        The new chapter awaits in
      </div>
      <div className="mx-auto grid max-w-[22rem] grid-cols-5 items-start gap-x-1 font-light text-cream sm:gap-x-2 md:max-w-none md:gap-x-4">
        {unitLabels.map((label, index) => (
          <div
            key={label}
            className="min-w-0 text-center"
          >
            <div
              className="font-serif text-3xl tabular-nums sm:text-4xl md:text-5xl lg:text-6xl"
              suppressHydrationWarning
            >
              {values[index]}
            </div>
            <div className="mt-1 text-[8px] tracking-[0.08em] text-petal sm:text-[9px] sm:tracking-[0.15em] lg:text-[10px]">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
