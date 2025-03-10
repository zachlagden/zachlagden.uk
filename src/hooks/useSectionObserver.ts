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
  }, [sectionRefs, setActiveSection, isClient]);
};

export default useSectionObserver;
