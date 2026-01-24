import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/db'
import type { Project, SerializedProject } from '@/models/Project'

const DB_NAME = 'zachlagden-uk'
const COLLECTION = 'projects'

// Helper to serialize Project for API responses
export function serializeProject(project: Project): SerializedProject {
  return {
    ...project,
    _id: project._id.toString(),
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  }
}

// Get all published projects, sorted by featured then date
export async function getProjects(options?: {
  technologies?: string[];
  limit?: number;
}): Promise<SerializedProject[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Project>(COLLECTION)

  interface Filter {
    published: boolean
    technologies?: { $in: string[] }
  }

  const filter: Filter = { published: true }

  if (options?.technologies?.length) {
    filter.technologies = { $in: options.technologies }
  }

  const projects = await collection
    .find(filter)
    .sort({ featured: -1, createdAt: -1 })  // Featured first, then newest
    .limit(options?.limit ?? 50)
    .toArray()

  return projects.map(serializeProject)
}

// Get all unique technologies from published projects
export async function getAllTechnologies(): Promise<string[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Project>(COLLECTION)

  const technologies = await collection.distinct('technologies', { published: true })
  return technologies.sort()
}

// Get single project by slug (for potential detail page)
export async function getProjectBySlug(slug: string): Promise<SerializedProject | null> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Project>(COLLECTION)

  const project = await collection.findOne({ slug, published: true })

  return project ? serializeProject(project) : null
}
