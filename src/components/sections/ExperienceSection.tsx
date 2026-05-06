"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import Section from "../ui/Section";
import TimelineItem from "../ui/TimelineItem";
import { Experience } from "@/types/content";
import { formatDateRange } from "@/utils/contentLoader";

interface ExperienceSectionProps {
  content: Experience[];
  sectionIndex?: number;
}

const ExperienceSection = React.forwardRef<HTMLElement, ExperienceSectionProps>(
  ({ content, sectionIndex }, ref) => {
    return (
      <Section
        id="experience"
        title="Experience"
        icon={<Briefcase className="w-6 h-6" aria-hidden="true" />}
        ref={ref}
        sectionIndex={sectionIndex}
      >
        <div
          className="relative"
          role="list"
          aria-label="Work experience history"
        >
          {/* Center vertical line — desktop only */}
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-neutral-200 -translate-x-1/2"
            aria-hidden="true"
          />

          <div className="space-y-16">
            {content.map((experience, i) => (
              <TimelineItem
                key={experience.id}
                id={experience.id}
                title={experience.title}
                company={experience.company}
                companyLink={experience.companyLink ?? undefined}
                date={formatDateRange(experience.startDate, experience.endDate)}
                location={experience.location}
                index={i}
              >
                <p className="mb-4">{experience.description}</p>
                <div
                  className="flex flex-wrap gap-2"
                  aria-label="Skills and technologies"
                >
                  {experience.skills.map((skill, j) => (
                    <span
                      key={j}
                      className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </TimelineItem>
            ))}
          </div>
        </div>
      </Section>
    );
  },
);

ExperienceSection.displayName = "ExperienceSection";

export default ExperienceSection;
