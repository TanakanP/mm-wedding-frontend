"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const milestones = [
  {
    year: "2018",
    title: "First Met",
    description:
      "In a hidden rose garden café, surrounded by climbing vines and the scent of jasmine, we talked for hours as golden light filtered through the leaves.",
  },
  {
    year: "2020",
    title: "First Trip",
    description:
      "We wandered through misty mountain gardens and planted a young sapling together — the first tree in our shared garden of memories.",
  },
  {
    year: "2024",
    title: "The Proposal",
    description:
      "Beneath a canopy of wisteria and stars in our secret garden, with a ring hidden inside a perfect blooming lotus.",
  },
];

export default function OurStory() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleActive = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full py-24 bg-cream garden-texture text-center px-4">
      <div className="max-w-4xl mx-auto">
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-serif text-4xl md:text-5xl text-accent-primary mb-16"
        >
          Our Story
        </motion.h2>

        {/* Simple vertical sage path with asymmetry for winding garden feel */}
        <div className="space-y-12 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-sage before:to-transparent">
          {milestones.map((milestone, index) => {
            const isActive = activeIndex === index;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ delay: index * 0.2 }}
                className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group"
              >
                {/* Sage-toned path marker; gold accent when active */}
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 transition-colors ${
                    isActive
                      ? "border-accent-primary bg-cream text-accent-primary shadow"
                      : "border-sage/30 bg-cream text-sage shadow"
                  }`}
                >
                  <div
                    className={`w-3 h-3 rounded-full transition-colors ${
                      isActive ? "bg-accent-primary" : "bg-accent-secondary"
                    }`}
                  ></div>
                </div>

                {/* Blooming card: uses framer-motion whileInView (scale + opacity + rotate) matching .bloom keyframe for "bloom on view".
                    Click to activate (gold accents, stronger shadow) for interactive "open" feel per spec. */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
                  whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{
                    duration: 0.6,
                    ease: [0.23, 1, 0.32, 1],
                    delay: 0.05 + index * 0.1,
                  }}
                  onClick={() => toggleActive(index)}
                  className={`w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-background p-6 rounded-lg text-left border transition-all duration-300 cursor-pointer ${
                    isActive
                      ? "border-accent-primary shadow-md ring-1 ring-accent-primary/20"
                      : "border-sage/20 shadow-sm hover:border-sage/40 hover:shadow"
                  }`}
                >
                  <span className="font-serif text-accent-primary text-lg bloom">
                    {milestone.year}
                  </span>
                  <h3 className="font-bold text-xl text-foreground mt-1">
                    {milestone.title}
                  </h3>
                  <p className="text-foreground/70 mt-2 font-light leading-relaxed">
                    {milestone.description}
                  </p>
                </motion.div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
