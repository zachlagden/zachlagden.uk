import type { Metadata } from "next";
import {
  getAboutIntro,
  getExperience,
  getEducation,
  getCertifications,
  getSkillsFull,
} from "@/lib/content/site";
import AboutClient from "@/components/about/AboutClient";

export const metadata: Metadata = {
  title: "About",
  description:
    "Full-stack developer and digital entrepreneur. Experience, education, certifications, and skills.",
  alternates: {
    canonical: "/about",
  },
};

export default async function AboutPage() {
  const [intro, experience, education, certifications, skills] =
    await Promise.all([
      getAboutIntro(),
      getExperience(),
      getEducation(),
      getCertifications(),
      getSkillsFull(),
    ]);

  return (
    <AboutClient
      intro={intro}
      experience={experience}
      education={education}
      certifications={certifications}
      skills={skills}
    />
  );
}
