"use client";

import { useEffect, useRef } from "react";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";

export default function PetalsCanvas({
  variant = "petals",
  paused = false,
  splitDepth = false,
}: {
  variant?: "petals" | "confetti";
  paused?: boolean;
  splitDepth?: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number | null>(null);
  const reduceMotion = useHydrationSafeReducedMotion();

  interface Petal {
    x: number;
    y: number;
    vy: number;
    vx: number;
    rot: number;
    vr: number;
    size: number;
    opacity: number;
    flip: number;
    flipSpeed: number;
    tilt: number;
    tiltSpeed: number;
    terminalVelocity: number;
  }
  const particlesRef = useRef<Petal[]>([]);

  useEffect(() => {
    if (paused || reduceMotion) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const backCanvas = variant === "confetti" && splitDepth ? backCanvasRef.current : null;
    const backCtx = backCanvas?.getContext("2d");

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width);
      canvas.height = Math.max(1, rect.height);
      if (backCanvas) {
        backCanvas.width = canvas.width;
        backCanvas.height = canvas.height;
      }
    };
    resize();
    window.addEventListener("resize", resize);

    const petalColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-petal")
        .trim() || "#eed4d8";
    const theme = getComputedStyle(document.documentElement);
    const confettiColors = ["--color-dusty", "--color-accent-primary", "--color-violet"]
      .map((name) => theme.getPropertyValue(name).trim() || petalColor);

    // Initialize particles so they are continuously falling from the top area
    particlesRef.current = Array.from({ length: variant === "confetti" ? 24 : 12 }, () => ({
      x: Math.random() * (canvas.width || 800),
      y: Math.random() * (canvas.height || 600) - (canvas.height || 600) * 0.4,
      vy: variant === "confetti" ? 2 + Math.random() * 1.2 : 0.65 + Math.random() * 0.95,
      vx: (Math.random() - 0.5) * (variant === "confetti" ? 1.25 : 0.45),
      rot: Math.random() * Math.PI * 2,
      vr: variant === "confetti" ? (Math.random() < 0.5 ? -1 : 1) * (0.018 + Math.random() * 0.045) : (Math.random() - 0.5) * 0.028,
      size: variant === "confetti" ? 14 + Math.random() * 9 : 7 + Math.random() * 5.5,
      opacity: variant === "confetti" ? 0.5 + Math.random() * 0.25 : 0.3 + Math.random() * 0.25,
      flip: Math.random() * Math.PI * 2,
      flipSpeed: (Math.random() < 0.5 ? -1 : 1) * (0.045 + Math.random() * 0.055),
      tilt: Math.random() * Math.PI * 2,
      tiltSpeed: 0.015 + Math.random() * 0.025,
      terminalVelocity: 2.8 + Math.random() * 2,
    }));

    const drawPetal = (
      x: number,
      y: number,
      size: number,
      rot: number,
      alpha: number
    ) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rot);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = petalColor;

      const s = size;

      // Original sakura petal silhouette.
      ctx.beginPath();
      ctx.moveTo(0, s * 0.88);
      ctx.quadraticCurveTo(-s * 0.62, s * 0.35, -s * 0.42, -s * 0.18);
      ctx.quadraticCurveTo(-s * 0.18, -s * 0.72, 0, -s * 0.52);
      ctx.quadraticCurveTo(s * 0.18, -s * 0.72, s * 0.42, -s * 0.18);
      ctx.quadraticCurveTo(s * 0.62, s * 0.35, 0, s * 0.88);
      ctx.closePath();
      ctx.fill();

      // Center vein
      ctx.strokeStyle = "rgba(0,0,0,0.15)";
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.moveTo(0, s * 0.68);
      ctx.quadraticCurveTo(0, s * 0.1, 0, -s * 0.38);
      ctx.stroke();

      ctx.restore();
    };

    const drawConfetti = (p: Petal, index: number) => {
      const drawCtx = backCtx && index % 2 === 0 ? backCtx : ctx;
      drawCtx.save();
      drawCtx.translate(p.x, p.y);
      drawCtx.rotate(p.rot);
      // Project a sheet turning in two axes; it becomes edge-on and shows its reverse.
      const tilt = Math.sin(p.tilt) * 0.7;
      const face = Math.cos(p.flip);
      drawCtx.transform(Math.cos(tilt), 0, Math.sin(tilt) * Math.sin(p.flip), face, 0, 0);
      drawCtx.globalAlpha = p.opacity * (face < 0 ? 0.7 : 1);
      drawCtx.fillStyle = confettiColors[index % confettiColors.length];
      drawCtx.beginPath();
      drawCtx.rect(-p.size * 0.45, -p.size * 0.45, p.size * 0.9, p.size * 0.9);
      drawCtx.fill();
      drawCtx.restore();
    };

    let previousTime = 0;
    let visible = false;
    const animate = (time: number) => {
      rafRef.current = null;
      if (!visible || document.hidden) return;
      const step = previousTime ? Math.min((time - previousTime) / 16.667, 2) : 1;
      previousTime = time;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      backCtx?.clearRect(0, 0, canvas.width, canvas.height);

      particlesRef.current.forEach((p, i) => {
        if (variant === "confetti") {
          p.vy = Math.min(p.vy + 0.045 * step, p.terminalVelocity);
          p.y += p.vy * (0.85 + Math.abs(Math.sin(p.flip)) * 0.15) * step;
          p.x += (p.vx + Math.sin(p.tilt + i) * 1.1 + Math.sin(p.flip) * 0.45) * step;
          p.rot += (p.vr + Math.sin(p.tilt) * 0.008) * step;
          p.flip += p.flipSpeed * step;
          p.tilt += p.tiltSpeed * step;
        } else {
          p.vy = Math.min(p.vy + 0.01 * step, 1.5);
          p.y += p.vy * step;
          p.x += (p.vx + Math.sin(p.y * 0.019 + i) * 0.38) * step;
          p.rot += (p.vr + Math.sin(p.y * 0.027 + i) * 0.009) * step;
        }

        if (p.y > canvas.height + 20) {
          p.y = variant === "confetti" ? -30 : -15;
          p.x = Math.random() * canvas.width;
          p.vy = variant === "confetti" ? 2 + Math.random() * 1.2 : 0.65 + Math.random() * 0.95;
          if (variant === "petals") p.vr = (Math.random() - 0.5) * 0.028;
          p.rot = Math.random() * Math.PI * 2;
          p.vx = (Math.random() - 0.5) * (variant === "confetti" ? 1.25 : 0.45);
        }
        const margin = variant === "confetti" ? 24 : 6;
        if (p.x < -margin) p.x = canvas.width + margin / 2;
        if (p.x > canvas.width + margin) p.x = -margin / 2;

        if (variant === "confetti") drawConfetti(p, i);
        else drawPetal(p.x, p.y, p.size, p.rot, p.opacity);
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    const syncPlayback = () => {
      if (visible && !document.hidden) {
        if (rafRef.current === null) rafRef.current = requestAnimationFrame(animate);
      } else {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
        previousTime = 0;
      }
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(
      ([entry]) => { visible = entry.isIntersecting; syncPlayback(); }
    );
    if (observer) observer.observe(canvas);
    else { visible = true; syncPlayback(); }
    document.addEventListener("visibilitychange", syncPlayback);

    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", syncPlayback);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      backCtx?.clearRect(0, 0, canvas.width, canvas.height);
      window.removeEventListener("resize", resize);
    };
  }, [variant, paused, splitDepth, reduceMotion]);

  return (
    <>
      {variant === "confetti" && splitDepth && (
        <canvas
          ref={backCanvasRef}
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none z-[1]"
          style={{ width: "100%", height: "100%" }}
        />
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 pointer-events-none ${variant === "confetti" ? "z-20" : "z-0"}`}
        style={{ width: "100%", height: "100%" }}
      />
    </>
  );
}
