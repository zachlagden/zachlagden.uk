"use server";

import { revalidatePath } from "next/cache";
import { verifySession } from "@/lib/dal";
import {
  toggleUserReaction,
  getReactionCount,
  getUserReaction,
} from "@/lib/dal/reactions";
import { getPostById } from "@/lib/blog/posts";

export type ReactionResult = {
  success: boolean;
  liked?: boolean;
  count?: number;
  error?: string;
};

/**
 * Toggle reaction (like/unlike) on a blog post.
 * Requires authentication. Returns new state for optimistic UI updates.
 */
export async function toggleReaction(postId: string): Promise<ReactionResult> {
  // 1. Verify authentication
  const { userId } = await verifySession();

  // 2. Validate postId format
  if (!/^[0-9a-fA-F]{24}$/.test(postId)) {
    return { success: false, error: "Invalid post ID" };
  }

  // 3. Verify post exists
  const post = await getPostById(postId);
  if (!post) {
    return { success: false, error: "Post not found" };
  }

  // 4. Toggle reaction
  try {
    const { added, newCount } = await toggleUserReaction(postId, userId);

    // 5. Revalidate post page (optional - optimistic UI handles immediate update)
    revalidatePath(`/blog/${post.slug}`);

    return {
      success: true,
      liked: added,
      count: newCount,
    };
  } catch (error) {
    console.error("Failed to toggle reaction:", error);
    return { success: false, error: "Failed to update reaction" };
  }
}

/**
 * Get current reaction state for a post.
 * Used to initialize optimistic UI on page load.
 * Returns null if not authenticated (no error).
 */
export async function getReactionState(postId: string): Promise<{
  liked: boolean;
  count: number;
} | null> {
  // Try to get session - don't throw if not authenticated
  try {
    const { userId } = await verifySession();

    const [liked, count] = await Promise.all([
      getUserReaction(postId, userId),
      getReactionCount(postId),
    ]);

    return { liked, count };
  } catch {
    // Not authenticated - just return count
    const count = await getReactionCount(postId);
    return { liked: false, count };
  }
}
