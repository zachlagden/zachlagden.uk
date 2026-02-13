"use client";

import React from "react";
import { motion } from "framer-motion";
import type { SerializedSkillsFull } from "@/models/SiteContent";

interface SkillsGridProps {
  categories: SerializedSkillsFull[];
}

export default function SkillsGrid({ categories }: SkillsGridProps) {
  return (
    <section className="py-24 sm:py-32">
      <motion.h2
        className="font-heading text-3xl font-semibold text-text-primary"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        Skills
      </motion.h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category, index) => (
          <motion.div
            key={category._id}
            className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-cyan-500/20"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.5,
              delay: index * 0.1,
              ease: "easeOut",
            }}
          >
            <h3 className="font-heading text-base font-semibold text-zinc-100">
              {category.category}
            </h3>

            <div className="mt-4 flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
