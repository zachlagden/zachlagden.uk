"use client";

import React from "react";
import { motion } from "framer-motion";

interface NoiseTextureProps {
  opacity?: number;
  blend?: "overlay" | "multiply" | "screen" | "normal";
  className?: string;
}

// Generate a noise SVG for rich texture
const NoiseTexture: React.FC<NoiseTextureProps> = ({
  opacity = 0.035,
  blend = "normal",
  className = "",
}) => {
  return (
    <motion.div
      className={`fixed inset-0 pointer-events-none z-10 ${className}`}
      style={{
        opacity,
        mixBlendMode: blend,
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity }}
      aria-hidden="true"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%">
        <filter id="noise">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.65"
            numOctaves="3"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise)" />
      </svg>
    </motion.div>
  );
};

export default NoiseTexture;
