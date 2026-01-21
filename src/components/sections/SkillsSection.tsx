"use client";

import React, { useState } from "react";
import { Code } from "lucide-react";
import Section from "../ui/Section";
import SkillCategory from "../ui/SkillCategory";
import SkillsVisualization from "../ui/SkillsVisualization";
import { Skills } from "@/types/content";

interface SkillsSectionProps {
  content: Skills;
}

const SkillsSection = React.forwardRef<HTMLElement, SkillsSectionProps>(
  ({ content }, ref) => {
    const [viewMode, setViewMode] = useState<"list" | "visual">("list");

    // Map skill categories to include color classes
    const colorClasses = [
      "bg-blue-50 dark:bg-blue-950 text-blue-900 dark:text-blue-200",
      "bg-emerald-50 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200",
      "bg-amber-50 dark:bg-amber-950 text-amber-900 dark:text-amber-200",
      "bg-purple-50 dark:bg-purple-950 text-purple-900 dark:text-purple-200",
      "bg-neutral-100 dark:bg-neutral-800 text-neutral-900 dark:text-neutral-200",
      "bg-rose-50 dark:bg-rose-950 text-rose-900 dark:text-rose-200",
      "bg-indigo-50 dark:bg-indigo-950 text-indigo-900 dark:text-indigo-200",
      "bg-cyan-50 dark:bg-cyan-950 text-cyan-900 dark:text-cyan-200",
    ];

    const skillGroups = content.categories.map((category, index) => ({
      title: category.name,
      skills: category.skills,
      colorClass: colorClasses[index % colorClasses.length],
    }));

    return (
      <Section
        id="skills"
        title="Skills"
        icon={<Code className="w-6 h-6" aria-hidden="true" />}
        ref={ref}
      >
        {/* View mode toggle */}
        <div className="flex justify-end mb-8">
          <div className="inline-flex bg-neutral-100 dark:bg-neutral-800 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-[#e5e5e5] shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              aria-pressed={viewMode === "list"}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("visual")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === "visual"
                  ? "bg-white dark:bg-neutral-700 text-neutral-900 dark:text-[#e5e5e5] shadow-sm"
                  : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
              aria-pressed={viewMode === "visual"}
            >
              Visual View
            </button>
          </div>
        </div>

        <div
          className="space-y-12"
          aria-label="Professional skills and competencies"
        >
          {viewMode === "list" ? (
            // List view (original)
            <>
              {skillGroups.map((group) => (
                <SkillCategory
                  key={group.title}
                  title={group.title}
                  skills={group.skills}
                  colorClass={group.colorClass}
                />
              ))}
            </>
          ) : (
            // Visual view (new interactive visualization)
            <SkillsVisualization skillGroups={skillGroups} />
          )}
        </div>
      </Section>
    );
  },
);

SkillsSection.displayName = "SkillsSection";

export default SkillsSection;
