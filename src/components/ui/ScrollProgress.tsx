"use client";

import React from "react";
import { motion, useScroll, useSpring } from "framer-motion";

interface ScrollProgressProps {
  height?: number;
  zIndex?: number;
}

const ScrollProgress: React.FC<ScrollProgressProps> = ({
  height = 2,
  zIndex = 100,
}) => {
  const { scrollYProgress } = useScroll();

  // Add spring physics for a more premium feel
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="fixed top-0 left-0 right-0 origin-left bg-neutral-900/80"
      style={{
        scaleX,
        height,
        zIndex,
        transformOrigin: "left",
      }}
    />
  );
};

export default ScrollProgress;
