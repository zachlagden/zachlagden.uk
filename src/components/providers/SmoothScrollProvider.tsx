"use client";

import React, { useEffect, useState } from "react";

// Define types for Lenis
interface LenisInstance {
  raf: (time: number) => void;
  resize: () => void;
  destroy: () => void;
  scrollTo: (target: number | HTMLElement | string, options?: LenisScrollToOptions) => void;
}

interface LenisScrollToOptions {
  offset?: number;
  immediate?: boolean;
  duration?: number;
  lock?: boolean;
}

// Define types for window with lenis
declare global {
  interface Window {
    lenis?: LenisInstance;
  }
}

interface SmoothScrollProviderProps {
  children: React.ReactNode;
}

export default function SmoothScrollProvider({
  children,
}: SmoothScrollProviderProps) {
  const [isClient, setIsClient] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  // Wait for client-side execution
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Check for device capabilities and user preferences
  useEffect(() => {
    if (!isClient) return;

    const checkPrefersReducedMotion = () => {
      return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    };

    const checkIsTouchDevice = () => {
      return (
        window.matchMedia("(hover: none)").matches || 
        navigator.maxTouchPoints > 0
      );
    };

    setPrefersReducedMotion(checkPrefersReducedMotion());
    setIsTouchDevice(checkIsTouchDevice());

    // Listen for preference changes
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    );
    
    const handleReducedMotionChange = () => {
      setPrefersReducedMotion(checkPrefersReducedMotion());
    };
    
    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);
    
    return () => {
      reducedMotionQuery.removeEventListener("change", handleReducedMotionChange);
    };
  }, [isClient]);

  // Initialize and manage Lenis instance
  useEffect(() => {
    if (!isClient) return;
    
    // Skip initialization in these cases
    if (prefersReducedMotion || isTouchDevice) return;

    // Add the class to indicate Lenis is active
    document.documentElement.classList.add('lenis-smooth-scroll');

    let lenisInstance: LenisInstance | undefined;
    let animationId: number | undefined;

    // Dynamic import to ensure client-side only execution
    import("@studio-freight/lenis").then((LenisModule) => {
      try {
        lenisInstance = new LenisModule.default({
          duration: 0.8,
          easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
          orientation: "vertical",
          wheelMultiplier: 1,
          smoothWheel: true,
          touchMultiplier: 2,
        });

        function raf(time: number) {
          if (lenisInstance) {
            lenisInstance.raf(time);
            animationId = requestAnimationFrame(raf);
          }
        }

        animationId = requestAnimationFrame(raf);
        
        // Properly handle window resize events
        const handleResize = () => {
          if (lenisInstance) lenisInstance.resize();
        };
        
        window.addEventListener("resize", handleResize);
        
        // Make instance available globally for other components
        window.lenis = lenisInstance;

        return () => {
          window.removeEventListener("resize", handleResize);
          if (animationId) cancelAnimationFrame(animationId);
          if (lenisInstance) lenisInstance.destroy();
          window.lenis = undefined;
          document.documentElement.classList.remove('lenis-smooth-scroll');
        };
      } catch (err) {
        console.error("Failed to initialize smooth scrolling:", err);
        document.documentElement.classList.remove('lenis-smooth-scroll');
      }
    }).catch(err => {
      console.error("Failed to load Lenis:", err);
      document.documentElement.classList.remove('lenis-smooth-scroll');
    });

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
      if (lenisInstance) lenisInstance.destroy();
      window.lenis = undefined;
      document.documentElement.classList.remove('lenis-smooth-scroll');
    };
  }, [isClient, prefersReducedMotion, isTouchDevice]);

  return <>{children}</>;
}