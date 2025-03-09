"use client";

import React from "react";
import { Briefcase } from "lucide-react";
import Section from "../ui/Section";
import TimelineItem from "../ui/TimelineItem";

const ExperienceSection = React.forwardRef<HTMLElement>((props, ref) => {
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
        <TimelineItem
          id="digigrow"
          title="Co-Founder & CTO"
          company="DigiGrow LTD"
          companyLink="https://digigrow.uk/"
          date="Jun 2024 - Present"
          location="United Kingdom · Hybrid"
        >
          <p className="mb-4">
            Leading digital transformation and web development projects. Working
            with individuals and small businesses on their digital needs.
            Notable clients include The Thatched Tavern, The Chertsey Show, and
            Blueview Group.
          </p>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Skills and technologies"
          >
            {[
              "Business Strategy",
              "Digital Transformation",
              "Start-up Leadership",
              "Web Development",
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
          id="lagden-dev"
          title="Founder"
          company="Lagden Development"
          companyLink="https://lagden.dev"
          date="2023 - Present"
          location="United Kingdom · Remote"
        >
          <p className="mb-4">
            Personal professional side project offering development services.
            Portfolio available at lagden.dev/projects.
          </p>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Skills and technologies"
          >
            {[
              "Full-Stack Development",
              "Project Management",
              "Technical Architecture",
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
          id="freelance"
          title="Freelance Full-Stack Web Developer"
          company="Self-employed"
          date="Jan 2020 - Present"
          location="United Kingdom · Remote"
        >
          <p className="mb-4">
            Developing custom web solutions and managing client projects from
            inception to deployment.
          </p>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Skills and technologies"
          >
            {[
              "Full-Stack Development",
              "Client Relations",
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
          id="step8up"
          title="Skills Bootcamp Trainer"
          company="Step8up Academy"
          companyLink="https://academy.step8up.co.uk/"
          date="Apr 2024 - Oct 2024"
          location="United Kingdom · Hybrid"
        >
          <p className="mb-4">
            Teaching programming and development skills with a focus on being
            genuine and respectful with students.
          </p>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Skills and technologies"
          >
            {["Teaching", "Python", "Curriculum Development"].map((tag, i) => (
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
          id="jamcoding"
          title="Head Code Coach"
          company="Jam Coding"
          companyLink="https://jamcoding.com/"
          date="Sep 2023 - Oct 2024"
          location="United Kingdom · On site"
        >
          <p className="mb-4">
            Leading programming education initiatives and teaching young people
            to code.
          </p>
          <div
            className="flex flex-wrap gap-2"
            aria-label="Skills and technologies"
          >
            {["Teaching", "Leadership", "Programming Education"].map(
              (tag, i) => (
                <span
                  key={i}
                  className="text-xs py-1 px-3 bg-neutral-100 rounded-full"
                >
                  {tag}
                </span>
              ),
            )}
          </div>
        </TimelineItem>
      </div>
    </Section>
  );
});

ExperienceSection.displayName = "ExperienceSection";

export default ExperienceSection;
