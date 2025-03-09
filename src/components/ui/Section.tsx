"use client";

import React from "react";
import { motion } from "framer-motion";

interface SectionProps {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}

const Section = React.forwardRef<HTMLElement, SectionProps>(
  ({ id, title, icon, children }, ref) => (
    <section id={id} ref={ref} className="py-16 md:py-24 scroll-mt-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <div className="flex items-center gap-3">
          <div className="text-neutral-800">{icon}</div>
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <div className="mt-2 h-px w-16 bg-neutral-800" aria-hidden="true" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {children}
      </motion.div>
    </section>
  ),
);

Section.displayName = "Section";

export default Section;
