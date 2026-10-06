"use client";

import { useEffect, useState } from "react";
import { getTimeLeft, shouldContinueCountdown, type TimeLeft } from "@/lib/countdown";

const unitLabels = ["MONTHS", "DAYS", "HOURS", "MINUTES", "SECONDS"] as const;

export default function Countdown({ targetDateIso }: { targetDateIso: string }) {
  const targetMs = new Date(targetDateIso).getTime();
  // Keep the server and first client render identical, even for cached HTML.
  const [timeLeft, setTimeLeft] = useState<TimeLeft | null>(null);

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

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") update();
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("pageshow", update);

    return () => {
      if (interval !== undefined) window.clearInterval(interval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("pageshow", update);
    };
  }, [targetMs]);

  if (timeLeft?.isPast) {
    return (
      <div className="mt-10 text-[10px] uppercase tracking-[0.2em] text-petal">
        THE NEW CHAPTER BEGINS TODAY, SEE YOU SOON.
      </div>
    );
  }

  const values = timeLeft ? [
    timeLeft.months,
    timeLeft.days,
    timeLeft.hours,
    timeLeft.minutes,
    timeLeft.seconds,
  ] : ["—", "—", "—", "—", "—"];

  return (
    <div className="mt-10">
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
