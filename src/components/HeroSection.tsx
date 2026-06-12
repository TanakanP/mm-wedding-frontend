"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface TimeLeft {
  days: number;
  hours: number;
}

const Petals = ({ wind = 0 }: { wind?: number }) => {
  const [petals, setPetals] = useState<
    Array<{ id: number; left: number; delay: number; duration: number; drift: number }>
  >([]);

  useEffect(() => {
    const newPetals = Array.from({ length: 18 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 8,
      duration: 12 + Math.random() * 6,
      drift: (Math.random() - 0.5) * 40,
    }));
    setPetals(newPetals);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {petals.map((p) => (
        <motion.div
          key={p.id}
          className="petal"
          style={{ left: `${p.left}%` }}
          animate={{
            y: ["-10%", "110%"],
            x: [0, p.drift + wind],
            rotate: [0, 360],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
};

export default function HeroSection() {
  const targetDate = new Date("2026-12-05T00:00:00").getTime();

  const getTimeLeft = (): TimeLeft => {
    const now = Date.now();
    const diff = targetDate - now;
    if (diff > 0) {
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      return { days, hours };
    }
    return { days: 0, hours: 0 };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(getTimeLeft);

  const [wind, setWind] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(getTimeLeft());
    }, 60000); // update every minute per spec

    return () => clearInterval(interval);
  }, [targetDate]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Map mouse position across viewport to gentle wind offset (-15px to +15px)
      const normalized = e.clientX / window.innerWidth - 0.5;
      const windOffset = normalized * 30;
      setWind(windOffset);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-cream garden-texture">
      <Petals wind={wind} />
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center px-4"
      >
        <h2 className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 text-accent-primary font-semibold">
          We are getting married
        </h2>
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-foreground mb-6">
          M <span className="text-accent-secondary italic font-light">&amp;</span> M
        </h1>
        <p className="text-xl md:text-2xl font-light text-foreground/80 tracking-wider">
          5 December 2026 • The Garden Hiroen
        </p>

        {/* Blooming countdown - days and hours; numbers bloom on value change via key + .bloom */}
        <div className="mt-10">
          <div className="text-[10px] tracking-[0.2em] uppercase text-accent-primary mb-3">
            The garden awaits in
          </div>
          <div className="flex items-baseline justify-center gap-10 font-light text-foreground">
            <div className="text-center">
              <div className="text-5xl md:text-6xl tabular-nums">
                <span key={timeLeft.days} className="bloom">
                  {timeLeft.days}
                </span>
              </div>
              <div className="text-xs tracking-[0.15em] mt-1 text-sage">DAYS</div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl tabular-nums">
                <span key={timeLeft.hours} className="bloom">
                  {timeLeft.hours}
                </span>
              </div>
              <div className="text-xs tracking-[0.15em] mt-1 text-sage">HOURS</div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
