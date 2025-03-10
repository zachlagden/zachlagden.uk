"use client";

import React, { useState } from "react";
import { Code } from "lucide-react";
import Section from "../ui/Section";
import SkillCategory from "../ui/SkillCategory";
import SkillsVisualization from "../ui/SkillsVisualization";

const SkillsSection = React.forwardRef<HTMLElement>((props, ref) => {
  const [viewMode, setViewMode] = useState<"list" | "visual">("list");

  // Define skill categories
  const skillGroups = [
    {
      title: "Programming Languages",
      skills: ["Python", "JavaScript", "TypeScript"],
      colorClass: "bg-blue-50 text-blue-900",
    },
    {
      title: "Web Technologies",
      skills: ["HTML5/CSS3", "React.js", "Next.js", "Flask"],
      colorClass: "bg-emerald-50 text-emerald-900",
    },
    {
      title: "Databases & Infrastructure",
      skills: ["MongoDB", "SQL", "Ubuntu", "VPS", "Cloudflare", "NGINX"],
      colorClass: "bg-amber-50 text-amber-900",
    },
    {
      title: "Development & DevOps",
      skills: ["Git", "API Design", "REST APIs", "Linux", "Server Management"],
      colorClass: "bg-purple-50 text-purple-900",
    },
    {
      title: "Business & Leadership",
      skills: [
        "Business Strategy",
        "Start-up Leadership",
        "Project Management",
        "Agile Methodologies",
        "Client Relations",
        "Digital Transformation",
        "Growth Optimization",
      ],
      colorClass: "bg-neutral-100 text-neutral-900",
    },
    {
      title: "Teaching & Leadership",
      skills: [
        "Teaching",
        "Curriculum Development",
        "Mentorship",
        "Leadership",
      ],
      colorClass: "bg-rose-50 text-rose-900",
    },
  ];

  return (
    <Section
      id="skills"
      title="Skills"
      icon={<Code className="w-6 h-6" aria-hidden="true" />}
      ref={ref}
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
});

SkillsSection.displayName = "SkillsSection";

export default SkillsSection;
