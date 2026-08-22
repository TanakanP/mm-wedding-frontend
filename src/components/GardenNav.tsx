"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { NAV_ITEMS, type SectionId } from "@/content/wedding";
import { useSections } from "@/hooks/useSections";

export default function GardenNav() {
  const { scrollTo: sectionsScrollTo, scrollToTop, currentSectionId } =
    useSections();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isOnHero = currentSectionId === "hero";
  const isVisible = !isOnHero;

  const navigateTo = (id: SectionId) => {
    sectionsScrollTo(id);
    setIsMenuOpen(false);
  };

  return (
    <motion.nav
      initial={false}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 bg-cream/95 backdrop-blur-md border-b border-sage/15"
      aria-label="Primary garden navigation"
      aria-hidden={!isVisible}
      inert={!isVisible}
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div className="max-w-5xl mx-auto px-3 md:px-6 h-12 md:h-14 flex items-center justify-between text-sm">
        <button
          onClick={() => {
            scrollToTop();
            setIsMenuOpen(false);
          }}
          className="font-serif text-lg md:text-xl tracking-[0.5px] text-foreground/80 hover:text-accent-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/50 rounded px-1 shrink-0"
          aria-label="Scroll to top"
        >
          M &amp; M
        </button>

        <div className="relative">
          <div className="hidden items-center gap-1 md:flex">
            {NAV_ITEMS.map((item) => {
              const isActive = currentSectionId === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => navigateTo(item.id)}
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/50 ${
                    isActive
                      ? "bg-accent-secondary/15 font-medium text-accent-secondary"
                      : "text-foreground/70 hover:bg-sage/10 hover:text-foreground"
                  }`}
                  aria-current={isActive ? "location" : undefined}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          <button
            type="button"
            onClick={() => setIsMenuOpen((open) => !open)}
            className="rounded-full border border-sage/30 px-3 py-1.5 text-xs font-medium tracking-wide text-foreground md:hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary/60"
            aria-expanded={isMenuOpen}
            aria-controls="garden-mobile-menu"
          >
            Menu
          </button>

          {isMenuOpen && (
            <div
              id="garden-mobile-menu"
              className="absolute right-0 top-full z-10 mt-2 w-48 rounded-sm border border-sage/20 bg-cream p-2 shadow-lg md:hidden"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = currentSectionId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`block w-full rounded-sm px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/60 ${
                      isActive
                        ? "bg-accent-secondary/15 font-medium text-accent-secondary"
                        : "text-foreground hover:bg-sage/10"
                    }`}
                    aria-current={isActive ? "location" : undefined}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <motion.button
          onClick={() => navigateTo("rsvp")}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.975 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="bg-accent-primary text-foreground text-xs md:text-sm font-medium px-3.5 md:px-5 py-1 md:py-1.5 rounded-full shadow-sm hover:bg-foreground hover:text-cream transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-cream focus-visible:ring-accent-primary/70 flex items-center gap-1 shrink-0"
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
