"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import Section from "../ui/Section";
import TimelineItem from "../ui/TimelineItem";
import { Education } from "@/types/content";
import { formatDateRange } from "@/utils/contentLoader";

interface EducationSectionProps {
  content: Education[];
  sectionIndex?: number;
}

const EducationSection = React.forwardRef<HTMLElement, EducationSectionProps>(
  ({ content, sectionIndex }, ref) => {
    return (
      <Section
        id="education"
        title="Education"
        icon={<GraduationCap className="w-6 h-6" aria-hidden="true" />}
        ref={ref}
        sectionIndex={sectionIndex}
      >
        <div className="relative" role="list" aria-label="Education history">
          {/* Center vertical line — desktop only */}
          <div
            className="hidden lg:block absolute left-1/2 top-0 bottom-0 w-px bg-neutral-200 -translate-x-1/2"
            aria-hidden="true"
          />

          <div className="space-y-16">
            {content.map((education, i) => (
              <TimelineItem
                key={education.id}
                id={education.id}
                title={education.degree}
                company={education.institution}
                companyLink={
                  education.institution === "Farnborough College of Technology"
                    ? "https://farn-ct.ac.uk/"
                    : education.institution === "Charters School"
                      ? "https://www.chartersschool.org.uk/"
                      : undefined
                }
                date={formatDateRange(education.startDate, education.endDate)}
                location=""
                index={i}
              >
                <p className="mb-4">{education.description}</p>
                {education.skills && (
                  <div
                    className="flex flex-wrap gap-2"
                    aria-label="Skills and technologies"
                  >
                    {education.skills.map((skill, j) => (
                      <span
                        key={j}
                        className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                )}
                {education.subjects && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                    {Object.entries(education.subjects).map(
                      ([category, items]) => (
                        <div key={category}>
                          <h4 className="text-sm font-medium mb-2">
                            {category}
                          </h4>
                          <ul className="text-sm text-neutral-600 space-y-1">
                            {items.map((item, j) => (
                              <li key={j}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </TimelineItem>
            ))}
          </div>
        </div>
      </Section>
    );
  },
);

EducationSection.displayName = "EducationSection";

export default EducationSection;
