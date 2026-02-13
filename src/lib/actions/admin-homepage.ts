"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";
import clientPromise from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import type {
  HomepageHero,
  FeaturedWork,
  SkillsPreview,
  Testimonial,
  ContactInfo,
  SocialLink,
} from "@/models/SiteContent";

const DB_NAME = "zachlagden-uk";

// ─── Shared types ───────────────────────────────────────────────────────────

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

// ─── Hero ───────────────────────────────────────────────────────────────────

const heroSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  tagline: z.string().min(1, "Tagline is required").max(200),
});

export async function updateHero(data: {
  name: string;
  tagline: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = heroSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection<HomepageHero>("homepage_hero").updateOne(
    {},
    {
      $set: {
        name: validated.data.name,
        tagline: validated.data.tagline,
      },
    },
    { upsert: true },
  );

  revalidatePath("/");
  return { success: true, message: "Hero updated" };
}

// ─── Featured Work ──────────────────────────────────────────────────────────

const featuredWorkSchema = z.object({
  title: z.string().min(1, "Title is required").max(100),
  description: z.string().min(1, "Description is required").max(300),
  url: z.string().url("Must be a valid URL"),
  visible: z.boolean().optional().default(true),
});

export async function createFeaturedWork(data: {
  title: string;
  description: string;
  url: string;
  visible?: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = featuredWorkSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<FeaturedWork>("featured_work");

  // Get next order value
  const last = await collection.findOne({}, { sort: { order: -1 } });
  const nextOrder = (last?.order ?? -1) + 1;

  await collection.insertOne({
    ...validated.data,
    order: nextOrder,
    visible: validated.data.visible,
  } as FeaturedWork);

  revalidatePath("/");
  return { success: true, message: "Featured work created" };
}

export async function updateFeaturedWork(
  id: string,
  data: { title: string; description: string; url: string },
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const validated = featuredWorkSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db.collection<FeaturedWork>("featured_work").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        title: validated.data.title,
        description: validated.data.description,
        url: validated.data.url,
      },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true, message: "Featured work updated" };
}

export async function deleteFeaturedWork(id: string): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<FeaturedWork>("featured_work")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true, message: "Featured work deleted" };
}

export async function toggleFeaturedWorkVisibility(
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<FeaturedWork>("featured_work")
    .updateOne({ _id: new ObjectId(id) }, { $set: { visible } });

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function reorderFeaturedWork(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();

  for (const id of orderedIds) {
    const idResult = objectIdSchema.safeParse(id);
    if (!idResult.success) {
      return { success: false, message: `Invalid ID: ${id}` };
    }
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<FeaturedWork>("featured_work");

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { order: index } },
    },
  }));

  await collection.bulkWrite(bulkOps);

  revalidatePath("/");
  return { success: true, message: "Order updated" };
}

// ─── Skills Preview ─────────────────────────────────────────────────────────

const skillsPreviewSchema = z.object({
  category: z.string().min(1, "Category is required").max(100),
  skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
  visible: z.boolean().optional().default(true),
});

export async function createSkillsPreview(data: {
  category: string;
  skills: string[];
  visible?: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = skillsPreviewSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SkillsPreview>("skills_preview");

  const last = await collection.findOne({}, { sort: { order: -1 } });
  const nextOrder = (last?.order ?? -1) + 1;

  await collection.insertOne({
    ...validated.data,
    order: nextOrder,
    visible: validated.data.visible,
  } as SkillsPreview);

  revalidatePath("/");
  return { success: true, message: "Skills preview created" };
}

export async function updateSkillsPreview(
  id: string,
  data: { category: string; skills: string[] },
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const validated = skillsPreviewSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db.collection<SkillsPreview>("skills_preview").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        category: validated.data.category,
        skills: validated.data.skills,
      },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true, message: "Skills preview updated" };
}

export async function deleteSkillsPreview(id: string): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<SkillsPreview>("skills_preview")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true, message: "Skills preview deleted" };
}

export async function toggleSkillsPreviewVisibility(
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<SkillsPreview>("skills_preview")
    .updateOne({ _id: new ObjectId(id) }, { $set: { visible } });

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function reorderSkillsPreview(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();

  for (const id of orderedIds) {
    const idResult = objectIdSchema.safeParse(id);
    if (!idResult.success) {
      return { success: false, message: `Invalid ID: ${id}` };
    }
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SkillsPreview>("skills_preview");

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { order: index } },
    },
  }));

  await collection.bulkWrite(bulkOps);

  revalidatePath("/");
  return { success: true, message: "Order updated" };
}

// ─── Testimonials ───────────────────────────────────────────────────────────

const testimonialSchema = z.object({
  quote: z.string().min(1, "Quote is required").max(500),
  personName: z.string().min(1, "Name is required").max(100),
  personRole: z.string().min(1, "Role is required").max(100),
  avatarUrl: z.string().url().nullable().optional(),
  visible: z.boolean().optional().default(true),
});

export async function createTestimonial(data: {
  quote: string;
  personName: string;
  personRole: string;
  avatarUrl?: string | null;
  visible?: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = testimonialSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Testimonial>("testimonials");

  const last = await collection.findOne({}, { sort: { order: -1 } });
  const nextOrder = (last?.order ?? -1) + 1;

  await collection.insertOne({
    ...validated.data,
    avatarUrl: validated.data.avatarUrl ?? null,
    order: nextOrder,
    visible: validated.data.visible,
  } as Testimonial);

  revalidatePath("/");
  return { success: true, message: "Testimonial created" };
}

export async function updateTestimonial(
  id: string,
  data: {
    quote: string;
    personName: string;
    personRole: string;
    avatarUrl?: string | null;
  },
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const validated = testimonialSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db.collection<Testimonial>("testimonials").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        quote: validated.data.quote,
        personName: validated.data.personName,
        personRole: validated.data.personRole,
        avatarUrl: validated.data.avatarUrl ?? null,
      },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true, message: "Testimonial updated" };
}

export async function deleteTestimonial(id: string): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<Testimonial>("testimonials")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true, message: "Testimonial deleted" };
}

export async function toggleTestimonialVisibility(
  id: string,
  visible: boolean,
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<Testimonial>("testimonials")
    .updateOne({ _id: new ObjectId(id) }, { $set: { visible } });

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/");
  return { success: true };
}

export async function reorderTestimonials(
  orderedIds: string[],
): Promise<ActionResult> {
  await requireAdmin();

  for (const id of orderedIds) {
    const idResult = objectIdSchema.safeParse(id);
    if (!idResult.success) {
      return { success: false, message: `Invalid ID: ${id}` };
    }
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Testimonial>("testimonials");

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { order: index } },
    },
  }));

  await collection.bulkWrite(bulkOps);

  revalidatePath("/");
  return { success: true, message: "Order updated" };
}

// ─── Contact Info ───────────────────────────────────────────────────────────

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url(),
});

const contactInfoSchema = z.object({
  email: z.string().email("Must be a valid email"),
  location: z.string().min(1, "Location is required").max(100),
  locationMapUrl: z.string().url("Must be a valid URL"),
  socialLinks: z.array(socialLinkSchema),
});

export async function updateContactInfo(data: {
  email: string;
  location: string;
  locationMapUrl: string;
  socialLinks: Omit<SocialLink, "label">[];
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = contactInfoSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection<ContactInfo>("contact_info").updateOne(
    {},
    {
      $set: {
        email: validated.data.email,
        location: validated.data.location,
        locationMapUrl: validated.data.locationMapUrl,
        socialLinks: validated.data.socialLinks,
      },
    },
    { upsert: true },
  );

  revalidatePath("/");
  return { success: true, message: "Contact info updated" };
}
