"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { sectionAnimation } from "@/utils/animationUtils";
import { supportsViewTransitions } from "@/utils/viewTransition";

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ id, title, icon, children }, ref) => {
    const [supportsTransitions, setSupportsTransitions] = useState(false);

    // Check for View Transitions API support on client side
    useEffect(() => {
      setSupportsTransitions(supportsViewTransitions());
    }, []);

    return (
      <section
        id={id}
        ref={ref}
        className="py-16 md:py-24 scroll-mt-24 relative"
        data-section-id={id}
      >
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
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
          </div>
          <div className="mt-2 h-px w-16 bg-neutral-800" aria-hidden="true" />
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
