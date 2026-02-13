import Image from 'next/image'
import { formatDistanceToNow } from 'date-fns'
import { DeleteCommentButton } from './DeleteCommentButton'
import type { SerializedComment } from '@/models/Comment'

interface CommentProps {
  comment: SerializedComment
  isAdmin: boolean
}

export function Comment({ comment, isAdmin }: CommentProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })

  return (
    <article className="flex gap-4 py-4">
      {/* Avatar */}
      <div className="flex-shrink-0">
        {comment.avatarUrl ? (
          <Image
            src={comment.avatarUrl}
            alt={comment.username}
            width={40}
            height={40}
            className="rounded-full"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-neutral-200 flex items-center justify-center">
            <span className="text-sm font-medium text-neutral-600">
              {comment.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-neutral-900">
            {comment.username}
          </span>
          <span className="text-sm text-neutral-500">
            {timeAgo}
          </span>
          {isAdmin && (
            <DeleteCommentButton
              commentId={comment._id}
              username={comment.username}
            />
          )}
        </div>
        <p className="text-neutral-700 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      </div>
    </article>
  )
}
