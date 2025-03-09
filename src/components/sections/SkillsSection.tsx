"use client";

import React from "react";
import { Code } from "lucide-react";
import Section from "../ui/Section";
import SkillCategory from "../ui/SkillCategory";

const SkillsSection = React.forwardRef<HTMLElement>((props, ref) => {
  return (
    <Section
      id="skills"
      title="Skills"
      icon={<Code className="w-6 h-6" aria-hidden="true" />}
      ref={ref}
    >
      <div
        className="space-y-12"
        aria-label="Professional skills and competencies"
      >
        <SkillCategory
          title="Programming Languages"
          skills={["Python", "JavaScript", "TypeScript"]}
          colorClass="bg-blue-50 text-blue-900"
        />

        <SkillCategory
          title="Web Technologies"
          skills={["HTML5/CSS3", "React.js", "Next.js", "Flask"]}
          colorClass="bg-emerald-50 text-emerald-900"
        />

        <SkillCategory
          title="Databases & Infrastructure"
          skills={["MongoDB", "SQL", "Ubuntu", "VPS", "Cloudflare", "NGINX"]}
          colorClass="bg-amber-50 text-amber-900"
        />

        <SkillCategory
          title="Development & DevOps"
          skills={[
            "Git",
            "API Design",
            "REST APIs",
            "Linux",
            "Server Management",
          ]}
          colorClass="bg-purple-50 text-purple-900"
        />

        <SkillCategory
          title="Business & Leadership"
          skills={[
            "Business Strategy",
            "Start-up Leadership",
            "Project Management",
            "Agile Methodologies",
            "Client Relations",
            "Digital Transformation",
            "Growth Optimization",
          ]}
          colorClass="bg-neutral-100 text-neutral-900"
        />

        <SkillCategory
          title="Teaching & Leadership"
          skills={[
            "Teaching",
            "Curriculum Development",
            "Mentorship",
            "Leadership",
          ]}
          colorClass="bg-rose-50 text-rose-900"
        />
      </div>
    </Section>
  );
});

SkillsSection.displayName = "SkillsSection";

export default SkillsSection;
