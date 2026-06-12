"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Leaf, Flower } from "lucide-react";

export default function GardenNav() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show after scrolling past the hero section (~full viewport height)
      setIsVisible(window.scrollY > 620);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // initial state
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (label: string) => {
    const headings = Array.from(document.querySelectorAll("h2"));
    const target = headings.find((h) => {
      const txt = (h.textContent || "").toLowerCase();
      if (label.toLowerCase().includes("our story")) return txt.includes("our story");
      if (label.toLowerCase().includes("garden path")) return txt.includes("when & where") || txt.includes("garden path");
      if (label.toLowerCase().includes("wishes")) return txt.includes("when & where");
      if (label.toLowerCase().includes("whispers")) return txt.includes("garden whispers");
      return false;
    });

    if (!target && label.toLowerCase().includes("whispers")) {
      const el = document.getElementById("garden-whispers");
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
        return;
      }
    }

    if (target) {
      const offset = 68; // account for sticky nav height
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      // gentle fallback
      window.scrollTo({ top: 1100, behavior: "smooth" });
    }
  };

  const handleRSVPClick = () => {
    // Scroll to the Event Details / When & Where area (hosts the RSVP trigger and leads to wishes)
    const headings = Array.from(document.querySelectorAll("h2"));
    const target = headings.find((h) => (h.textContent || "").toLowerCase().includes("when & where"));
    if (target) {
      const offset = 68;
      const y = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top: y, behavior: "smooth" });
    } else {
      window.scrollTo({ top: 1100, behavior: "smooth" });
    }
  };

  return (
    <motion.nav
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: isVisible ? 1 : 0, y: isVisible ? 0 : -10 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="fixed top-0 left-0 right-0 z-40 bg-cream/95 backdrop-blur-md border-b border-sage/15 pointer-events-none"
      aria-label="Primary garden navigation"
      style={{ pointerEvents: isVisible ? "auto" : "none" }}
    >
      <div className="max-w-5xl mx-auto px-3 md:px-6 h-12 md:h-14 flex items-center justify-between text-sm">
        {/* Small M & M logo (Playfair) — gold on hover */}
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-serif text-lg md:text-xl tracking-[0.5px] text-foreground/80 hover:text-accent-primary transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/50 rounded px-1 shrink-0"
          aria-label="Scroll to top"
        >
          M &amp; M
        </button>

        {/* Flower icon links with smooth scroll (icons only on smallest screens for space) */}
        <div className="flex items-center gap-x-0.5 text-foreground/70 overflow-x-auto -mx-1 px-1">
          {[
            { label: "Our Story", icon: Leaf },
            { label: "The Garden Path", icon: Flower },
            { label: "Plant Your Wishes", icon: Leaf },
            { label: "Garden Whispers", icon: Flower },
          ].map(({ label, icon: Icon }, idx) => (
            <button
              key={idx}
              onClick={() => scrollToSection(label)}
              className="group flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] md:text-sm hover:bg-background/60 hover:text-foreground transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-primary/40 whitespace-nowrap"
              aria-label={`Scroll to ${label}`}
            >
              <Icon className="w-3.5 h-3.5 text-accent-secondary/80 group-hover:text-accent-secondary transition-colors" />
              <span className="hidden sm:inline tracking-tight">
                {label === "The Garden Path" ? "Garden Path" : label}
              </span>
            </button>
          ))}
        </div>

        {/* Warm Gold RSVP button — blooms (subtle scale) on hover */}
        <motion.button
          onClick={handleRSVPClick}
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.975 }}
          transition={{ type: "spring", stiffness: 260, damping: 18 }}
          className="bg-accent-primary text-white text-xs md:text-sm font-medium px-3.5 md:px-5 py-1 md:py-1.5 rounded-full shadow-sm hover:bg-foreground transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-offset-cream focus-visible:ring-accent-primary/70 flex items-center gap-1 shrink-0"
          aria-label="Scroll to RSVP"
        >
          RSVP
          <span aria-hidden="true" className="text-[9px] opacity-80">✿</span>
        </motion.button>
      </div>
    </motion.nav>
  );
}
