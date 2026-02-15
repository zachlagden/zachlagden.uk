function getScrollBehavior(): ScrollBehavior {
  if (typeof window === "undefined") return "smooth";
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ? "auto"
    : "smooth";
}

/**
 * Scroll to a section by ID using native scrollIntoView.
 * Sections should have scroll-margin-top set in CSS to account for the sticky nav.
 */
export const scrollToSection = (id: string): void => {
  if (typeof document === "undefined") return;

  const element = document.getElementById(id);
  if (!element) return;

  element.scrollIntoView({ behavior: getScrollBehavior(), block: "start" });
};

/**
 * Scroll to the top of the page
 */
export const scrollToTop = (): void => {
  if (typeof window === "undefined") return;
  window.scrollTo({ top: 0, behavior: getScrollBehavior() });
};
