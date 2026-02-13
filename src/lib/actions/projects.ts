"use server";

import { revalidatePath } from "next/cache";
import clientPromise from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import type { Project } from "@/models/Project";

const DB_NAME = "zachlagden-uk";
const COLLECTION = "projects";

export interface ProjectFormState {
  success?: boolean;
  message?: string;
  errors?: Record<string, string[]>;
}

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Create a new project
 */
export async function createProject(
  _prevState: ProjectFormState,
  formData: FormData,
): Promise<ProjectFormState> {
  await requireAdmin();

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const longDescription = formData.get("longDescription") as string;
  const slug = (formData.get("slug") as string) || generateSlug(title || "");
  const technologies =
    (formData.get("technologies") as string)
      ?.split(",")
      .map((t) => t.trim())
      .filter(Boolean) || [];
  const demoUrl = (formData.get("demoUrl") as string) || null;
  const sourceUrl = (formData.get("sourceUrl") as string) || null;
  const githubRepo = (formData.get("githubRepo") as string) || null;
  const featuredImage = formData.get("featuredImage") as string;
  const published = formData.get("published") === "true";
  const featured = formData.get("featured") === "true";

  // Validate required fields
  const errors: Record<string, string[]> = {};
  if (!title?.trim()) errors.title = ["Title is required"];
  if (!description?.trim()) errors.description = ["Description is required"];
  if (!featuredImage?.trim())
    errors.featuredImage = ["Featured image URL is required"];

  if (Object.keys(errors).length > 0) {
    return { errors, message: "Validation failed", success: false };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Omit<Project, "_id">>(COLLECTION);

  // Check slug uniqueness
  const existing = await collection.findOne({ slug });
  if (existing) {
    return {
      errors: { slug: ["A project with this slug already exists"] },
      message: "Slug is not unique",
      success: false,
    };
  }

  const now = new Date();
  await collection.insertOne({
    slug,
    title: title.trim(),
    description: description.trim(),
    longDescription: longDescription?.trim() || undefined,
    technologies,
    demoUrl,
    sourceUrl,
    githubRepo,
    featuredImage: featuredImage.trim(),
    published,
    featured,
    createdAt: now,
    updatedAt: now,
  });

  revalidatePath("/projects");

  return { success: true, message: "Project created" };
}
