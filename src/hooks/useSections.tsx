"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  scrollToSection,
  scrollSliderToTop,
  NAV_SCROLL_OFFSET,
  GARDEN_SLIDER_ID,
} from "@/lib/scroll";

/**
 * Ordered list of chapter/section IDs for the garden walk experience.
 * Add/remove here (and ensure corresponding <section id="..."> exists) to extend.
 */
export const SECTION_IDS = [
  "hero",
  "our-story",
  "garden-path",
  "garden-whispers",
] as const;

export type SectionId = (typeof SECTION_IDS)[number];

/** Friendly labels for announcements and UI. */
const SECTION_LABELS: Record<SectionId, string> = {
  hero: "Hero",
  "our-story": "Our Story",
  "garden-path": "The Garden Path",
  "garden-whispers": "Garden Whispers",
};

interface SectionsContextValue {
  currentSectionId: SectionId | null;
  sections: readonly SectionId[];
  scrollTo: (id: SectionId) => void;
  scrollToTop: () => void;
  sliderRef: React.RefObject<HTMLElement | null>;
  sliderReady: boolean;
}

const SectionsContext = createContext<SectionsContextValue | null>(null);

function getSectionElements(): HTMLElement[] {
  return SECTION_IDS.map((id) => document.getElementById(id)).filter(
    (el): el is HTMLElement => Boolean(el)
  );
}

export function SectionsProvider({ children }: { children: ReactNode }) {
  const [currentSectionId, setCurrentSectionId] = useState<SectionId | null>(null);
  const [announcement, setAnnouncement] = useState("");
  const sliderRef = useRef<HTMLElement | null>(null);
  const [sliderReady, setSliderReady] = useState(false);

  const scrollTo = useCallback((id: SectionId) => {
    scrollToSection(id);
  }, []);

  const scrollToTop = useCallback(() => {
    scrollSliderToTop();
  }, []);

  // Track active section via IntersectionObserver rooted on the snap container
  useEffect(() => {
    const slider = sliderRef.current;
    if (!sliderReady || !slider) return;

    const sections = getSectionElements();
    if (sections.length === 0) return;

    // Seed initial chapter before observer callbacks fire
    setCurrentSectionId(SECTION_IDS[0]);

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (!best || entry.intersectionRatio > best.intersectionRatio) {
              best = entry;
            }
          }
        }

        if (best?.target?.id) {
          const id = best.target.id as SectionId;
          if (SECTION_IDS.includes(id)) {
            setCurrentSectionId(id);
          }
        }
      },
      {
        root: slider,
        rootMargin: `-${NAV_SCROLL_OFFSET}px 0px -40% 0px`,
        threshold: [0.1, 0.2, 0.25, 0.5, 0.75, 0.9],
      }
    );

    sections.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, [sliderReady]);

  // Keyboard navigation between chapters
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "INPUT" ||
          active.tagName === "TEXTAREA" ||
          active.tagName === "SELECT" ||
          (active as HTMLElement).isContentEditable)
      ) {
        return;
      }

      const idx = currentSectionId ? SECTION_IDS.indexOf(currentSectionId) : -1;
      if (idx === -1) return;

      let target: SectionId | null = null;

      if (["ArrowDown", "PageDown", " "].includes(e.key)) {
        if (idx < SECTION_IDS.length - 1) target = SECTION_IDS[idx + 1];
        e.preventDefault();
      } else if (["ArrowUp", "PageUp"].includes(e.key)) {
        if (idx > 0) target = SECTION_IDS[idx - 1];
        e.preventDefault();
      }

      if (target) {
        scrollTo(target);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentSectionId, scrollTo]);

  // Announce section changes for screen readers
  useEffect(() => {
    if (!currentSectionId) return;
    const label = SECTION_LABELS[currentSectionId];
    setAnnouncement(`Now viewing ${label}`);

    const t = setTimeout(() => setAnnouncement(""), 1200);
    return () => clearTimeout(t);
  }, [currentSectionId]);

  const value: SectionsContextValue = {
    currentSectionId,
    sections: SECTION_IDS,
    scrollTo,
    scrollToTop,
    sliderRef,
    sliderReady,
  };

  const notifySliderMounted = useCallback(() => {
    setSliderReady(true);
  }, []);

  const contextValue: SectionsContextValue & { notifySliderMounted: () => void } = {
    ...value,
    notifySliderMounted,
  };

  return (
    <SectionsContext.Provider value={contextValue}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>
    </SectionsContext.Provider>
  );
}

export function GardenSlider({ children }: { children: ReactNode }) {
  const ctx = useContext(SectionsContext) as SectionsContextValue & {
    notifySliderMounted?: () => void;
  } | null;

  return (
    <main
      id={GARDEN_SLIDER_ID}
      ref={(node) => {
        if (ctx?.sliderRef) {
          ctx.sliderRef.current = node;
        }
        if (node) ctx?.notifySliderMounted?.();
      }}
      className="garden-slider"
    >
      {children}
    </main>
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
      currentSectionId: null,
      sections: SECTION_IDS,
      scrollTo: (id) => scrollToSection(id),
      scrollToTop: () => scrollSliderToTop(),
      sliderRef: { current: null },
      sliderReady: false,
    };
  }
  return ctx;
}