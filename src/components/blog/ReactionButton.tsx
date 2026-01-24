'use client'

import { useOptimistic, useTransition } from 'react'
import { Heart } from 'lucide-react'
import { toggleReaction } from '@/lib/actions/reactions'
import { cn } from '@/lib/utils'

interface ReactionButtonProps {
  postId: string
  initialLiked: boolean
  initialCount: number
  isAuthenticated: boolean
}

export function ReactionButton({
  postId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: ReactionButtonProps) {
  const [isPending, startTransition] = useTransition()

  // Optimistic state for instant UI feedback
  const [optimisticState, addOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: state.count + (newLiked ? 1 : -1),
    })
  )

  async function handleClick() {
    // Not authenticated - redirect to sign in
    if (!isAuthenticated) {
      window.location.href = '/?auth=required'
      return
    }

    // Optimistic update - show immediately
    const newLiked = !optimisticState.liked
    addOptimistic(newLiked)

    // Execute Server Action
    startTransition(async () => {
      const result = await toggleReaction(postId)
      // If failed, the optimistic state will revert automatically
      // when the component re-renders with server data
      if (!result.success) {
        console.error('Failed to toggle reaction:', result.error)
      }
    })
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
        'text-sm font-medium transition-all duration-200',
        'border focus:outline-none focus:ring-2 focus:ring-offset-2',
        optimisticState.liked
          ? 'bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 focus:ring-red-500'
          : 'bg-neutral-50 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800 focus:ring-neutral-500',
        isPending && 'opacity-70 cursor-wait'
      )}
      aria-label={optimisticState.liked ? 'Unlike this post' : 'Like this post'}
      aria-pressed={optimisticState.liked}
    >
      <Heart
        className={cn(
          'w-4 h-4 transition-transform duration-200',
          optimisticState.liked && 'fill-current scale-110'
        )}
      />
      <span>{optimisticState.count}</span>
    </button>
  )
}
