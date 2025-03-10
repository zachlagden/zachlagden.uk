"use client";

import { useEffect, useState } from "react";
import { scrollToSection } from "@/utils/scrollUtils";

interface UseKeyboardNavigationProps {
  sectionIds: string[];
  activeSection: string;
}

/**
 * Custom hook to handle keyboard navigation between sections
 */
const useKeyboardNavigation = ({
  sectionIds,
  activeSection,
}: UseKeyboardNavigationProps) => {
  const [isClient, setIsClient] = useState(false);

  // Set client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Only respond to keyboard shortcuts when not in input/textarea
      if (
        document.activeElement instanceof HTMLInputElement ||
        document.activeElement instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Arrow up/down navigation
      if (e.key === "ArrowDown" || e.key === "ArrowUp") {
        e.preventDefault();

        const currentIndex = sectionIds.indexOf(activeSection);
        let nextIndex;

        if (e.key === "ArrowDown") {
          nextIndex = Math.min(currentIndex + 1, sectionIds.length - 1);
        } else {
          nextIndex = Math.max(currentIndex - 1, 0);
        }

        if (nextIndex !== currentIndex) {
          scrollToSection(sectionIds[nextIndex]);
        }
      }

      // Number key navigation (1-9)
      if (/^[1-9]$/.test(e.key) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const numericIndex = parseInt(e.key, 10) - 1;
        if (numericIndex < sectionIds.length) {
          e.preventDefault();
          scrollToSection(sectionIds[numericIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [sectionIds, activeSection, isClient]);
};

export default useKeyboardNavigation;
