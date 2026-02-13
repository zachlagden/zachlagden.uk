"use client";

import React from "react";
import { motion } from "framer-motion";
import type {
  SerializedAboutIntro,
  SerializedExperience,
  SerializedEducation,
  SerializedCertification,
  SerializedSkillsFull,
} from "@/models/SiteContent";
import ExperienceTimeline from "./ExperienceTimeline";
import EducationTimeline from "./EducationTimeline";
import CertificationsGrid from "./CertificationsGrid";
import SkillsGrid from "./SkillsGrid";

interface AboutClientProps {
  intro: SerializedAboutIntro | null;
  experience: SerializedExperience[];
  education: SerializedEducation[];
  certifications: SerializedCertification[];
  skills: SerializedSkillsFull[];
}

export default function AboutClient({
  intro,
  experience,
  education,
  certifications,
  skills,
}: AboutClientProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Page header */}
      <motion.section
        className="py-24 sm:py-32"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="font-heading text-5xl font-bold text-text-primary sm:text-6xl">
          About
        </h1>
        {intro?.text && (
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
            {intro.text}
          </p>
        )}
      </motion.section>

      {/* Experience */}
      {experience.length > 0 && <ExperienceTimeline entries={experience} />}

      {/* Education */}
      {education.length > 0 && <EducationTimeline entries={education} />}

      {/* Certifications */}
      {certifications.length > 0 && (
        <CertificationsGrid certifications={certifications} />
      )}

      {/* Skills */}
      {skills.length > 0 && <SkillsGrid categories={skills} />}
    </main>
  );
}
