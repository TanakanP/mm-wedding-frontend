"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { NAV_ITEMS, type SectionId } from "@/content/wedding";
import { useSections } from "@/hooks/useSections";
import { useHydrationSafeReducedMotion } from "@/hooks/useHydrationSafeReducedMotion";

export default function GardenNav() {
  const { scrollTo: sectionsScrollTo, scrollToTop, currentSectionId } =
    useSections();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const reduceMotion = useHydrationSafeReducedMotion();

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
      transition={{ duration: reduceMotion ? 0 : 0.2, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-wine/15 bg-cream/95 backdrop-blur-md"
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
          className="shrink-0 rounded px-1 font-serif text-lg tracking-[0.5px] text-wine transition-colors hover:text-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-wine md:text-xl"
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
                  className={`rounded-full px-3 py-1.5 text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-wine ${
                    isActive
                      ? "bg-petal font-medium text-wine"
                      : "text-wine hover:bg-petal hover:text-foreground"
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
            className="rounded-full border border-wine/30 px-3 py-1.5 text-xs font-medium tracking-wide text-wine focus:outline-none focus-visible:ring-2 focus-visible:ring-wine md:hidden"
            aria-expanded={isMenuOpen}
            aria-controls="garden-mobile-menu"
          >
            Menu
          </button>

          {isMenuOpen && (
            <div
              id="garden-mobile-menu"
              className="absolute right-0 top-full z-10 mt-2 w-48 rounded-sm border border-wine/20 bg-cream p-2 shadow-lg md:hidden"
            >
              {NAV_ITEMS.map((item) => {
                const isActive = currentSectionId === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateTo(item.id)}
                    className={`block w-full rounded-sm px-3 py-2 text-left text-sm transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-wine ${
                      isActive
                        ? "bg-petal font-medium text-wine"
                        : "text-wine hover:bg-petal hover:text-foreground"
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
          whileHover={reduceMotion ? undefined : { scale: 1.04 }}
          whileTap={reduceMotion ? undefined : { scale: 0.975 }}
          transition={
            reduceMotion
              ? undefined
              : { type: "spring", stiffness: 260, damping: 18 }
          }
          className="shrink-0 rounded-full bg-wine px-3.5 py-1 text-xs font-medium text-cream shadow-sm transition-colors hover:bg-foreground hover:text-cream focus:outline-none focus-visible:ring-2 focus-visible:ring-wine focus-visible:ring-offset-1 focus-visible:ring-offset-cream md:px-5 md:py-1.5 md:text-sm"
          aria-label="Scroll to RSVP"
        >
          RSVP
        </motion.button>
      </div>
    </motion.nav>
  );
}
