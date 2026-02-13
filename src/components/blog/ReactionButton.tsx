"use client";

import { useOptimistic, useTransition } from "react";
import { Heart } from "lucide-react";
import { toggleReaction } from "@/lib/actions/reactions";
import { cn } from "@/lib/utils";

interface ReactionButtonProps {
  postId: string;
  initialLiked: boolean;
  initialCount: number;
  isAuthenticated: boolean;
}

export function ReactionButton({
  postId,
  initialLiked,
  initialCount,
  isAuthenticated,
}: ReactionButtonProps) {
  const [isPending, startTransition] = useTransition();

  const [optimisticState, addOptimistic] = useOptimistic(
    { liked: initialLiked, count: initialCount },
    (state, newLiked: boolean) => ({
      liked: newLiked,
      count: state.count + (newLiked ? 1 : -1),
    }),
  );

  async function handleClick() {
    if (!isAuthenticated) {
      window.location.href = "/?auth=required";
      return;
    }

    const newLiked = !optimisticState.liked;
    addOptimistic(newLiked);

    startTransition(async () => {
      const result = await toggleReaction(postId);
      if (!result.success) {
        console.error("Failed to toggle reaction:", result.error);
      }
    });
  }

  return (
    <button
      onClick={handleClick}
      disabled={isPending}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5",
        "text-sm font-medium transition-all duration-200",
        "border focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]",
        optimisticState.liked
          ? "border-red-500/30 bg-red-500/10 text-red-400 focus:ring-red-500/50"
          : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300 focus:ring-zinc-500",
        isPending && "cursor-wait opacity-70",
      )}
      aria-label={optimisticState.liked ? "Unlike this post" : "Like this post"}
      aria-pressed={optimisticState.liked}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-transform duration-200",
          optimisticState.liked && "scale-110 fill-current",
        )}
      />
      <span>{optimisticState.count}</span>
    </button>
  );
}
