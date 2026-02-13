import Image from "next/image";
import { formatDistanceToNow } from "date-fns";
import { DeleteCommentButton } from "./DeleteCommentButton";
import type { SerializedComment } from "@/models/Comment";

interface CommentProps {
  comment: SerializedComment;
  isAdmin: boolean;
}

export function Comment({ comment, isAdmin }: CommentProps) {
  const timeAgo = formatDistanceToNow(new Date(comment.createdAt), {
    addSuffix: true,
  });

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
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800">
            <span className="text-sm font-medium text-zinc-400">
              {comment.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex items-center gap-2">
          <span className="font-medium text-zinc-200">{comment.username}</span>
          <span className="font-mono text-sm text-zinc-600">{timeAgo}</span>
          {isAdmin && (
            <DeleteCommentButton
              commentId={comment._id}
              username={comment.username}
            />
          )}
        </div>
        <p className="whitespace-pre-wrap break-words text-zinc-400">
          {comment.content}
        </p>
      </div>
    </article>
  );
}
