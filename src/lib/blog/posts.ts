import clientPromise from '@/lib/db'
import type { Post, SerializedPost } from '@/models/Post'
import readingTime from 'reading-time'

const DB_NAME = 'zachlagden-uk'
const COLLECTION = 'posts'

// Helper to serialize Post for API responses
export function serializePost(post: Post): SerializedPost {
  return {
    ...post,
    _id: post._id.toString(),
    publishedAt: post.publishedAt?.toISOString() ?? null,
    updatedAt: post.updatedAt.toISOString(),
    createdAt: post.createdAt.toISOString(),
  }
}

// Get all published posts, sorted by date (newest first)
export async function getPublishedPosts(options?: {
  limit?: number
  offset?: number
  categories?: string[]
  tags?: string[]
}): Promise<SerializedPost[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Post>(COLLECTION)

  interface Filter {
    published: boolean
    categories?: { $in: string[] }
    tags?: { $in: string[] }
  }

  const filter: Filter = { published: true }

  if (options?.categories?.length) {
    filter.categories = { $in: options.categories }
  }

  if (options?.tags?.length) {
    filter.tags = { $in: options.tags }
  }

  const posts = await collection
    .find(filter)
    .sort({ publishedAt: -1 })
    .skip(options?.offset ?? 0)
    .limit(options?.limit ?? 100)
    .toArray()

  return posts.map(serializePost)
}

// Get single post by slug
export async function getPostBySlug(slug: string): Promise<SerializedPost | null> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Post>(COLLECTION)

  const post = await collection.findOne({ slug, published: true })

  return post ? serializePost(post) : null
}

// Get post by previous slug (for redirects)
export async function getPostByPreviousSlug(slug: string): Promise<SerializedPost | null> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Post>(COLLECTION)

  const post = await collection.findOne({
    previous_slugs: slug,
    published: true
  })

  return post ? serializePost(post) : null
}

// Get all unique categories from published posts
export async function getAllCategories(): Promise<string[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Post>(COLLECTION)

  const categories = await collection.distinct('categories', { published: true })
  return categories.sort()
}

// Get all unique tags from published posts
export async function getAllTags(): Promise<string[]> {
  const client = await clientPromise
  const db = client.db(DB_NAME)
  const collection = db.collection<Post>(COLLECTION)

  const tags = await collection.distinct('tags', { published: true })
  return tags.sort()
}

// Calculate reading time from content
export function calculateReadingTime(content: string): number {
  const stats = readingTime(content)
  return Math.ceil(stats.minutes)
}
