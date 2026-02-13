import {
  getHomepageHero,
  getAllFeaturedWork,
  getAllSkillsPreview,
  getAllTestimonials,
  getContactInfo,
} from "@/lib/content/site";
import { HomepageAdmin } from "@/components/admin/HomepageAdmin";

export const metadata = {
  title: "Homepage",
};

export default async function AdminHomepagePage() {
  const [hero, featuredWork, skillsPreview, testimonials, contactInfo] =
    await Promise.all([
      getHomepageHero(),
      getAllFeaturedWork(),
      getAllSkillsPreview(),
      getAllTestimonials(),
      getContactInfo(),
    ]);

  return (
    <HomepageAdmin
      hero={hero}
      featuredWork={featuredWork}
      skillsPreview={skillsPreview}
      testimonials={testimonials}
      contactInfo={contactInfo}
    />
  );
}
