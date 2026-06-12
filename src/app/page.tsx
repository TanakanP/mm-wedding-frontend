"use client";

import HeroSection from "@/components/HeroSection";
import OurStory from "@/components/OurStory";
import EventDetails from "@/components/EventDetails";
import FAQSection from "@/components/FAQSection";
import GardenNav from "@/components/GardenNav";

export default function Home() {
  return (
    <>
      <GardenNav />
      <main className="flex min-h-screen flex-col items-center justify-between">
        <HeroSection />
        <OurStory />
        <EventDetails />
        <FAQSection />
      </main>

      {/* Poetic footer with palette + subtle garden texture. Links are minimal (one anchored) to stay lightweight. */}
      <footer className="w-full py-12 bg-cream garden-texture border-t border-sage/15 text-center px-4">
        <div className="max-w-3xl mx-auto">
          <p className="text-sage/80 font-light tracking-wide text-sm">
            Planted with love • M &amp; M • 5 December 2026 • The Garden Hiroen
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1 text-xs text-sage/60">
            <a href="#garden-whispers" className="hover:text-accent-primary transition-colors">Garden Whispers</a>
            <span aria-hidden="true">•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className="hover:text-accent-primary transition-colors focus:outline-none focus-visible:underline"
            >
              Back to the top
            </button>
            <span aria-hidden="true">•</span>
            <span className="text-sage/50">Wander the garden above to RSVP and plant wishes</span>
          </div>
          <p className="mt-4 text-[10px] text-sage/40">© The Garden Hiroen — all are welcome in spirit</p>
        </div>
      </footer>
    </>
  );
}
