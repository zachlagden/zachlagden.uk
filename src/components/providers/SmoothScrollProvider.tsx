"use client";

import React, { useEffect, useState } from "react";
import Lenis from "@studio-freight/lenis";

// Define types for window with lenis
declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export default function SmoothScrollProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [lenis, setLenis] = useState<Lenis | null>(null);

  useEffect(() => {
    // Check if this is running on the client
    if (typeof window === "undefined") return;

    // Skip initialization in these cases:
    // 1. Touch device - use native scrolling
    // 2. If user prefers reduced motion - respect accessibility settings
    if (
      navigator.maxTouchPoints > 0 ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const lenisInstance = new Lenis({
      duration: 0.8,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: "vertical",
      wheelMultiplier: 1,
      smoothWheel: true,
      touchMultiplier: 2,
    });

    // Handle accessibility preference changes
    const prefersReducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const handleReducedMotionChange = () => {
      if (prefersReducedMotionQuery.matches) {
        // Destroy Lenis if user enables reduced motion
        lenisInstance.destroy();
        setLenis(null);
      } else {
        // Re-enable smooth scrolling if user disables reduced motion
        lenisInstance.start();
        setLenis(lenisInstance);
      }
    };
    prefersReducedMotionQuery.addEventListener(
      "change",
      handleReducedMotionChange,
    );

    // Properly handle window resize events
    const handleResize = () => {
      lenisInstance.resize();
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    function raf(time: number) {
      lenisInstance.raf(time);
      requestAnimationFrame(raf);
    }

    const animationId = requestAnimationFrame(raf);
    setLenis(lenisInstance);

    return () => {
      prefersReducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationId);
      lenisInstance.destroy();
    };
  }, []);

  // Allow accessing lenis instance from window for debugging in dev
  useEffect(() => {
    if (lenis && typeof window !== "undefined") {
      window.lenis = lenis;
    }
  }, [lenis]);

  return <>{children}</>;
}
