"use client";

import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  useRef,
  useSyncExternalStore,
} from "react";
import { motion } from "framer-motion";
import { sectionAnimation } from "@/utils/animationUtils";
import { supportsViewTransitions } from "@/utils/viewTransition";
import useParallax from "@/hooks/useParallax";

// Deterministic pseudo-random from a seed — same seed always gives same result.
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

// One background word roughly every INTERVAL px of section height.
const SCATTER_INTERVAL = 200;

const SCATTER_SIZES = [
  "text-6xl md:text-8xl",
  "text-7xl md:text-9xl",
  "text-8xl md:text-[10rem]",
];

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  sectionIndex?: number;
  backgroundTitle?: string;
  disableParallax?: boolean;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  (
    {
      id,
      title,
      icon,
      children,
      sectionIndex,
      backgroundTitle,
      disableParallax = false,
    },
    ref,
  ) => {
    const subscribeNoop = useCallback(() => () => {}, []);
    const getSupportsTransitions = useCallback(
      () => supportsViewTransitions(),
      [],
    );
    const getSupportsTransitionsServer = useCallback(() => false, []);
    const supportsTransitions = useSyncExternalStore(
      subscribeNoop,
      getSupportsTransitions,
      getSupportsTransitionsServer,
    );
    const { ref: parallaxRef, y: parallaxY } = useParallax({ speed: 0.15 });
    const internalRef = useRef<HTMLElement>(null);
    const [sectionHeight, setSectionHeight] = useState(0);

    // Merge the forwarded ref with our internal ref for measurement
    const setRefs = useCallback(
      (node: HTMLElement | null) => {
        internalRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [ref],
    );

    // Observe section height so we can scale scatter count to match
    useEffect(() => {
      const el = internalRef.current;
      if (!el) return;
      const observer = new ResizeObserver((entries) => {
        setSectionHeight(entries[0].contentRect.height);
      });
      observer.observe(el);
      return () => observer.disconnect();
    }, []);

    const displayNumber =
      sectionIndex !== undefined
        ? String(sectionIndex + 1).padStart(2, "0")
        : undefined;

    const bgTitle = backgroundTitle || title;

    // Deterministic seed derived from section id — never changes between reloads
    const sectionSeed = useMemo(
      () => id.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0),
      [id],
    );

    // Generate scatter items at consistent density based on measured height.
    // Each item's position is in px from the top, so existing items don't shift
    // when content is added — new items just appear further down.
    const scatterItems = useMemo(() => {
      if (sectionHeight === 0) return [];

      const count = Math.max(2, Math.floor(sectionHeight / SCATTER_INTERVAL));
      const items = [];

      for (let i = 0; i < count; i++) {
        const seed = sectionSeed * 100 + i;
        // Vertical: evenly spaced with some jitter
        const topPx =
          i * SCATTER_INTERVAL + seededRandom(seed) * SCATTER_INTERVAL * 0.5;
        // Horizontal: -80% to +80% so you see different parts of the word
        const left = seededRandom(seed + 1) * 160 - 80;
        // Rotation: ±8 degrees
        const rotate = (seededRandom(seed + 2) - 0.5) * 16;
        // Size: pick from 3 options
        const sizeIdx = Math.floor(
          seededRandom(seed + 3) * SCATTER_SIZES.length,
        );

        items.push({
          top: topPx,
          left,
          rotate,
          sizeClass: SCATTER_SIZES[sizeIdx],
        });
      }

      return items;
    }, [sectionHeight, sectionSeed]);

    return (
      <section
        id={id}
        ref={setRefs}
        className="py-24 md:py-32 scroll-mt-24 relative overflow-hidden"
        data-section-id={id}
      >
        {/* Scattered background title repetitions */}
        <motion.div
          ref={parallaxRef as React.RefObject<HTMLDivElement>}
          className="absolute inset-0 select-none pointer-events-none z-0"
          style={disableParallax ? undefined : { y: parallaxY }}
          aria-hidden="true"
        >
          {scatterItems.map((item, i) => (
            <span
              key={i}
              className={`absolute font-heading font-extrabold uppercase text-neutral-900/[0.03] leading-none whitespace-nowrap ${item.sizeClass}`}
              style={{
                top: `${item.top}px`,
                left: `${item.left}%`,
                transform: `rotate(${item.rotate}deg)`,
              }}
            >
              {bgTitle}
            </span>
          ))}
        </motion.div>

        {/* Section number */}
        {displayNumber && (
          <div
            className="absolute top-6 right-4 font-mono-accent text-sm text-neutral-300 select-none pointer-events-none z-0"
            aria-hidden="true"
          >
            {displayNumber}
          </div>
        )}

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionAnimation}
          className="mb-12 relative z-10"
          style={
            supportsTransitions
              ? { viewTransitionName: `section-header-${id}` }
              : undefined
          }
        >
          <div className="flex items-center gap-3">
            <div className="text-neutral-800">{icon}</div>
            <h2 className="text-2xl font-heading font-bold tracking-tight">
              {title}
            </h2>
          </div>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={sectionAnimation}
          transition={{ delay: 0.2 }}
          className="relative z-10 section-content"
          style={
            supportsTransitions
              ? { viewTransitionName: `section-content-${id}` }
              : undefined
          }
        >
          {children}
        </motion.div>
      </section>
    );
  },
);

Section.displayName = "Section";

export default Section;
