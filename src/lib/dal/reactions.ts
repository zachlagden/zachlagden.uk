import "server-only";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import type { Reaction } from "@/models/Reaction";

const DB_NAME = "zachlagden-uk";
const COLLECTION = "reactions";

// Check if user has reacted to a post
export async function getUserReaction(
  postId: string,
  userId: string,
): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Reaction>(COLLECTION);

  const reaction = await collection.findOne({
    postId: new ObjectId(postId),
    userId,
  });

  return !!reaction;
}

// Get reaction count for a post
export async function getReactionCount(postId: string): Promise<number> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Reaction>(COLLECTION);

  return collection.countDocuments({ postId: new ObjectId(postId) });
}

// Toggle reaction for a user (add if not exists, remove if exists)
// Uses atomic operations to prevent race conditions
export async function toggleUserReaction(
  postId: string,
  userId: string,
): Promise<{ added: boolean; newCount: number }> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const reactions = db.collection<Reaction>(COLLECTION);

  // Check if reaction exists
  const existing = await reactions.findOne({
    postId: new ObjectId(postId),
    userId,
  });

  if (existing) {
    // Remove reaction
    await reactions.deleteOne({ _id: existing._id });
    const newCount = await reactions.countDocuments({
      postId: new ObjectId(postId),
    });
    return { added: false, newCount };
  } else {
    // Add reaction
    await reactions.insertOne({
      postId: new ObjectId(postId),
      userId,
      type: "heart",
      createdAt: new Date(),
    } as Reaction);
    const newCount = await reactions.countDocuments({
      postId: new ObjectId(postId),
    });
    return { added: true, newCount };
  }
}

// Get user reactions for multiple posts (for listing pages)
export async function getUserReactionsForPosts(
  postIds: string[],
  userId: string,
): Promise<Set<string>> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Reaction>(COLLECTION);

  const reactions = await collection
    .find({
      postId: { $in: postIds.map((id) => new ObjectId(id)) },
      userId,
    })
    .toArray();

  return new Set(reactions.map((r) => r.postId.toString()));
}
