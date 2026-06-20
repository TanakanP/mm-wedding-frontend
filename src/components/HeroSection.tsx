"use client";

import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

interface TimeLeft {
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const PetalsCanvas = ({ wind = 0 }: { wind?: number }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const windRef = useRef(wind);
  const rafRef = useRef<number | null>(null);

  interface Petal {
    x: number;
    y: number;
    vy: number;
    vx: number;
    rot: number;
    vr: number;
    size: number;
    opacity: number;
  }
  const particlesRef = useRef<Petal[]>([]);

  // Keep wind fresh without causing re-renders of canvas logic
  useEffect(() => {
    windRef.current = wind;
  }, [wind]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width);
      canvas.height = Math.max(1, rect.height);
    };
    resize();
    window.addEventListener('resize', resize);

    const petalColor = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-accent-secondary')
      .trim() || '#c48a7f';

    // Initialize particles so they are continuously falling from the top area
    particlesRef.current = Array.from({ length: 26 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600) - (canvas.height || 600) * 0.4,
      vy: 0.65 + Math.random() * 0.95,
      vx: (Math.random() - 0.5) * 0.45,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.028,
      size: 7 + Math.random() * 5.5,
      opacity: 0.38 + Math.random() * 0.45,
    }));

    const drawPetal = (x: number, y: number, size: number, rot: number, alpha: number) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = petalColor;

      const s = size;

      // Smooth sakura-style petal shape (reverted per request)
      // Animation / physics kept as-is (current gravity + rotation)
      ctx.beginPath();
      ctx.moveTo(0, s * 0.88);
      ctx.quadraticCurveTo(-s * 0.62, s * 0.35, -s * 0.42, -s * 0.18);
      ctx.quadraticCurveTo(-s * 0.18, -s * 0.72, 0, -s * 0.52);
      ctx.quadraticCurveTo( s * 0.18, -s * 0.72, s * 0.42, -s * 0.18);
      ctx.quadraticCurveTo( s * 0.62, s * 0.35, 0, s * 0.88);
      ctx.closePath();
      ctx.fill();

      // Center vein
      ctx.strokeStyle = 'rgba(0,0,0,0.15)';
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.68);
      ctx.quadraticCurveTo(0, s * 0.10, 0, -s * 0.38);
      ctx.stroke();

      ctx.restore();
    };


    const animate = () => {
      if (!ctx || !canvas) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const w = windRef.current * 0.07;

      particlesRef.current.forEach((p, i) => {
        // realistic gravity: accelerate + terminal velocity (air drag)
        p.vy += 0.022;
        if (p.vy > 3.15) p.vy = 3.15;

        p.y += p.vy;
        const windEffect = w + Math.sin(p.y * 0.019 + i) * 0.38;
        p.x += p.vx + windEffect;

        // enhanced rotation + realistic tumbling/gravity flutter
        p.rot += p.vr;
        // random air torque for natural irregular spin
        p.vr += (Math.random() - 0.5) * 0.0039;
        p.vr *= 0.976;
        // lateral movement creates rolling torque (realistic)
        p.vr += (p.vx + w) * 0.011;
        // extra visible flutter (more rotation)
        p.rot += Math.sin(p.y * 0.027 + i * 1.7) * 0.009;
        // safety clamp
        if (p.vr > 0.19) p.vr = 0.19;
        if (p.vr < -0.19) p.vr = -0.19;

        if (p.y > canvas.height + 20) {
          p.y = -15;
          p.x = Math.random() * canvas.width;
          p.vy = 0.65 + Math.random() * 0.95;
          p.vr = (Math.random() - 0.5) * 0.028;
          p.rot = Math.random() * Math.PI * 2;
          p.vx = (Math.random() - 0.5) * 0.45;
        }
        if (p.x < -6) p.x = canvas.width + 3;
        if (p.x > canvas.width + 6) p.x = -3;

        drawPetal(p.x, p.y, p.size, p.rot, p.opacity);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: '100%', height: '100%' }}
    />
  );
};

export default function HeroSection() {
  const targetDate = new Date("2026-12-05T00:00:00").getTime();

  const getTimeLeft = (): TimeLeft => {
    const now = Date.now();
    const diff = Math.max(0, targetDate - now);

    // Use approximate month (30.44 days) for visual months remaining + precise remainder
    const monthMs = 1000 * 60 * 60 * 24 * 30.436875;
    const months = Math.floor(diff / monthMs);
    const days = Math.floor((diff % monthMs) / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { months, days, hours, minutes, seconds };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(() => getTimeLeft());
  const [isPast, setIsPast] = useState(() => Date.now() >= targetDate);
  const [secretClicks, setSecretClicks] = useState(0);

  const [wind, setWind] = useState(0);

  useEffect(() => {
    const update = () => {
      const tl = getTimeLeft();
      setTimeLeft(tl);
      if (Date.now() >= targetDate) {
        setIsPast(true);
      }
    };
    update();
    const interval = setInterval(update, 1000); // live seconds

    return () => clearInterval(interval);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      <PetalsCanvas wind={wind} />
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

        <div className="mt-10" suppressHydrationWarning>
          {isPast ? (
            <div className="text-[10px] tracking-[0.2em] uppercase text-accent-primary">
              THE NEW CHAPTER BEGINS TODAY, SEE YOU SOON.
            </div>
          ) : (
            <>
              <div className="text-[10px] tracking-[0.2em] uppercase text-accent-primary mb-3">
                The new chapter awaits in
              </div>
              <div className="flex items-baseline justify-center gap-4 sm:gap-6 md:gap-8 font-light text-foreground">
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tabular-nums" suppressHydrationWarning>
                    {timeLeft.months}
                  </div>
                  <div className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] mt-1 text-sage">MONTHS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tabular-nums" suppressHydrationWarning>
                    {timeLeft.days}
                  </div>
                  <div className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] mt-1 text-sage">DAYS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tabular-nums" suppressHydrationWarning>
                    {timeLeft.hours}
                  </div>
                  <div className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] mt-1 text-sage">HOURS</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tabular-nums" suppressHydrationWarning>
                    {timeLeft.minutes}
                  </div>
                  <div className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] mt-1 text-sage">MINUTES</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl tabular-nums" suppressHydrationWarning>
                    {timeLeft.seconds}
                  </div>
                  <div
                    className="text-[8px] sm:text-[9px] md:text-[10px] tracking-[0.2em] mt-1 text-sage"
                    onClick={() => {
                      const next = secretClicks + 1;
                      setSecretClicks(next);
                      if (next >= 5) {
                        setIsPast(true);
                      }
                    }}
                  >
                    SECONDS
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </section>
  );
}
