import { scrollToSectionWithTransition } from "./viewTransition";

/**
 * Helper to scroll to a section with offset, using View Transitions API if available and Lenis for smoothness
 */
export const scrollToSection = (id: string): void => {
  if (typeof document === "undefined") return;
  
  const element = document.getElementById(id);
  if (!element) return;

  const offset = 100; // Adjust as needed
  
  // Check for reduced motion preference
  const prefersReducedMotion = typeof window !== "undefined" && 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Use Lenis if available and not reduced motion
  if (typeof window !== "undefined" && window.lenis && !prefersReducedMotion) {
    try {
      window.lenis.scrollTo(element, {
        offset: -offset,
        immediate: prefersReducedMotion,
        duration: 0.8, // Shorter duration for more responsive feel
        lock: true, // Prevents manual scrolling during animation
      });
      return;
    } catch {
      console.warn("Lenis scroll failed, falling back to default");
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
  if (typeof window === "undefined") return;
  
  // Check for reduced motion preference
  const prefersReducedMotion = 
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  
  // Use immediate scroll for reduced motion preference
  const immediate = prefersReducedMotion;
  
  // Use Lenis if available
  if (window.lenis && !prefersReducedMotion) {
    try {
      window.lenis.scrollTo(0, {
        immediate,
        duration: 0.8,
        lock: true,
      });
      return;
    } catch {
      console.warn("Lenis scroll to top failed, falling back to default");
      // Fall through to default if lenis fails
    }
  }

  // Fall back to View Transitions API or standard behavior
  const behavior = prefersReducedMotion ? "auto" : "smooth";
  
  // Try using View Transitions API
  try {
    import("./viewTransition")
      .then(({ updateWithTransition }) => {
        updateWithTransition(() => {
          window.scrollTo({ top: 0, behavior });
          return Promise.resolve();
        });
      })
      .catch(() => {
        // Fallback if import fails
        window.scrollTo({ top: 0, behavior });
      });
  } catch {
    // Final fallback
    window.scrollTo({ top: 0, behavior });
  }
};