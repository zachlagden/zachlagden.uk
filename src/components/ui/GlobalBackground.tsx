"use client";

import React, { useCallback, useSyncExternalStore } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const GlobalBackground: React.FC = () => {
  const subscribeReducedMotion = useCallback((callback: () => void) => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    mq.addEventListener("change", callback);
    return () => mq.removeEventListener("change", callback);
  }, []);
  const getIsReduced = useCallback(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    [],
  );
  const getIsReducedServer = useCallback(() => false, []);
  const isReduced = useSyncExternalStore(
    subscribeReducedMotion,
    getIsReduced,
    getIsReducedServer,
  );

  const { scrollYProgress } = useScroll();
  const y1 = useTransform(
    scrollYProgress,
    [0, 1],
    isReduced ? [0, 0] : [0, -200],
  );
  const y2 = useTransform(
    scrollYProgress,
    [0, 1],
    isReduced ? [0, 0] : [0, -300],
  );
  const y3 = useTransform(
    scrollYProgress,
    [0, 1],
    isReduced ? [0, 0] : [0, -150],
  );

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Blue blob — top left */}
      <motion.div
        className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(59, 130, 246, 0.06) 0%, transparent 70%)",
          filter: "blur(80px)",
          y: y1,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      />

      {/* Purple blob — center right */}
      <motion.div
        className="absolute top-1/3 -right-1/4 w-[50vw] h-[50vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(147, 51, 234, 0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
          y: y2,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.3 }}
      />

      {/* Cyan blob — bottom left */}
      <motion.div
        className="absolute top-2/3 -left-1/6 w-[45vw] h-[45vw] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.05) 0%, transparent 70%)",
          filter: "blur(80px)",
          y: y3,
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2, delay: 0.6 }}
      />
    </div>
  );
};

export default GlobalBackground;
