"use client";

import { useEffect, useState } from "react";

interface UseSectionObserverProps {
  sectionRefs: {
    [key: string]: React.RefObject<HTMLElement>;
  };
  setActiveSection: (sectionId: string) => void;
}

/**
 * Custom hook to observe sections and update active section based on scroll position
 */
const useSectionObserver = ({
  sectionRefs,
  setActiveSection,
}: UseSectionObserverProps) => {
  const [isClient, setIsClient] = useState(false);

  // Set client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    // Create IntersectionObserver only on client
    const observer = new IntersectionObserver(
      (entries) => {
        // Find the section with the highest intersection ratio
        let maxIntersection = 0;
        let activeId = "";

        entries.forEach((entry) => {
          if (
            entry.isIntersecting &&
            entry.intersectionRatio > maxIntersection
          ) {
            maxIntersection = entry.intersectionRatio;
            activeId = entry.target.id;
          }
        });

        if (activeId) {
          setActiveSection(activeId);
        }
      },
      {
        threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0],
        rootMargin: "-20% 0px -20% 0px",
      },
    );

    // Observe all section refs
    Object.values(sectionRefs).forEach((ref) => {
      if (ref.current) {
        observer.observe(ref.current);
      }
    });

    return () => {
      observer.disconnect();
    };
  }, [sectionRefs, setActiveSection, isClient]);
};

export default useSectionObserver;
