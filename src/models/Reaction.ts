import { ObjectId } from 'mongodb'

/**
 * Reaction interface defining the reaction schema
 */
export interface Reaction {
  _id: ObjectId
  postId: ObjectId           // Reference to posts collection
  userId: string             // GitHub user ID (one reaction per user per post)
  type: 'heart'              // Reaction type (heart only for v1)
  createdAt: Date
}
