import { ObjectId } from "mongodb";

/**
 * Post interface defining the blog post schema
 */
export interface Post {
  _id: ObjectId;
  slug: string;
  previous_slugs: string[]; // For redirect support on slug changes
  title: string;
  excerpt: string; // 2-3 sentence summary for cards
  content: string; // MDX content
  author: string;
  categories: string[]; // Broad topics: Tutorials, Projects, Deep Dives, Quick Tips
  tags: string[]; // Specific topics: react, typescript, etc.
  featuredImage: string; // Required per CONTEXT.md
  published: boolean;
  publishedAt: Date | null;
  updatedAt: Date;
  readingTime: number; // Minutes, calculated from content
  createdAt: Date;
}

/**
 * PostDocument type for MongoDB operations
 */
export type PostDocument = Post;

/**
 * SerializedPost type for API responses
 * Converts Date fields to ISO strings and ObjectId to string
 */
export interface SerializedPost
  extends Omit<Post, "_id" | "publishedAt" | "updatedAt" | "createdAt"> {
  _id: string;
  publishedAt: string | null;
  updatedAt: string;
  createdAt: string;
}
