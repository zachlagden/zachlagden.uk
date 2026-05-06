"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

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

    // Only show cursor after it's moved to prevent initial flash at [0,0]
    const onMouseEnter = () => setIsVisible(true);
    const onMouseLeave = () => setIsVisible(false);

    const updateMousePosition = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
      if (!isVisible) setIsVisible(true);
    };

    // Add listeners for cursor position and visibility
    window.addEventListener("mousemove", updateMousePosition);
    document.body.addEventListener("mouseenter", onMouseEnter);
    document.body.addEventListener("mouseleave", onMouseLeave);

    // Track interactive elements to change cursor style
    const handleMouseEnterInteractive = () => setCursorVariant("interactive");
    const handleMouseLeaveInteractive = () => setCursorVariant("default");

    // Elements that should trigger the interactive cursor
    const interactiveElements = document.querySelectorAll(
      'a, button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"])',
    );

    interactiveElements.forEach((el) => {
      el.addEventListener("mouseenter", handleMouseEnterInteractive);
      el.addEventListener("mouseleave", handleMouseLeaveInteractive);
    });

    return () => {
      window.removeEventListener("mousemove", updateMousePosition);
      document.body.removeEventListener("mouseenter", onMouseEnter);
      document.body.removeEventListener("mouseleave", onMouseLeave);

      interactiveElements.forEach((el) => {
        el.removeEventListener("mouseenter", handleMouseEnterInteractive);
        el.removeEventListener("mouseleave", handleMouseLeaveInteractive);
      });
    };
  }, [isVisible, prefersReducedMotion, isTouchDevice]);

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
