/**
 * Utility for implementing the View Transitions API
 *
 * This provides a way to smoothly transition between UI states
 * with a fallback for browsers that don't support it.
 */

/**
 * Checks if the browser supports the View Transitions API
 */
export const supportsViewTransitions = (): boolean => {
  return "startViewTransition" in document;
};

/**
 * Type for View Transition result
 */
interface ViewTransitionResult {
  ready: Promise<void>;
  finished: Promise<void>;
  updateCallbackDone: Promise<void>;
  skipTransition: () => void;
}

/**
 * Type for DOM Document with View Transitions API
 */
type DocumentWithViewTransition = Document & {
  startViewTransition?: (
    callback: () => Promise<void> | void,
  ) => ViewTransitionResult;
};

/**
 * Updates the DOM with View Transitions API if supported,
 * otherwise falls back to regular DOM updates
 */
export const updateWithTransition = async (
  callback: () => Promise<void> | void,
): Promise<void> => {
  const doc = document as DocumentWithViewTransition;

  if (supportsViewTransitions() && doc.startViewTransition) {
    try {
      const transition = doc.startViewTransition(callback);
      await transition.finished;
    } catch (error) {
      console.error("View transition failed:", error);
      // Fall back to regular update
      await callback();
    }
  } else {
    // Fall back to regular update for browsers without support
    await callback();
  }
};

/**
 * Scrolls to a section with a smooth transition,
 * using View Transitions API if available
 */
export const scrollToSectionWithTransition = (id: string): void => {
  const element = document.getElementById(id);
  if (!element) return;

  const offset = 100; // Adjust as needed
  const bodyRect = document.body.getBoundingClientRect().top;
  const elementRect = element.getBoundingClientRect().top;
  const elementPosition = elementRect - bodyRect;
  const offsetPosition = elementPosition - offset;

  updateWithTransition(() => {
    window.scrollTo({
      top: offsetPosition,
      behavior: "smooth",
    });
    return Promise.resolve();
  });
};
