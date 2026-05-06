import { ObjectId } from "mongodb";

export interface BlogPost {
  _id: ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    name: string;
    githubUsername: string;
    avatar?: string;
  };
  tags: string[];
  status: "draft" | "published";
  readingTime: number;
  createdAt: Date;
  updatedAt: Date;
  publishedAt?: Date;
}

export interface BlogPostSerialized {
  _id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  author: {
    name: string;
    githubUsername: string;
    avatar?: string;
  };
  tags: string[];
  status: "draft" | "published";
  readingTime: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export interface BlogPostInput {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage?: string;
  tags: string[];
  status: "draft" | "published";
}

export function serializePost(post: BlogPost): BlogPostSerialized {
  return {
    ...post,
    _id: post._id.toString(),
    createdAt: post.createdAt.toISOString(),
    updatedAt: post.updatedAt.toISOString(),
    publishedAt: post.publishedAt?.toISOString(),
  };
}
