"use client";

import HeroSection from "@/components/HeroSection";
import OurStory from "@/components/OurStory";
import EventDetails from "@/components/EventDetails";
import FAQSection from "@/components/FAQSection";
import GardenNav from "@/components/GardenNav";
import { SectionsProvider } from "@/hooks/useSections";

export default function Home() {
  return (
    <SectionsProvider>
      <GardenNav />
      <main className="overflow-x-clip bg-cream">
        <HeroSection />
        <OurStory />
        <EventDetails />
        <FAQSection />
      </main>
    </SectionsProvider>
  );
}
