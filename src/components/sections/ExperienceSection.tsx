"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import Section from "../ui/Section";
import TimelineItem from "../ui/TimelineItem";
import { Experience } from "@/types/content";
import { formatDateRange } from "@/utils/contentLoader";

interface ExperienceSectionProps {
  content: Experience[];
}

const ExperienceSection = React.forwardRef<HTMLElement, ExperienceSectionProps>(
  ({ content }, ref) => {
    return (
      <Section
        id="experience"
        title="Experience"
        icon={<Briefcase className="w-6 h-6" aria-hidden="true" />}
        ref={ref}
      >
        <div
          className="space-y-16"
          role="list"
          aria-label="Work experience history"
        >
          {content.map((experience) => (
            <TimelineItem
              key={experience.id}
              id={experience.id}
              title={experience.title}
              company={experience.company}
              companyLink={experience.companyLink ?? undefined}
              date={formatDateRange(experience.startDate, experience.endDate)}
              location={experience.location}
            >
              <p className="mb-4">{experience.description}</p>
              <div
                className="flex flex-wrap gap-2"
                aria-label="Skills and technologies"
              >
                {experience.skills.map((skill, i) => (
                  <span
                    key={i}
                    className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </TimelineItem>
          ))}
        </div>
      </Section>
    );
  },
);

ExperienceSection.displayName = "ExperienceSection";

export default ExperienceSection;
