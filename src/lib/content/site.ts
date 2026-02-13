import clientPromise from "@/lib/db";
import type {
  SiteSetting,
  SerializedSiteSetting,
  HomepageHero,
  SerializedHomepageHero,
  FeaturedWork,
  SerializedFeaturedWork,
  SkillsPreview,
  SerializedSkillsPreview,
  Testimonial,
  SerializedTestimonial,
  AboutIntro,
  SerializedAboutIntro,
  Experience,
  SerializedExperience,
  Education,
  SerializedEducation,
  Certification,
  SerializedCertification,
  SkillsFull,
  SerializedSkillsFull,
  ContactInfo,
  SerializedContactInfo,
} from "@/models/SiteContent";

const DB_NAME = "zachlagden-uk";

// ─── Serializers ─────────────────────────────────────────────────────────────

function serializeSiteSetting(doc: SiteSetting): SerializedSiteSetting {
  return { ...doc, _id: doc._id.toString() };
}

function serializeHomepageHero(doc: HomepageHero): SerializedHomepageHero {
  return { ...doc, _id: doc._id.toString() };
}

function serializeFeaturedWork(doc: FeaturedWork): SerializedFeaturedWork {
  return { ...doc, _id: doc._id.toString() };
}

function serializeSkillsPreview(doc: SkillsPreview): SerializedSkillsPreview {
  return { ...doc, _id: doc._id.toString() };
}

function serializeTestimonial(doc: Testimonial): SerializedTestimonial {
  return { ...doc, _id: doc._id.toString() };
}

function serializeAboutIntro(doc: AboutIntro): SerializedAboutIntro {
  return { ...doc, _id: doc._id.toString() };
}

function serializeExperience(doc: Experience): SerializedExperience {
  return { ...doc, _id: doc._id.toString() };
}

function serializeEducation(doc: Education): SerializedEducation {
  return { ...doc, _id: doc._id.toString() };
}

function serializeCertification(doc: Certification): SerializedCertification {
  return { ...doc, _id: doc._id.toString() };
}

function serializeSkillsFull(doc: SkillsFull): SerializedSkillsFull {
  return { ...doc, _id: doc._id.toString() };
}

function serializeContactInfo(doc: ContactInfo): SerializedContactInfo {
  return { ...doc, _id: doc._id.toString() };
}

// ─── Site Settings ───────────────────────────────────────────────────────────

export async function getSiteSetting(
  key: string,
): Promise<SerializedSiteSetting | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const doc = await db
    .collection<SiteSetting>("site_settings")
    .findOne({ key });
  return doc ? serializeSiteSetting(doc) : null;
}

export async function getAllSiteSettings(): Promise<SerializedSiteSetting[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const docs = await db
    .collection<SiteSetting>("site_settings")
    .find()
    .toArray();
  return docs.map(serializeSiteSetting);
}

// ─── Homepage Hero ───────────────────────────────────────────────────────────

export async function getHomepageHero(): Promise<SerializedHomepageHero | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const doc = await db.collection<HomepageHero>("homepage_hero").findOne();
  return doc ? serializeHomepageHero(doc) : null;
}

// ─── Featured Work ───────────────────────────────────────────────────────────

export async function getFeaturedWork(): Promise<SerializedFeaturedWork[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const docs = await db
    .collection<FeaturedWork>("featured_work")
    .find({ visible: true })
    .sort({ order: 1 })
    .toArray();
  return docs.map(serializeFeaturedWork);
}

// ─── Skills Preview ──────────────────────────────────────────────────────────

export async function getSkillsPreview(): Promise<SerializedSkillsPreview[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const docs = await db
    .collection<SkillsPreview>("skills_preview")
    .find({ visible: true })
    .sort({ order: 1 })
    .toArray();
  return docs.map(serializeSkillsPreview);
}

// ─── Testimonials ────────────────────────────────────────────────────────────

export async function getTestimonials(): Promise<SerializedTestimonial[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const docs = await db
    .collection<Testimonial>("testimonials")
    .find({ visible: true })
    .sort({ order: 1 })
    .toArray();
  return docs.map(serializeTestimonial);
}

// ─── About Intro ─────────────────────────────────────────────────────────────

export async function getAboutIntro(): Promise<SerializedAboutIntro | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const doc = await db.collection<AboutIntro>("about_intro").findOne();
  return doc ? serializeAboutIntro(doc) : null;
}

// ─── Experience ──────────────────────────────────────────────────────────────

export async function getExperience(): Promise<SerializedExperience[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const docs = await db
    .collection<Experience>("experience")
    .find({ visible: true })
    .sort({ order: 1 })
    .toArray();
  return docs.map(serializeExperience);
}

// ─── Education ───────────────────────────────────────────────────────────────

export async function getEducation(): Promise<SerializedEducation[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const docs = await db
    .collection<Education>("education")
    .find({ visible: true })
    .sort({ order: 1 })
    .toArray();
  return docs.map(serializeEducation);
}

// ─── Certifications ──────────────────────────────────────────────────────────

export async function getCertifications(): Promise<SerializedCertification[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const docs = await db
    .collection<Certification>("certifications")
    .find({ visible: true })
    .toArray();
  return docs.map(serializeCertification);
}

// ─── Skills Full ─────────────────────────────────────────────────────────────

export async function getSkillsFull(): Promise<SerializedSkillsFull[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const docs = await db
    .collection<SkillsFull>("skills_full")
    .find()
    .sort({ order: 1 })
    .toArray();
  return docs.map(serializeSkillsFull);
}

// ─── Combined about page fetch ──────────────────────────────────────────────

export interface AboutPageData {
  intro: SerializedAboutIntro | null;
  experience: SerializedExperience[];
  education: SerializedEducation[];
  certifications: SerializedCertification[];
  skills: SerializedSkillsFull[];
}

/**
 * Fetch all about page data in parallel. Use in the about page.tsx
 * server component to get everything in one call.
 */
export async function getAboutPageData(): Promise<AboutPageData> {
  const [intro, experience, education, certifications, skills] =
    await Promise.all([
      getAboutIntro(),
      getExperience(),
      getEducation(),
      getCertifications(),
      getSkillsFull(),
    ]);

  return { intro, experience, education, certifications, skills };
}

// ─── Contact Info ────────────────────────────────────────────────────────────

export async function getContactInfo(): Promise<SerializedContactInfo | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const doc = await db.collection<ContactInfo>("contact_info").findOne();
  return doc ? serializeContactInfo(doc) : null;
}
