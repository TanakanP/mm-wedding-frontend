/**
 * Single source of truth for nav height / scroll offset.
 * Keep in sync with --nav-offset in globals.css.
 */
export const NAV_SCROLL_OFFSET = 68;

export const GARDEN_SLIDER_ID = "garden-slider";

export function getGardenSlider(): HTMLElement | null {
  if (typeof document === "undefined") return null;
  return document.getElementById(GARDEN_SLIDER_ID);
}

function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function scrollToSection(sectionId: string, offset = NAV_SCROLL_OFFSET) {
  const slider = getGardenSlider();
  const el = document.getElementById(sectionId);
  if (!slider || !el) {
    console.warn(`[scrollToSection] Slider or element "${sectionId}" not found`);
    return;
  }

  const sliderTop = slider.getBoundingClientRect().top;
  const elTop = el.getBoundingClientRect().top;
  const y = slider.scrollTop + (elTop - sliderTop) - offset;

  slider.scrollTo({
    top: Math.max(0, y),
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}

export function scrollSliderToTop() {
  const slider = getGardenSlider();
  if (!slider) return;

  slider.scrollTo({
    top: 0,
    behavior: prefersReducedMotion() ? "auto" : "smooth",
  });
}