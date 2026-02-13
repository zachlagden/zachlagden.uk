"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";

interface SkillGroup {
  title: string;
  skills: string[];
  colorClass: string;
}

interface SkillsVisualizationProps {
  skillGroups: SkillGroup[];
}

const SkillsVisualization: React.FC<SkillsVisualizationProps> = ({
  skillGroups,
}) => {
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [hoveredSkill, setHoveredSkill] = useState<string | null>(null);

  // All skills combined for visualization
  const allSkills = skillGroups.flatMap((group) =>
    group.skills.map((skill) => ({
      name: skill,
      group: group.title,
      colorClass: group.colorClass,
    })),
  );

  return (
    <div className="space-y-8">
      {/* Category filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        {skillGroups.map((group) => (
          <motion.button
            key={group.title}
            onClick={() =>
              setActiveGroup(activeGroup === group.title ? null : group.title)
            }
            className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
              activeGroup === group.title
                ? group.colorClass
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.95 }}
          >
            {group.title}
          </motion.button>
        ))}
      </div>

      {/* Skills visualization */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3"
        layout
      >
        {allSkills
          .filter((skill) => !activeGroup || skill.group === activeGroup)
          .map((skill, index) => (
            <motion.div
              key={skill.name}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: 1,
                scale: hoveredSkill === skill.name ? 1.05 : 1,
                y: hoveredSkill === skill.name ? -5 : 0,
              }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{
                duration: 0.3,
                delay: index * 0.03,
                layout: { type: "spring", stiffness: 300, damping: 30 },
              }}
              className={`rounded-lg p-4 flex items-center justify-center h-24 ${skill.colorClass} cursor-pointer`}
              onMouseEnter={() => setHoveredSkill(skill.name)}
              onMouseLeave={() => setHoveredSkill(null)}
              role="listitem"
            >
              <span className="text-center font-medium">{skill.name}</span>
            </motion.div>
          ))}
      </motion.div>

      {/* Empty state when nothing matches filter */}
      {activeGroup &&
        allSkills.filter((skill) => skill.group === activeGroup).length ===
          0 && (
          <div className="text-center py-8 text-neutral-500">
            No skills found in this category.
          </div>
        )}
    </div>
  );
};

export default SkillsVisualization;
