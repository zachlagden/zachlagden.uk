import {
  getAboutIntro,
  getAllExperience,
  getAllEducation,
  getAllCertifications,
  getSkillsFull,
} from "@/lib/content/site";
import { AboutAdmin } from "@/components/admin/AboutAdmin";

export const metadata = {
  title: "About",
};

export default async function AdminAboutPage() {
  const [intro, experience, education, certifications, skills] =
    await Promise.all([
      getAboutIntro(),
      getAllExperience(),
      getAllEducation(),
      getAllCertifications(),
      getSkillsFull(),
    ]);

  return (
    <AboutAdmin
      intro={intro}
      experience={experience}
      education={education}
      certifications={certifications}
      skills={skills}
    />
  );
}
