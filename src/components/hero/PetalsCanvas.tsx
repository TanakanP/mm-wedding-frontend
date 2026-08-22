"use client";

import { useEffect, useRef } from "react";

export default function PetalsCanvas({ wind = 0 }: { wind?: number }) {
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
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = Math.max(1, rect.width);
      canvas.height = Math.max(1, rect.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const petalColor =
      getComputedStyle(document.documentElement)
        .getPropertyValue("--color-accent-secondary")
        .trim() || "#c48a7f";

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

      // Smooth sakura-style petal shape (reverted per request)
      // Animation / physics kept as-is (current gravity + rotation)
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

    const animate = () => {
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
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none z-0"
      style={{ width: "100%", height: "100%" }}
    />
  );
}
