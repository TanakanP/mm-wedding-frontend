"use client";

import { motion } from "framer-motion";

export default function HeroSection() {
  return (
    <section className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden bg-pastel-rose">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, ease: "easeOut" }}
        className="z-10 text-center px-4"
      >
        <h2 className="text-sm md:text-base tracking-[0.3em] uppercase mb-4 text-accent-primary font-semibold">
          We are getting married
        </h2>
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl text-stone-800 mb-6">
          M <span className="text-accent-secondary italic font-light">&amp;</span> M
        </h1>
        <p className="text-xl md:text-2xl font-light text-stone-600 tracking-wider">
          December 5, 2026
        </p>
      </motion.div>
    </section>
  );
}
