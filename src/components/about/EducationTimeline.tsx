"use client";

import React from "react";
import { motion } from "framer-motion";
import type { SerializedEducation } from "@/models/SiteContent";

interface EducationTimelineProps {
  entries: SerializedEducation[];
}

export default function EducationTimeline({ entries }: EducationTimelineProps) {
  return (
    <section className="py-24 sm:py-32">
      <motion.h2
        className="font-heading text-3xl font-semibold text-text-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Education
      </motion.h2>

      <div className="mt-10 space-y-0">
        {entries.map((entry, index) => (
          <motion.div
            key={entry._id}
            className="relative border-l-2 border-cyan-500/40 py-6 pl-8 first:pt-0 last:pb-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut",
            }}
          >
            {/* Timeline dot */}
            <div
              className="absolute -left-[7px] top-6 h-3 w-3 rounded-full border-2 border-cyan-500 bg-[#0a0a0a] first:top-0"
              aria-hidden="true"
            />

            <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-cyan-500/20">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
                <h3 className="font-heading text-lg font-medium text-zinc-100">
                  {entry.institution}
                </h3>
                <span className="font-mono text-sm text-zinc-500">
                  {entry.dateRange}
                </span>
              </div>

              <p className="mt-1 text-sm font-medium text-cyan-500">
                {entry.degree}
              </p>

              {entry.description && (
                <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                  {entry.description}
                </p>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
