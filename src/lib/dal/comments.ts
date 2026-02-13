import "server-only";
import { ObjectId } from "mongodb";
import clientPromise from "@/lib/db";
import type { Comment, SerializedComment } from "@/models/Comment";

const DB_NAME = "zachlagden-uk";
const COLLECTION = "comments";

// Serialize Comment for API responses
function serializeComment(comment: Comment): SerializedComment {
  return {
    ...comment,
    _id: comment._id.toString(),
    postId: comment.postId.toString(),
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
  };
}

// Get all comments for a post, sorted by date (oldest first for reading order)
export async function getCommentsByPostId(
  postId: string,
): Promise<SerializedComment[]> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Comment>(COLLECTION);

  const comments = await collection
    .find({ postId: new ObjectId(postId) })
    .sort({ createdAt: 1 })
    .toArray();

  return comments.map(serializeComment);
}

// Get comment count for a post
export async function getCommentCount(postId: string): Promise<number> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Comment>(COLLECTION);

  return collection.countDocuments({ postId: new ObjectId(postId) });
}

// Create a new comment (called from Server Action after auth check)
export async function insertComment(data: {
  postId: string;
  userId: string;
  username: string;
  avatarUrl: string;
  content: string;
}): Promise<SerializedComment> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Comment>(COLLECTION);

  const now = new Date();
  const comment: Omit<Comment, "_id"> = {
    postId: new ObjectId(data.postId),
    userId: data.userId,
    username: data.username,
    avatarUrl: data.avatarUrl,
    content: data.content,
    createdAt: now,
    updatedAt: now,
  };

  const result = await collection.insertOne(comment as Comment);

  return serializeComment({
    ...comment,
    _id: result.insertedId,
  } as Comment);
}

// Delete a comment by ID (called from Server Action after admin check)
export async function deleteCommentById(commentId: string): Promise<boolean> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Comment>(COLLECTION);

  const result = await collection.deleteOne({ _id: new ObjectId(commentId) });
  return result.deletedCount > 0;
}

// Get a single comment by ID (for verification/deletion)
export async function getCommentById(
  commentId: string,
): Promise<SerializedComment | null> {
  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<Comment>(COLLECTION);

  try {
    const comment = await collection.findOne({ _id: new ObjectId(commentId) });
    return comment ? serializeComment(comment) : null;
  } catch {
    return null;
  }
}
