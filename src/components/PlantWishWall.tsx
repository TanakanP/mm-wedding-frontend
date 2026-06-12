"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

interface Wish {
  id: number;
  name: string;
  message: string;
}

interface PlantWishWallProps {
  userWish?: {
    name: string;
    message: string;
  };
}

const sampleWishes: Omit<Wish, "id">[] = [
  { name: "Lily & Rose", message: "May your love bloom brighter every season." },
  { name: "Uncle Fern", message: "Rooted in joy, growing in grace. Congratulations!" },
  { name: "Cousin Willow", message: "Wishing you endless gardens of happiness together." },
  { name: "The Garden Club", message: "To the most beautiful bloom of all — your union." },
];

function WishFlower({ wish, isNew, onSelect }: { wish: Wish; isNew?: boolean; onSelect: (w: Wish) => void }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(wish)}
      initial={{ scale: isNew ? 0.2 : 0.6, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: "spring", stiffness: 180, damping: 14, delay: isNew ? 0.05 : 0 }}
      className="group relative flex flex-col items-center focus:outline-none"
      aria-label={`Wish from ${wish.name}`}
    >
      {/* Stem */}
      <div className="w-px h-5 bg-sage/60 mx-auto -mb-px z-0" />

      {/* Bloom */}
      <div className="relative w-9 h-9 flex items-center justify-center">
        {/* Petals using .petal primitive + rotation */}
        {[0, 72, 144, 216, 288].map((deg, i) => (
          <div
            key={i}
            className="petal absolute origin-[50%_130%]"
            style={{
              left: "50%",
              top: "42%",
              transform: `rotate(${deg}deg) translateY(-6px)`,
              width: "7px",
              height: "7px",
            }}
          />
        ))}
        {/* Gold center */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-accent-primary z-10 shadow-sm" />
        {/* Subtle inner highlight */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-cream/70 z-20" />
      </div>

      {/* Name label */}
      <span className="mt-1 text-[10px] text-foreground/70 font-light tracking-tight group-hover:text-foreground transition-colors text-center leading-none max-w-[64px] truncate">
        {wish.name}
      </span>
    </motion.button>
  );
}

export default function PlantWishWall({ userWish }: PlantWishWallProps) {
  const [wishes, setWishes] = useState<Wish[]>(() =>
    sampleWishes.map((w, index) => ({ ...w, id: 1000 + index }))
  );
  const [selectedWish, setSelectedWish] = useState<Wish | null>(null);

  useEffect(() => {
    // Animate "planting" the user's wish (local demo). Samples are seeded at init.
    if (userWish && userWish.message?.trim()) {
      const userPlanted: Wish = {
        id: Date.now(),
        name: userWish.name,
        message: userWish.message.trim(),
      };

      const plantTimer = setTimeout(() => {
        setWishes((prev) => [...prev, userPlanted]);
        // Auto-highlight the newly planted wish for a moment
        setSelectedWish(userPlanted);
        // Clear highlight after a bit
        setTimeout(() => {
          setSelectedWish((cur) => (cur?.id === userPlanted.id ? null : cur));
        }, 1800);
      }, 650);

      return () => clearTimeout(plantTimer);
    }
  }, [userWish]);

  const handleSelect = (wish: Wish) => {
    setSelectedWish((cur) => (cur?.id === wish.id ? null : wish));
  };

  return (
    <div className="w-full">
      <div className="text-center mb-3">
        <p className="font-serif text-xl text-accent-primary tracking-tight">Plant Your Wish Wall</p>
        <p className="text-xs text-sage/70 font-light mt-0.5">Each bloom carries a blessing for M &amp; M</p>
      </div>

      {/* Garden area with texture and soft cream base */}
      <div className="relative bg-cream garden-texture border border-sage/15 rounded-2xl px-5 py-6 min-h-[118px] flex flex-wrap gap-x-5 gap-y-3 justify-center items-end overflow-hidden">
        {wishes.map((wish, index) => (
          <WishFlower
            key={wish.id}
            wish={wish}
            isNew={index === wishes.length - 1 && !!userWish}
            onSelect={handleSelect}
          />
        ))}

        {/* Subtle ground / soil line for garden depth */}
        <div className="absolute bottom-2 left-4 right-4 h-px bg-sage/10" aria-hidden />
      </div>

      {/* Selected wish reveal (bloom-in) */}
      <AnimatePresence>
        {selectedWish && (
          <motion.div
            key={selectedWish.id}
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.985 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            className="mt-3 mx-auto max-w-[28ch] text-center"
          >
            <div className="inline-block px-4 py-2 rounded-xl bg-background/80 border border-sage/15 text-sm text-foreground font-light tracking-tight shadow-sm">
              <span className="font-medium text-accent-primary">{selectedWish.name}:</span>{" "}
              {selectedWish.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="mt-2 text-[10px] text-sage/60 text-center tracking-wide">
        Tap a flower to hear its wish • Yours is planted and growing
      </p>
    </div>
  );
}
