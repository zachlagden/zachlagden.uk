"use client";

import React from "react";
import { GraduationCap } from "lucide-react";
import Section from "../ui/Section";
import TimelineItem from "../ui/TimelineItem";

const EducationSection = React.forwardRef<HTMLElement>((props, ref) => {
  return (
    <Section
      id="education"
      title="Education"
      icon={<GraduationCap className="w-6 h-6" aria-hidden="true" />}
      ref={ref}
    >
      <div className="space-y-16" role="list" aria-label="Education history">
        <TimelineItem
          id="farnborough"
          title="Level 3 T-Level in Digital Design, Production and Development"
          company="Farnborough College of Technology"
          companyLink="https://farn-ct.ac.uk/"
          date="Sep 2023 - Jul 2025"
          location=""
        >
          <p className="mb-4">
            Specializing in software development and digital design principles.
            Serving as a Student Leader and Course Representative.
          </p>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Skills and technologies"
          >
            {[
              "Python",
              "C#",
              "Software Development",
              "Digital Design",
              "Project Management",
            ].map((tag, i) => (
              <span
                key={i}
                className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </TimelineItem>

        <TimelineItem
          id="charters"
          title="Secondary Education"
          company="Charters School"
          companyLink="https://www.chartersschool.org.uk/"
          date="Jun 2018 - Apr 2023"
          location=""
        >
          <p className="mb-4">
            Comprehensive secondary education with focus on STEM subjects
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Core Subjects</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>Mathematics</li>
                <li>English</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Technology</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>Computer Science</li>
                <li>Business</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Sciences</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>Physics</li>
                <li>Chemistry</li>
                <li>Biology</li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Additional</h4>
              <ul className="text-sm text-neutral-600 space-y-1">
                <li>Princes Trust</li>
              </ul>
            </div>
          </div>
        </TimelineItem>
      </div>
    </Section>
  );
});

EducationSection.displayName = "EducationSection";

export default EducationSection;
