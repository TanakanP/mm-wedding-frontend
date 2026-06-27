import { scrollToSection, NAV_SCROLL_OFFSET } from "@/lib/scroll";

export function useScrollToSection() {
  return (sectionId: string, offset = NAV_SCROLL_OFFSET) => {
    scrollToSection(sectionId, offset);
  };
}

// Re-export for convenience when consuming sections
export { NAV_SCROLL_OFFSET } from "@/lib/scroll";
