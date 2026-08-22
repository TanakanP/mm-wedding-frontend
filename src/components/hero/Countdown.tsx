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
      <div className="mt-10 text-[10px] tracking-[0.2em] uppercase text-accent-primary">
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
      <div className="text-[10px] tracking-[0.2em] uppercase text-accent-primary mb-3">
        The new chapter awaits in
      </div>
      <div className="flex items-baseline justify-center gap-4 sm:gap-6 md:gap-8 font-light text-foreground">
        {unitLabels.map((label, index) => (
          <div key={label} className="text-center">
            <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tabular-nums" suppressHydrationWarning>
              {values[index]}
            </div>
            <div className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] mt-1 text-sage">
              {label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
