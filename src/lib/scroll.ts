function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

export function scrollToSection(sectionId: string) {
  if (typeof document === "undefined") return;

  const element = document.getElementById(sectionId);
  if (!element) {
    console.warn(`[scrollToSection] Element "${sectionId}" not found`);
    return;
  }

  element.scrollIntoView({
    behavior: scrollBehavior(),
    block: "start",
  });
}

export function scrollToTop() {
  if (typeof window === "undefined") return;

  window.scrollTo({
    top: 0,
    behavior: scrollBehavior(),
  });
}
