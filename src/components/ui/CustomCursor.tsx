"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"])';

const CustomCursor: React.FC = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [cursorVariant, setCursorVariant] = useState("default");
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Check for touch device and reduced motion preference
    const checkDeviceAndPreferences = () => {
      setIsTouchDevice(
        window.matchMedia("(hover: none)").matches ||
          navigator.maxTouchPoints > 0,
      );
      setPrefersReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    };

    checkDeviceAndPreferences();

    // Listen for preference changes
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    const handleReducedMotionChange = () => {
      setPrefersReducedMotion(reducedMotionQuery.matches);
    };

    reducedMotionQuery.addEventListener("change", handleReducedMotionChange);

    return () => {
      reducedMotionQuery.removeEventListener(
        "change",
        handleReducedMotionChange,
      );
    };
  }, []);

  useEffect(() => {
    // Skip all cursor effects if user prefers reduced motion or on touch devices
    if (prefersReducedMotion || isTouchDevice) return;

    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      setIsVisible(true);
    };

    // Event delegation on body — handles dynamically-added interactive
    // elements (blog pagination, mobile menu, modals) without re-binding.
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (target?.closest(INTERACTIVE_SELECTOR)) {
        setCursorVariant("interactive");
      } else {
        setCursorVariant("default");
      }
    };

    window.addEventListener("mousemove", updateMousePosition);
    document.body.addEventListener("mouseenter", onMouseEnter);
    document.body.addEventListener("mouseleave", onMouseLeave);
    document.body.addEventListener("mouseover", handleMouseOver);

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.body.removeEventListener("mouseenter", onMouseEnter);
      document.body.removeEventListener("mouseleave", onMouseLeave);
      document.body.removeEventListener("mouseover", handleMouseOver);
    };
  }, [prefersReducedMotion, isTouchDevice]);

  // Cursor variant animations
  const variants = {
    default: {
      x: mousePosition.x - 6,
      y: mousePosition.y - 6,
      height: 12,
      width: 12,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      mixBlendMode: "difference" as const,
    },
    interactive: {
      x: mousePosition.x - 16,
      y: mousePosition.y - 16,
      height: 32,
      width: 32,
      backgroundColor: "rgba(255, 255, 255, 0.2)",
      border: "1px solid rgba(255, 255, 255, 0.5)",
      mixBlendMode: "normal" as const,
    },
  };

  // Don't render on touch devices or if user prefers reduced motion
  if (isTouchDevice || prefersReducedMotion) {
    return null;
  }

  return (
    <motion.div
      className="fixed top-0 left-0 rounded-full pointer-events-none z-50"
      style={{
        opacity: isVisible ? 1 : 0,
      }}
      animate={cursorVariant}
      variants={variants}
      transition={{
        type: "spring",
        mass: 0.1,
        stiffness: 700,
        damping: 30,
      }}
      aria-hidden="true" // Hide from screen readers as this is decorative
    />
  );
};

export default CustomCursor;
