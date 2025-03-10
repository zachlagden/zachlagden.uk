import { scrollToSectionWithTransition } from "./viewTransition";

/**
 * Helper to scroll to a section with offset, using View Transitions API if available and Lenis for smoothness
 */
export const scrollToSection = (id: string): void => {
  const element = document.getElementById(id);
  if (!element) return;

  const offset = 100; // Adjust as needed

  // Use Lenis if available
  if (typeof window !== "undefined" && window.lenis) {
    try {
      window.lenis.scrollTo(element, {
        offset: -offset,
        immediate: false,
        duration: 0.8, // Shorter duration for more responsive feel
        lock: true, // Prevents manual scrolling during animation
      });
      return;
    } catch (error) {
      console.warn("Lenis scroll failed, falling back to default", error);
      // Fall through to default if lenis fails
    }
  }

  // Fall back to View Transitions API or standard scroll
  scrollToSectionWithTransition(id);
};

/**
 * Scroll to the top of the page with a smooth transition
 */
export const scrollToTop = (): void => {
  // Use Lenis if available
  if (typeof window !== "undefined" && window.lenis) {
    try {
      window.lenis.scrollTo(0, {
        immediate: false,
        duration: 0.8,
        lock: true,
      });
      return;
    } catch (error) {
      console.warn(
        "Lenis scroll to top failed, falling back to default",
        error,
      );
      // Fall through to default if lenis fails
    }
  }

  // Fall back to View Transitions API
  import("./viewTransition")
    .then(({ updateWithTransition }) => {
      updateWithTransition(() => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        return Promise.resolve();
      });
    })
    .catch(() => {
      // Fallback if import fails
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
};
