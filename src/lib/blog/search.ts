import clientPromise from '@/lib/db'
import type { Post, SerializedPost } from '@/models/Post'
import { serializePost } from './posts'

const DB_NAME = 'zachlagden-uk'
const COLLECTION = 'posts'

export interface SearchOptions {
  query?: string
  categories?: string[]
  tags?: string[]
  limit?: number
  offset?: number
}

// Full-text search with filters
export async function searchPosts(options: SearchOptions): Promise<SerializedPost[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Post>(COLLECTION)

  const filter: any = { published: true }

  // Add text search if query provided
  if (options.query?.trim()) {
    filter.$text = { $search: options.query }
  }

  // Add category filter
  if (options.categories?.length) {
    filter.categories = { $in: options.categories }
  }

  // Add tag filter
  if (options.tags?.length) {
    filter.tags = { $in: options.tags }
  }

  // Build projection for text score (only if searching)
  const projection = options.query?.trim()
    ? { score: { $meta: "textScore" } }
    : {}

  // Build sort criteria - text score if searching, otherwise date
  const sort: any = options.query?.trim()
    ? { score: { $meta: "textScore" }, publishedAt: -1 }
    : { publishedAt: -1 }

  const posts = await collection
    .find(filter, { projection })
    .sort(sort)
    .skip(options.offset ?? 0)
    .limit(options.limit ?? 20)
    .toArray()

  return posts.map(serializePost)
}
