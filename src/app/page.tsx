"use client";

import FAQSection from "@/components/FAQSection";
import GardenNav from "@/components/GardenNav";
import InvitationIntro from "@/components/InvitationIntro";
import DressCodeChapter from "@/components/v4/DressCodeChapter";
import FamilyChapter from "@/components/v4/FamilyChapter";
import FinalImageChapter from "@/components/v4/FinalImageChapter";
import FramedPhotoChapter from "@/components/v4/FramedPhotoChapter";
import GalleryChapter from "@/components/v4/GalleryChapter";
import LocationChapter from "@/components/v4/LocationChapter";
import OpeningChapter from "@/components/v4/OpeningChapter";
import RSVPChapter from "@/components/v4/RSVPChapter";
import ScheduleChapter from "@/components/v4/ScheduleChapter";
import { SectionsProvider } from "@/hooks/useSections";

export default function Home() {
  return (
    <SectionsProvider>
      <InvitationIntro />
      <div id="wedding-page">
        <GardenNav />
        <main className="overflow-x-clip bg-cream">
          <OpeningChapter />
          <FamilyChapter />
          <FramedPhotoChapter />
          <DressCodeChapter />
          <ScheduleChapter />
          <GalleryChapter />
          <LocationChapter />
          <FinalImageChapter />
          <RSVPChapter>
            <FAQSection />
          </RSVPChapter>
        </main>
      </div>
    </SectionsProvider>
  );
}
