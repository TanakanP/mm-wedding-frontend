"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface ScheduleItem {
  time: string;
  description: string;
}

interface GardenPathProps {
  schedule: ScheduleItem[];
}

export default function GardenPath({ schedule }: GardenPathProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const handleMarkerClick = (index: number) => {
    const item = schedule[index];
    console.log(`${item.time} — ${item.description}`);
    setSelectedIndex(selectedIndex === index ? null : index);
  };

  // Approximate positions for 6 markers along a winding horizontal garden path (percent left, px top offset from top of container)
  // Creates an artistic, non-literal winding garden path feel
  const markerPositions = [
    { left: "6%", top: "52px" },
    { left: "23%", top: "28px" },
    { left: "40%", top: "58px" },
    { left: "57%", top: "22px" },
    { left: "74%", top: "55px" },
    { left: "92%", top: "35px" },
  ];

  // Flower/lantern symbols for variety (thematic + elegant, no literal map)
  const markerSymbols = ["🌸", "🌹", "🏮", "🌿", "🌸", "✨"];

  return (
    <div className="w-full max-w-3xl mx-auto my-10">
      {/* Subtle thematic label */}
      <p className="text-xs uppercase tracking-[3px] text-sage/70 mb-3">The Garden Path</p>

      <div className="relative h-[90px] w-full">
        {/* Artistic winding path - SVG for smooth elegant curve. Subtle layered strokes in sage + gold for garden depth. */}
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 800 90"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            d="M40,48 Q160,18 280,55 Q420,82 540,25 Q660,60 720,42 Q780,55 780,48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeOpacity="0.35"
            className="text-sage"
          />
          {/* Subtle second pass for layered garden feel */}
          <path
            d="M40,48 Q160,18 280,55 Q420,82 540,25 Q660,60 720,42 Q780,55 780,48"
            fill="none"
            stroke="currentColor"
            strokeWidth="1"
            strokeOpacity="0.18"
            strokeDasharray="3 7"
            className="text-accent-primary"
          />
        </svg>

        {/* Tappable flower/lantern markers (4-6 per spec; using 6 from schedule) */}
        {schedule.map((item, index) => {
          const pos = markerPositions[index] || markerPositions[0];
          const isSelected = selectedIndex === index;
          return (
            <button
              key={index}
              onClick={() => handleMarkerClick(index)}
              className={`absolute flex items-center justify-center w-9 h-9 rounded-full border-2 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-primary/50 ${
                isSelected
                  ? "border-accent-primary bg-accent-primary/10 scale-110 shadow-md"
                  : "border-sage/40 bg-cream hover:border-accent-primary hover:scale-105 hover:bg-accent-primary/5"
              }`}
              style={{ left: pos.left, top: pos.top, transform: "translate(-50%, -50%)" }}
              aria-label={`Schedule item: ${item.time} ${item.description}`}
              title={`${item.time} — ${item.description}`}
            >
              <span className="text-base leading-none select-none" aria-hidden="true">
                {markerSymbols[index]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Demo detail reveal - inline "shows detail" when marker tapped.
          Uses motion for gentle bloom-like entrance. Click same marker to dismiss.
          Console also logs (for dev/demo). Expandable to modal later per plan. */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            key={selectedIndex}
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.98 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="mt-4 text-center"
          >
            <div className="inline-block px-5 py-2.5 rounded-full bg-background/70 border border-sage/20 text-sm text-foreground font-light tracking-tight shadow-sm">
              <span className="font-medium text-accent-primary">{schedule[selectedIndex].time}</span>
              <span className="mx-2 text-sage/50">—</span>
              {schedule[selectedIndex].description}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-3 text-[10px] text-sage/60 tracking-wide">Tap the blooms &amp; lanterns to explore the schedule</p>
    </div>
  );
}
