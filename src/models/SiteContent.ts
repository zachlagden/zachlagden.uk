import { ObjectId } from "mongodb";

// ─── Shared types ────────────────────────────────────────────────────────────

export interface SocialLink {
  platform: string;
  url: string;
  label?: string;
}

// ─── Site Settings ───────────────────────────────────────────────────────────

/**
 * Generic key-value store for site metadata and configuration.
 * Collection: site_settings
 */
export interface SiteSetting {
  _id: ObjectId;
  key: string;
  value: unknown;
}

export interface SerializedSiteSetting extends Omit<SiteSetting, "_id"> {
  _id: string;
}

// ─── Homepage Hero ───────────────────────────────────────────────────────────

/**
 * Hero section content for the homepage.
 * Collection: homepage_hero
 */
export interface HomepageHero {
  _id: ObjectId;
  name: string;
  tagline: string;
  socialLinks: SocialLink[];
}

export interface SerializedHomepageHero extends Omit<HomepageHero, "_id"> {
  _id: string;
}

// ─── Featured Work ───────────────────────────────────────────────────────────

/**
 * Highlighted projects/work items for the homepage.
 * Collection: featured_work
 */
export interface FeaturedWork {
  _id: ObjectId;
  title: string;
  description: string;
  url: string;
  order: number;
  visible: boolean;
}

export interface SerializedFeaturedWork extends Omit<FeaturedWork, "_id"> {
  _id: string;
}

// ─── Skills Preview ──────────────────────────────────────────────────────────

/**
 * Abbreviated skill categories for the homepage preview.
 * Collection: skills_preview
 */
export interface SkillsPreview {
  _id: ObjectId;
  category: string;
  skills: string[];
  order: number;
  visible: boolean;
}

export interface SerializedSkillsPreview extends Omit<SkillsPreview, "_id"> {
  _id: string;
}

// ─── Testimonials ────────────────────────────────────────────────────────────

/**
 * Client/colleague testimonials.
 * Collection: testimonials
 */
export interface Testimonial {
  _id: ObjectId;
  quote: string;
  personName: string;
  personRole: string;
  avatarUrl?: string | null;
  order: number;
  visible: boolean;
}

export interface SerializedTestimonial extends Omit<Testimonial, "_id"> {
  _id: string;
}

// ─── About Intro ─────────────────────────────────────────────────────────────

/**
 * Introductory text for the About page/section.
 * Collection: about_intro
 */
export interface AboutIntro {
  _id: ObjectId;
  text: string;
}

export interface SerializedAboutIntro extends Omit<AboutIntro, "_id"> {
  _id: string;
}

// ─── Experience ──────────────────────────────────────────────────────────────

/**
 * Work experience entries.
 * Collection: experience
 */
export interface Experience {
  _id: ObjectId;
  company: string;
  role: string;
  dateRange: string;
  description: string;
  order: number;
  visible: boolean;
}

export interface SerializedExperience extends Omit<Experience, "_id"> {
  _id: string;
}

// ─── Education ───────────────────────────────────────────────────────────────

/**
 * Education entries.
 * Collection: education
 */
export interface Education {
  _id: ObjectId;
  institution: string;
  degree: string;
  dateRange: string;
  description: string;
  order: number;
  visible: boolean;
}

export interface SerializedEducation extends Omit<Education, "_id"> {
  _id: string;
}

// ─── Certifications ──────────────────────────────────────────────────────────

/**
 * Professional certifications.
 * Collection: certifications
 */
export interface Certification {
  _id: ObjectId;
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string | null;
  visible: boolean;
}

export interface SerializedCertification extends Omit<Certification, "_id"> {
  _id: string;
}

// ─── Skills Full ─────────────────────────────────────────────────────────────

/**
 * Full skill categories for the dedicated skills section.
 * Collection: skills_full
 */
export interface SkillsFull {
  _id: ObjectId;
  category: string;
  skills: string[];
  order: number;
}

export interface SerializedSkillsFull extends Omit<SkillsFull, "_id"> {
  _id: string;
}

// ─── Contact Info ────────────────────────────────────────────────────────────

/**
 * Contact information and social links.
 * Collection: contact_info
 */
export interface ContactInfo {
  _id: ObjectId;
  email: string;
  location: string;
  locationMapUrl: string;
  socialLinks: Omit<SocialLink, "label">[];
}

export interface SerializedContactInfo extends Omit<ContactInfo, "_id"> {
  _id: string;
}
