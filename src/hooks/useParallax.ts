"use client";

import { useRef, useCallback, useSyncExternalStore } from "react";
import { useScroll, useTransform, MotionValue } from "framer-motion";

interface UseParallaxOptions {
  speed?: number;
}

interface UseParallaxReturn {
  ref: React.RefObject<HTMLElement | null>;
  y: MotionValue<number>;
  isReduced: boolean;
}

export default function useParallax({
  speed = 0.3,
}: UseParallaxOptions = {}): UseParallaxReturn {
  const ref = useRef<HTMLElement>(null);
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

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const y = useTransform(
    scrollYProgress,
    [0, 1],
    isReduced ? [0, 0] : [-100 * speed, 100 * speed],
  );

  return { ref, y, isReduced };
}
