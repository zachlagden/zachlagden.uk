"use client";

import React from "react";
import { motion } from "framer-motion";

interface SkillCategoryProps {
  title: string;
  skills: string[];
  colorClass: string;
}

const SkillCategory: React.FC<SkillCategoryProps> = ({
  title,
  skills,
  colorClass,
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
  >
    <h3 className="text-lg font-medium mb-6">{title}</h3>
    <div
      className="flex flex-wrap gap-3"
      role="list"
      aria-label={`${title} skills`}
    >
      {skills.map((skill: string, index: number) => (
        <motion.span
          key={index}
          className={`rounded-full px-4 py-1.5 text-sm ${colorClass}`}
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          whileHover={{ y: -2, boxShadow: "0 4px 8px rgba(0, 0, 0, 0.05)" }}
          role="listitem"
        >
          {skill}
        </motion.span>
      ))}
    </div>
  </motion.div>
);

export default SkillCategory;
