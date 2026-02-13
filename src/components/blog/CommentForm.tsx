"use client";

import { useActionState, useRef, useEffect } from "react";
import { createComment, type CommentFormState } from "@/lib/actions/comments";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare } from "lucide-react";

interface CommentFormProps {
  postId: string;
  isAuthenticated: boolean;
}

const initialState: CommentFormState = {};

export function CommentForm({ postId, isAuthenticated }: CommentFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(
    createComment,
    initialState,
  );

  // Clear form on success
  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  // Not authenticated - show sign in prompt
  if (!isAuthenticated) {
    return (
      <div className="rounded-lg border border-zinc-800 bg-zinc-900 p-6 text-center">
        <MessageSquare
          className="mx-auto mb-3 h-8 w-8 text-zinc-600"
          aria-hidden="true"
        />
        <p className="mb-4 text-zinc-400">Sign in to join the conversation</p>
        <Button asChild variant="outline">
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/?auth=required">Sign in with GitHub</a>
        </Button>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-4">
      <input type="hidden" name="postId" value={postId} />

      <div>
        <Textarea
          name="content"
          placeholder="Write a comment..."
          rows={3}
          maxLength={1000}
          required
          disabled={isPending}
          className="resize-none"
          aria-describedby={state.errors?.content ? "content-error" : undefined}
        />
        {state.errors?.content && (
          <p
            id="content-error"
            role="alert"
            className="mt-1 text-sm text-red-400"
          >
            {state.errors.content[0]}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <p className="text-xs text-zinc-600">Be respectful and constructive</p>
        <Button type="submit" disabled={isPending} size="sm">
          {isPending ? "Posting..." : "Post Comment"}
        </Button>
      </div>

      {state.message && !state.success && (
        <p role="alert" className="text-sm text-red-400">
          {state.message}
        </p>
      )}
    </form>
  );
}
