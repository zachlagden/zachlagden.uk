import { Comment } from './Comment'
import type { SerializedComment } from '@/models/Comment'

interface CommentListProps {
  comments: SerializedComment[]
  isAdmin: boolean
}

export function CommentList({ comments, isAdmin }: CommentListProps) {
  if (comments.length === 0) {
    return (
      <p className="text-center py-8 text-neutral-500">
        No comments yet. Be the first to share your thoughts!
      </p>
    )
  }

  return (
    <div className="divide-y divide-neutral-200">
      {comments.map((comment) => (
        <Comment key={comment._id} comment={comment} isAdmin={isAdmin} />
      ))}
    </div>
  )
}
