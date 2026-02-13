import { CommentForm } from './CommentForm'
import { CommentList } from './CommentList'
import type { SerializedComment } from '@/models/Comment'

interface CommentSectionProps {
  postId: string
  comments: SerializedComment[]
  isAuthenticated: boolean
  isAdmin: boolean
}

export function CommentSection({
  postId,
  comments,
  isAuthenticated,
  isAdmin,
}: CommentSectionProps) {
  return (
    <section className="mt-12 pt-8 border-t border-neutral-200">
      <h2 className="text-2xl font-bold mb-6 text-neutral-900">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      <div className="mb-8">
        <CommentForm postId={postId} isAuthenticated={isAuthenticated} />
      </div>

      {/* Comment List */}
      <CommentList comments={comments} isAdmin={isAdmin} />
    </section>
  )
}
