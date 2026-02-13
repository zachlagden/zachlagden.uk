"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { verifySession, requireAdmin } from "@/lib/dal";
import {
  insertComment,
  deleteCommentById,
  getCommentById,
} from "@/lib/dal/comments";
import { getPostById } from "@/lib/blog/posts";

// Validation schema for comment creation
const CommentSchema = z.object({
  content: z
    .string()
    .min(1, "Comment cannot be empty")
    .max(1000, "Comment must be less than 1000 characters")
    .trim(),
  postId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID"),
});

export type CommentFormState = {
  errors?: {
    content?: string[];
    postId?: string[];
  };
  message?: string;
  success?: boolean;
};

/**
 * Create a new comment on a blog post.
 * Requires authentication. Any logged-in user can comment.
 */
export async function createComment(
  _prevState: CommentFormState,
  formData: FormData,
): Promise<CommentFormState> {
  // 1. Verify authentication
  const { userId, user } = await verifySession();

  // 2. Validate input
  const validatedFields = CommentSchema.safeParse({
    content: formData.get("content"),
    postId: formData.get("postId"),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Please check your comment.",
      success: false,
    };
  }

  const { content, postId } = validatedFields.data;

  // 3. Verify post exists
  const post = await getPostById(postId);
  if (!post) {
    return {
      message: "Post not found.",
      success: false,
    };
  }

  // 4. Insert comment
  try {
    await insertComment({
      postId,
      userId,
      username: user.name || "Anonymous",
      avatarUrl: user.image || "",
      content,
    });

    // 5. Revalidate post page to show new comment
    revalidatePath(`/blog/${post.slug}`);

    return {
      message: "Comment posted!",
      success: true,
    };
  } catch (error) {
    console.error("Failed to create comment:", error);
    return {
      message: "Failed to post comment. Please try again.",
      success: false,
    };
  }
}

/**
 * Delete a comment (admin only).
 * Returns result object for client handling.
 */
export async function deleteComment(
  commentId: string,
): Promise<{ success: boolean; error?: string }> {
  // 1. Verify admin
  await requireAdmin();

  // 2. Validate commentId format
  if (!/^[0-9a-fA-F]{24}$/.test(commentId)) {
    return { success: false, error: "Invalid comment ID" };
  }

  // 3. Get comment to find post for revalidation
  const comment = await getCommentById(commentId);
  if (!comment) {
    return { success: false, error: "Comment not found" };
  }

  // 4. Delete comment
  try {
    const deleted = await deleteCommentById(commentId);
    if (!deleted) {
      return { success: false, error: "Failed to delete comment" };
    }

    // 5. Revalidate - we need post slug, get it from post
    const post = await getPostById(comment.postId);
    if (post) {
      revalidatePath(`/blog/${post.slug}`);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to delete comment:", error);
    return { success: false, error: "Failed to delete comment" };
  }
}
