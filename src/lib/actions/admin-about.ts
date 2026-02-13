"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import { z } from "zod";
import clientPromise from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import type {
  AboutIntro,
  Experience,
  Education,
  Certification,
  SkillsFull,
} from "@/models/SiteContent";

const DB_NAME = "zachlagden-uk";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

const objectIdSchema = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

// ─── About Intro ────────────────────────────────────────────────────────────

const aboutIntroSchema = z.object({
  text: z.string().min(1, "Text is required").max(2000),
});

export async function updateAboutIntro(data: {
  text: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = aboutIntroSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db
    .collection<AboutIntro>("about_intro")
    .updateOne({}, { $set: { text: validated.data.text } }, { upsert: true });

  revalidatePath("/about");
  return { success: true, message: "About intro updated" };
}

// ─── Experience ─────────────────────────────────────────────────────────────

const experienceSchema = z.object({
  company: z.string().min(1, "Company is required").max(100),
  role: z.string().min(1, "Role is required").max(100),
  dateRange: z.string().min(1, "Date range is required").max(50),
  description: z.string().min(1, "Description is required").max(2000),
  visible: z.boolean().optional().default(true),
});

export async function createExperience(data: {
  company: string;
  role: string;
  dateRange: string;
  description: string;
  visible?: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = experienceSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Experience>("experience");

  const last = await collection.findOne({}, { sort: { order: -1 } });
  const nextOrder = (last?.order ?? -1) + 1;

  await collection.insertOne({
    ...validated.data,
    order: nextOrder,
    visible: validated.data.visible,
  } as Experience);

  revalidatePath("/about");
  return { success: true, message: "Experience created" };
}

export async function updateExperience(
  id: string,
  data: {
    company: string;
    role: string;
    dateRange: string;
    description: string;
  },
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const validated = experienceSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db.collection<Experience>("experience").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        company: validated.data.company,
        role: validated.data.role,
        dateRange: validated.data.dateRange,
        description: validated.data.description,
      },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true, message: "Experience updated" };
}

export async function deleteExperience(id: string): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<Experience>("experience")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true, message: "Experience deleted" };
}

export async function toggleExperienceVisibility(
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
    .collection<Experience>("experience")
    .updateOne({ _id: new ObjectId(id) }, { $set: { visible } });

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true };
}

export async function reorderExperience(
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
  const collection = db.collection<Experience>("experience");

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { order: index } },
    },
  }));

  await collection.bulkWrite(bulkOps);

  revalidatePath("/about");
  return { success: true, message: "Order updated" };
}

// ─── Education ──────────────────────────────────────────────────────────────

const educationSchema = z.object({
  institution: z.string().min(1, "Institution is required").max(100),
  degree: z.string().min(1, "Degree is required").max(200),
  dateRange: z.string().min(1, "Date range is required").max(50),
  description: z.string().min(1, "Description is required").max(2000),
  visible: z.boolean().optional().default(true),
});

export async function createEducation(data: {
  institution: string;
  degree: string;
  dateRange: string;
  description: string;
  visible?: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = educationSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Education>("education");

  const last = await collection.findOne({}, { sort: { order: -1 } });
  const nextOrder = (last?.order ?? -1) + 1;

  await collection.insertOne({
    ...validated.data,
    order: nextOrder,
    visible: validated.data.visible,
  } as Education);

  revalidatePath("/about");
  return { success: true, message: "Education created" };
}

export async function updateEducation(
  id: string,
  data: {
    institution: string;
    degree: string;
    dateRange: string;
    description: string;
  },
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const validated = educationSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db.collection<Education>("education").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        institution: validated.data.institution,
        degree: validated.data.degree,
        dateRange: validated.data.dateRange,
        description: validated.data.description,
      },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true, message: "Education updated" };
}

export async function deleteEducation(id: string): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<Education>("education")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true, message: "Education deleted" };
}

export async function toggleEducationVisibility(
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
    .collection<Education>("education")
    .updateOne({ _id: new ObjectId(id) }, { $set: { visible } });

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true };
}

export async function reorderEducation(
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
  const collection = db.collection<Education>("education");

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { order: index } },
    },
  }));

  await collection.bulkWrite(bulkOps);

  revalidatePath("/about");
  return { success: true, message: "Order updated" };
}

// ─── Certifications ─────────────────────────────────────────────────────────

const certificationSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  issuer: z.string().min(1, "Issuer is required").max(100),
  date: z.string().min(1, "Date is required").max(20),
  credentialUrl: z.string().url().nullable().optional(),
  visible: z.boolean().optional().default(true),
});

export async function createCertification(data: {
  name: string;
  issuer: string;
  date: string;
  credentialUrl?: string | null;
  visible?: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = certificationSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db.collection<Certification>("certifications").insertOne({
    ...validated.data,
    credentialUrl: validated.data.credentialUrl ?? null,
    visible: validated.data.visible,
  } as Certification);

  revalidatePath("/about");
  return { success: true, message: "Certification created" };
}

export async function updateCertification(
  id: string,
  data: {
    name: string;
    issuer: string;
    date: string;
    credentialUrl?: string | null;
  },
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const validated = certificationSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db.collection<Certification>("certifications").updateOne(
    { _id: new ObjectId(id) },
    {
      $set: {
        name: validated.data.name,
        issuer: validated.data.issuer,
        date: validated.data.date,
        credentialUrl: validated.data.credentialUrl ?? null,
      },
    },
  );

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true, message: "Certification updated" };
}

export async function deleteCertification(id: string): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<Certification>("certifications")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true, message: "Certification deleted" };
}

export async function toggleCertificationVisibility(
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
    .collection<Certification>("certifications")
    .updateOne({ _id: new ObjectId(id) }, { $set: { visible } });

  if (result.matchedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  return { success: true };
}

// ─── Skills Full ────────────────────────────────────────────────────────────

const skillsFullSchema = z.object({
  category: z.string().min(1, "Category is required").max(100),
  skills: z.array(z.string().min(1)).min(1, "At least one skill is required"),
});

export async function createSkillsFull(data: {
  category: string;
  skills: string[];
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = skillsFullSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SkillsFull>("skills_full");

  const last = await collection.findOne({}, { sort: { order: -1 } });
  const nextOrder = (last?.order ?? -1) + 1;

  await collection.insertOne({
    ...validated.data,
    order: nextOrder,
  } as SkillsFull);

  revalidatePath("/about");
  revalidatePath("/");
  return { success: true, message: "Skills category created" };
}

export async function updateSkillsFull(
  id: string,
  data: { category: string; skills: string[] },
): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const validated = skillsFullSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db.collection<SkillsFull>("skills_full").updateOne(
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

  revalidatePath("/about");
  revalidatePath("/");
  return { success: true, message: "Skills category updated" };
}

export async function deleteSkillsFull(id: string): Promise<ActionResult> {
  await requireAdmin();

  const idResult = objectIdSchema.safeParse(id);
  if (!idResult.success) {
    return { success: false, message: "Invalid ID" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const result = await db
    .collection<SkillsFull>("skills_full")
    .deleteOne({ _id: new ObjectId(id) });

  if (result.deletedCount === 0) {
    return { success: false, message: "Not found" };
  }

  revalidatePath("/about");
  revalidatePath("/");
  return { success: true, message: "Skills category deleted" };
}

export async function reorderSkillsFull(
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
  const collection = db.collection<SkillsFull>("skills_full");

  const bulkOps = orderedIds.map((id, index) => ({
    updateOne: {
      filter: { _id: new ObjectId(id) },
      update: { $set: { order: index } },
    },
  }));

  await collection.bulkWrite(bulkOps);

  revalidatePath("/about");
  revalidatePath("/");
  return { success: true, message: "Order updated" };
}
