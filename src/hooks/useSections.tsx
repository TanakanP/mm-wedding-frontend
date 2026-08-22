"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  scrollToSection,
  scrollToTop,
  updateSectionVisibility,
} from "@/lib/scroll";
import { SECTION_IDS, type SectionId } from "@/content/wedding";

const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Opening invitation",
  families: "Together with our families",
  "framed-photo": "Framed memory",
  "dress-code": "Dress code",
  schedule: "Schedule",
  gallery: "Photo gallery",
  venue: "Location",
  "final-image": "Final memory",
  rsvp: "RSVP",
  "garden-whispers": "Frequently asked questions",
};

interface SectionsContextValue {
  currentSectionId: SectionId;
  sections: readonly SectionId[];
  scrollTo: (id: SectionId) => void;
  scrollToTop: () => void;
}

const SectionsContext = createContext<SectionsContextValue | null>(null);

function getSectionElements(): HTMLElement[] {
  return SECTION_IDS.map((id) => document.getElementById(id)).filter(
    (el): el is HTMLElement => Boolean(el)
  );
}

export function SectionsProvider({ children }: { children: ReactNode }) {
  const [currentSectionId, setCurrentSectionId] =
    useState<SectionId>(SECTION_IDS[0]);

  const scrollTo = useCallback((id: SectionId) => {
    scrollToSection(id);
  }, []);

  // Track the visible document section.
  useEffect(() => {
    const sections = getSectionElements();
    if (sections.length === 0) return;
    const visibilityById = new Map(sections.map((section) => [section.id, 0]));

    const observer = new IntersectionObserver(
      (entries) => {
        const id = updateSectionVisibility(
          visibilityById,
          entries
        ) as SectionId | undefined;
        if (id && SECTION_IDS.includes(id as SectionId)) {
          setCurrentSectionId(id as SectionId);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -40% 0px",
        threshold: [0.1, 0.25, 0.5, 0.75],
      }
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  const announcement = `Now viewing ${SECTION_LABELS[currentSectionId]}`;

  const value: SectionsContextValue = {
    currentSectionId,
    sections: SECTION_IDS,
    scrollTo,
    scrollToTop,
  };

  return (
    <SectionsContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </SectionsContext.Provider>
  );
}

export function useSections(): SectionsContextValue {
  const ctx = useContext(SectionsContext);
  if (!ctx) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(
        "[useSections] Hook used outside SectionsProvider. Using no-op fallback."
      );
    }
    return {
      currentSectionId: SECTION_IDS[0],
      sections: SECTION_IDS,
      scrollTo: (id) => scrollToSection(id),
      scrollToTop,
    };
  }
  return ctx;
}
