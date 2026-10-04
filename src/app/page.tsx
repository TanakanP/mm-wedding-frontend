"use client";

import { useEffect, useState } from "react";
import InvitationIntro from "@/components/InvitationIntro";
import DressCodeChapter from "@/components/v4/DressCodeChapter";
import FamilyChapter from "@/components/v4/FamilyChapter";
import FinalImageChapter from "@/components/v4/FinalImageChapter";
import FilmStripChapter from "@/components/v4/FilmStripChapter";
import GalleryChapter from "@/components/v4/GalleryChapter";
import LocationChapter from "@/components/v4/LocationChapter";
import OpeningChapter from "@/components/v4/OpeningChapter";
import RSVPChapter from "@/components/v4/RSVPChapter";
import ScheduleChapter from "@/components/v4/ScheduleChapter";
import { SectionsProvider } from "@/hooks/useSections";
import { jumpToTop } from "@/lib/scroll";

export default function Home() {
  const [invitationOpened, setInvitationOpened] = useState(false);

  useEffect(() => {
    const previousScrollRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = "manual";
    jumpToTop();

    return () => {
      window.history.scrollRestoration = previousScrollRestoration;
    };
  }, []);

  return (
    <SectionsProvider>
      <InvitationIntro onOpenChange={setInvitationOpened} />
      <div id="wedding-page">
        <main className="overflow-x-clip bg-cream">
          <OpeningChapter invitationOpened={invitationOpened} />
          <FamilyChapter />
          <DressCodeChapter />
          <FilmStripChapter />
          <ScheduleChapter />
          <GalleryChapter />
          <LocationChapter />
          <FinalImageChapter />
          <RSVPChapter />
        </main>
      </div>
    </SectionsProvider>
  );
}
