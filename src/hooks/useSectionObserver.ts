"use client";

import { useEffect } from "react";

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
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { threshold: 0.5 },
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
  }, [sectionRefs, setActiveSection]);
};

export default useSectionObserver;
