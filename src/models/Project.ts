import { ObjectId } from "mongodb";

/**
 * Project interface defining the project schema
 */
export interface Project {
  _id: ObjectId;
  slug: string;
  title: string;
  description: string; // Short description for cards
  longDescription?: string; // Optional detailed case study
  technologies: string[]; // ["React", "Next.js", "MongoDB"]
  demoUrl?: string | null; // Live demo link
  sourceUrl?: string | null; // Source code link
  githubRepo?: string | null; // "owner/repo" format for stats
  featuredImage: string; // Required image
  published: boolean;
  featured: boolean; // Pin to top of list
  createdAt: Date;
  updatedAt: Date;
}

/**
 * SerializedProject type for API responses
 * Converts Date fields to ISO strings and ObjectId to string
 */
export interface SerializedProject
  extends Omit<Project, "_id" | "createdAt" | "updatedAt"> {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
