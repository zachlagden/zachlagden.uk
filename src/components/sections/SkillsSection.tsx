"use client";

import React, { useState } from "react";
import { Code } from "lucide-react";
import Section from "../ui/Section";
import SkillCategory from "../ui/SkillCategory";
import SkillsVisualization from "../ui/SkillsVisualization";
import { Skills } from "@/types/content";

interface SkillsSectionProps {
  content: Skills;
  sectionIndex?: number;
}

const SkillsSection = React.forwardRef<HTMLElement, SkillsSectionProps>(
  ({ content, sectionIndex }, ref) => {
    const [viewMode, setViewMode] = useState<"list" | "visual">("list");

    // Map skill categories to include color classes
    const colorClasses = [
      "bg-blue-50 text-blue-900",
      "bg-emerald-50 text-emerald-900",
      "bg-amber-50 text-amber-900",
      "bg-purple-50 text-purple-900",
      "bg-neutral-100 text-neutral-900",
      "bg-rose-50 text-rose-900",
      "bg-indigo-50 text-indigo-900",
      "bg-cyan-50 text-cyan-900",
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
        sectionIndex={sectionIndex}
      >
        {/* View mode toggle */}
        <div className="flex justify-end mb-8">
          <div className="inline-flex bg-neutral-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode("list")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
              aria-pressed={viewMode === "list"}
            >
              List View
            </button>
            <button
              onClick={() => setViewMode("visual")}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                viewMode === "visual"
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              }`}
              aria-pressed={viewMode === "visual"}
            >
              Visual View
            </button>
          </div>
        </div>

        <div aria-label="Professional skills and competencies">
          {viewMode === "list" ? (
            // List view — staggered grid with first item spanning 2 cols
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {skillGroups.map((group, i) => {
                const row = Math.floor(i / 2);
                const col = i % 2;
                const delay = row * 0.15 + col * 0.1;
                return (
                  <div
                    key={group.title}
                    className={i === 0 ? "md:col-span-2" : ""}
                  >
                    <SkillCategory
                      title={group.title}
                      skills={group.skills}
                      colorClass={group.colorClass}
                      delay={delay}
                    />
                  </div>
                );
              })}
            </div>
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
