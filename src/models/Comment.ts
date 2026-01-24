import { ObjectId } from 'mongodb'

/**
 * Comment interface defining the comment schema
 */
export interface Comment {
  _id: ObjectId
  postId: ObjectId           // Reference to posts collection
  userId: string             // GitHub user ID from NextAuth
  username: string           // GitHub username for display
  avatarUrl: string          // GitHub avatar URL
  content: string            // Comment text (max 1000 chars)
  createdAt: Date
  updatedAt: Date
}

/**
 * SerializedComment type for API responses
 * Converts Date fields to ISO strings and ObjectId to string
 */
export interface SerializedComment extends Omit<Comment, '_id' | 'postId' | 'createdAt' | 'updatedAt'> {
  _id: string
  postId: string
  createdAt: string
  updatedAt: string
}
