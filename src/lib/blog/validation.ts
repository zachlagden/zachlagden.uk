import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title too long"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100)
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must be lowercase letters, numbers, and hyphens only",
    ),
  excerpt: z
    .string()
    .min(10, "Excerpt must be at least 10 characters")
    .max(500, "Excerpt too long"),
  content: z.string().min(1, "Content is required"),
  categories: z.array(z.string()).min(1, "Select at least one category"),
  tags: z.array(z.string()),
  featuredImage: z.string().url("Must be a valid URL"),
  published: z.boolean(),
});

export type PostFormData = z.infer<typeof postSchema>;

// For form state management
export type PostFormState = {
  errors?: z.inferFlattenedErrors<typeof postSchema>["fieldErrors"];
  message?: string;
  success?: boolean;
};

/**
 * Generate a URL-friendly slug from a title
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
