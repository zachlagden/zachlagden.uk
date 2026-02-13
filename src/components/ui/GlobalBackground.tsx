"use client";

import React from "react";
import { motion } from "framer-motion";

interface GlobalBackgroundProps {
  opacity?: number;
}

const GlobalBackground: React.FC<GlobalBackgroundProps> = ({
  opacity = 0.02,
}) => {
  return (
    <motion.div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden text-neutral-900"
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      transition={{ duration: 1.5 }}
      aria-hidden="true"
    >
      <svg
        width="100%"
        height="100%"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute inset-0"
      >
        <defs>
          <pattern
            id="subtle-grid"
            x="0"
            y="0"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="0.5"
              strokeOpacity="0.3"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#subtle-grid)" />
      </svg>
    </motion.div>
  );
};

export default GlobalBackground;
