"use client";

import { motion } from "framer-motion";
import { Leaf, Flower } from "lucide-react";
import { useSections } from "@/hooks/useSections";

export default function GardenNav() {
  const { scrollTo: sectionsScrollTo, scrollToTop, currentSectionId } =
    useSections();

  // Hide on hero for a clean landing; show on every other chapter.
  // Driven by IntersectionObserver (not scrollTop) so it works with the snap container.
  const isOnHero = currentSectionId === "hero";
  const isVisible = !isOnHero;

  const scrollToSection = (label: string) => {
    const idMap: Record<string, string> = {
      "our story": "our-story",
      "garden path": "garden-path",
      "garden whispers": "garden-whispers",
    };

    const lower = label.toLowerCase();
    const targetId = Object.entries(idMap).find(([key]) =>
      lower.includes(key)
    )?.[1];

    if (targetId) {
      sectionsScrollTo(
        targetId as "hero" | "our-story" | "garden-path" | "garden-whispers"
      );
    }
  };

  const handleRSVPClick = () => {
    sectionsScrollTo("garden-path");
  };

  return (
    <motion.nav
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-b border-sage/15"
      aria-label="Primary garden navigation"
      aria-hidden={!isVisible}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div className="max-w-5xl mx-auto px-3 md:px-6 h-12 md:h-14 flex items-center justify-between text-sm">
        <button
          onClick={scrollToTop}
          className="font-serif text-lg md:text-xl tracking-[0.5px] text-foreground/80 hover:text-accent-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/50 rounded px-1 shrink-0"
          aria-label="Scroll to top"
        >
          M &amp; M
        </button>

        <div className="flex items-center gap-x-0.5 text-foreground/70 overflow-x-auto -mx-1 px-1">
          {[
            { label: "Our Story", id: "our-story", icon: Leaf },
            { label: "The Garden Path", id: "garden-path", icon: Flower },
            { label: "Garden Whispers", id: "garden-whispers", icon: Flower },
          ].map(({ label, id, icon: Icon }, idx) => {
            const isActive = currentSectionId === id;
            return (
              <button
                key={idx}
                onClick={() => scrollToSection(label)}
                className={`group flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] md:text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/40 whitespace-nowrap ${
                  isActive
                    ? "text-accent-primary font-medium"
                    : "hover:bg-background/60 hover:text-foreground"
                }`}
                aria-label={`Scroll to ${label}`}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon
                  className={`w-3.5 h-3.5 transition-colors ${
                    isActive
                      ? "text-accent-primary"
                      : "text-accent-secondary/80 group-hover:text-accent-secondary"
                  }`}
                />
                <span className="hidden sm:inline tracking-tight">
                  {label === "The Garden Path" ? "Garden Path" : label}
                </span>
              </button>
            );
          })}
        </div>

        <motion.button
          onClick={handleRSVPClick}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.975 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="bg-accent-primary text-white text-xs md:text-sm font-medium px-3.5 md:px-5 py-1 md:py-1.5 rounded-full shadow-sm hover:bg-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-cream focus-visible:ring-accent-primary/70 flex items-center gap-1 shrink-0"
          aria-label="Scroll to RSVP"
        >
          RSVP
          <span aria-hidden="true" className="text-[9px] opacity-80">
            ✿
          </span>
        </motion.button>
      </div>
    </motion.nav>
  );
}