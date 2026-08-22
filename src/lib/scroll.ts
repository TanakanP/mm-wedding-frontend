function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

export function updateSectionVisibility(
  visibilityById: Map<string, number>,
  entries: readonly Pick<
    IntersectionObserverEntry,
    "intersectionRatio" | "isIntersecting" | "target"
  >[]
) {
  for (const entry of entries) {
    const id = entry.target.id;
    if (visibilityById.has(id)) {
      visibilityById.set(
        id,
        entry.isIntersecting ? entry.intersectionRatio : 0
      );
    }
  }

  let bestId: string | undefined;
  let bestRatio = 0;
  for (const [id, ratio] of visibilityById) {
    if (ratio > bestRatio) {
      bestId = id;
      bestRatio = ratio;
    }
  }
  return bestId;
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

export function jumpToTop() {
  if (typeof window === "undefined") return;

  const root = document.documentElement;
  const previousBehavior = root.style.scrollBehavior;
  root.style.scrollBehavior = "auto";
  window.scrollTo({ top: 0, behavior: "auto" });
  root.style.scrollBehavior = previousBehavior;
}

export function lockDocumentScroll() {
  const rootOverflow = document.documentElement.style.overflow;
  const bodyOverflow = document.body.style.overflow;

  document.documentElement.style.overflow = "hidden";
  document.body.style.overflow = "hidden";

  return () => {
    document.documentElement.style.overflow = rootOverflow;
    document.body.style.overflow = bodyOverflow;
  };
}
