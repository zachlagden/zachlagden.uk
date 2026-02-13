"use server";

import { revalidatePath } from "next/cache";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import { postSchema, type PostFormState } from "@/lib/blog/validation";
import { calculateReadingTime } from "@/lib/blog/posts";
import type { Post } from "@/models/Post";

const DB_NAME = "zachlagden-uk";
const COLLECTION = "posts";

/**
 * Create a new blog post
 */
export async function createPost(
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  // Authorization check
  await requireAdmin();

  // Parse form data
  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    categories: formData.getAll("categories"),
    tags: formData.getAll("tags"),
    featuredImage: formData.get("featuredImage"),
    published: formData.get("published") === "true",
  };

  // Validate with Zod
  const validated = postSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Validation failed",
      success: false,
    };
  }

  const data = validated.data;

  // Check slug uniqueness
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Post>(COLLECTION);

  const existingPost = await collection.findOne({ slug: data.slug });
  if (existingPost) {
    return {
      errors: { slug: ["A post with this slug already exists"] },
      message: "Slug is not unique",
      success: false,
    };
  }

  // Prepare document
  const now = new Date();
  const newPost: Omit<Post, "_id"> = {
    slug: data.slug,
    previous_slugs: [],
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    author: "Zach Lagden",
    categories: data.categories,
    tags: data.tags,
    featuredImage: data.featuredImage,
    published: data.published,
    publishedAt: data.published ? now : null,
    updatedAt: now,
    readingTime: calculateReadingTime(data.content),
    createdAt: now,
  };

  // Insert into database
  await collection.insertOne(newPost as Post);

  // Revalidate paths
  revalidatePath("/blog");
  revalidatePath("/");

  return {
    success: true,
    message: `Post "${data.title}" created successfully`,
  };
}

/**
 * Update an existing blog post
 */
export async function updatePost(
  postId: string,
  _prevState: PostFormState,
  formData: FormData,
): Promise<PostFormState> {
  // Authorization check
  await requireAdmin();

  // Validate postId
  if (!ObjectId.isValid(postId)) {
    return {
      message: "Invalid post ID",
      success: false,
    };
  }

  // Parse form data
  const rawData = {
    title: formData.get("title"),
    slug: formData.get("slug"),
    excerpt: formData.get("excerpt"),
    content: formData.get("content"),
    categories: formData.getAll("categories"),
    tags: formData.getAll("tags"),
    featuredImage: formData.get("featuredImage"),
    published: formData.get("published") === "true",
  };

  // Validate with Zod
  const validated = postSchema.safeParse(rawData);

  if (!validated.success) {
    return {
      errors: validated.error.flatten().fieldErrors,
      message: "Validation failed",
      success: false,
    };
  }

  const data = validated.data;

  // Get existing post
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Post>(COLLECTION);

  const existingPost = await collection.findOne({ _id: new ObjectId(postId) });
  if (!existingPost) {
    return {
      message: "Post not found",
      success: false,
    };
  }

  const oldSlug = existingPost.slug;
  const slugChanged = oldSlug !== data.slug;

  // Check slug uniqueness if changed
  if (slugChanged) {
    const duplicateSlug = await collection.findOne({
      slug: data.slug,
      _id: { $ne: new ObjectId(postId) },
    });
    if (duplicateSlug) {
      return {
        errors: { slug: ["A post with this slug already exists"] },
        message: "Slug is not unique",
        success: false,
      };
    }
  }

  // Prepare update
  const now = new Date();
  const updateData: Partial<Post> = {
    slug: data.slug,
    title: data.title,
    excerpt: data.excerpt,
    content: data.content,
    categories: data.categories,
    tags: data.tags,
    featuredImage: data.featuredImage,
    published: data.published,
    updatedAt: now,
    readingTime: calculateReadingTime(data.content),
  };

  // Handle slug change - add old slug to previous_slugs
  if (slugChanged) {
    await collection.updateOne(
      { _id: new ObjectId(postId) },
      {
        $set: updateData,
        $addToSet: { previous_slugs: oldSlug },
      },
    );
  } else {
    await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: updateData },
    );
  }

  // Handle publishedAt - set when first published
  if (data.published && !existingPost.publishedAt) {
    await collection.updateOne(
      { _id: new ObjectId(postId) },
      { $set: { publishedAt: now } },
    );
  }

  // Revalidate paths
  revalidatePath("/blog");
  revalidatePath(`/blog/${data.slug}`);
  if (slugChanged) {
    revalidatePath(`/blog/${oldSlug}`);
  }

  return {
    success: true,
    message: `Post "${data.title}" updated successfully`,
  };
}

/**
 * Delete a blog post
 */
export async function deletePost(
  postId: string,
): Promise<{ success: boolean; error?: string }> {
  // Authorization check
  await requireAdmin();

  // Validate postId
  if (!ObjectId.isValid(postId)) {
    return {
      success: false,
      error: "Invalid post ID",
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Post>(COLLECTION);

  const result = await collection.deleteOne({ _id: new ObjectId(postId) });

  if (result.deletedCount === 0) {
    return {
      success: false,
      error: "Post not found",
    };
  }

  // Revalidate paths
  revalidatePath("/blog");
  revalidatePath("/");

  return { success: true };
}

/**
 * Toggle post published status
 */
export async function togglePublish(
  postId: string,
  publish: boolean,
): Promise<{ success: boolean; error?: string }> {
  // Authorization check
  await requireAdmin();

  // Validate postId
  if (!ObjectId.isValid(postId)) {
    return {
      success: false,
      error: "Invalid post ID",
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Post>(COLLECTION);

  const existingPost = await collection.findOne({ _id: new ObjectId(postId) });
  if (!existingPost) {
    return {
      success: false,
      error: "Post not found",
    };
  }

  const now = new Date();
  const updateData: Partial<Post> = {
    published: publish,
    updatedAt: now,
  };

  // Set publishedAt when first published
  if (publish && !existingPost.publishedAt) {
    updateData.publishedAt = now;
  }

  await collection.updateOne(
    { _id: new ObjectId(postId) },
    { $set: updateData },
  );

  // Revalidate paths
  revalidatePath("/blog");
  revalidatePath(`/blog/${existingPost.slug}`);

  return { success: true };
}
