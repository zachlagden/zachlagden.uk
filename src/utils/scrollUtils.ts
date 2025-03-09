/**
 * Helper to scroll to a section with offset
 */
export const scrollToSection = (id: string): void => {
  const element = document.getElementById(id);
  if (!element) return;

  const offset = 100; // Adjust as needed
  const bodyRect = document.body.getBoundingClientRect().top;
  const elementRect = element.getBoundingClientRect().top;
  const elementPosition = elementRect - bodyRect;
  const offsetPosition = elementPosition - offset;

  window.scrollTo({
    top: offsetPosition,
    behavior: "smooth",
  });
};

/**
 * Scroll to the top of the page
 */
export const scrollToTop = (): void => {
  window.scrollTo({ top: 0, behavior: "smooth" });
};
