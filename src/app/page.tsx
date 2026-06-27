"use client";

import HeroSection from "@/components/HeroSection";
import OurStory from "@/components/OurStory";
import EventDetails from "@/components/EventDetails";
import FAQSection from "@/components/FAQSection";
import GardenNav from "@/components/GardenNav";
import { SectionsProvider, GardenSlider } from "@/hooks/useSections";

export default function Home() {
  return (
    <SectionsProvider>
      <div className="garden-app">
        <GardenNav />
        <GardenSlider>
          <HeroSection />
          <OurStory />
          <EventDetails />
          <FAQSection />
        </GardenSlider>
      </div>
    </SectionsProvider>
  );
}