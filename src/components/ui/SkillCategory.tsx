"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";

// Deterministic pseudo-random from a seed
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return x - Math.floor(x);
}

interface SkillCategoryProps {
  title: string;
  skills: string[];
  colorClass: string;
  delay?: number;
}

const SkillCategory: React.FC<SkillCategoryProps> = ({
  title,
  skills,
  colorClass,
  delay = 0,
}) => {
  const rotations = useMemo(
    () =>
      skills.map((skill, i) => {
        const seed =
          skill.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) + i;
        return (seededRandom(seed) - 0.5) * 4;
      }),
    [skills],
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
    >
      <h3 className="text-lg font-heading font-medium mb-6">{title}</h3>
      <div
        className="flex flex-wrap gap-3"
        role="list"
        aria-label={`${title} skills`}
      >
        {skills.map((skill: string, index: number) => (
          <motion.span
            key={index}
            className={`rounded-full px-4 py-1.5 text-sm ${colorClass} cursor-default`}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.3, delay: delay + index * 0.05 }}
            whileHover={{
              scale: 1.05,
              rotate: rotations[index],
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            }}
            role="listitem"
          >
            {skill}
          </motion.span>
        ))}
      </div>
    </motion.div>
  );
};

export default SkillCategory;
