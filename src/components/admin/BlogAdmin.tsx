"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Plus, ExternalLink, Pencil, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { SerializedPost } from "@/models/Post";
import { deletePost, togglePublish } from "@/lib/actions/posts";

interface Props {
  posts: SerializedPost[];
}

export function BlogAdmin({ posts: initialPosts }: Props) {
  const [isPending, startTransition] = useTransition();
  const [posts, setPosts] = useState(initialPosts);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filtered = posts.filter((post) => {
    const matchesSearch =
      !search ||
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "published" && post.published) ||
      (filter === "draft" && !post.published);
    return matchesSearch && matchesFilter;
  });

  function handleTogglePublish(postId: string, publish: boolean) {
    startTransition(async () => {
      const result = await togglePublish(postId, publish);
      if (result.success) {
        setPosts((prev) =>
          prev.map((p) =>
            p._id === postId ? { ...p, published: publish } : p,
          ),
        );
      }
    });
  }

  function handleDelete(postId: string) {
    startTransition(async () => {
      const result = await deletePost(postId);
      if (result.success) {
        setPosts((prev) => prev.filter((p) => p._id !== postId));
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Blog
          </h1>
          <p className="mt-2 text-zinc-400">
            Manage blog posts, drafts, and publishing.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/blog/new">
            <Plus className="h-4 w-4" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-zinc-700 bg-zinc-800 pl-10 text-zinc-100"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Post list */}
      <div className="space-y-2">
        {filtered.map((post) => (
          <div
            key={post._id}
            className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-zinc-200">
                  {post.title}
                </p>
                {!post.published && (
                  <span className="shrink-0 rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-400">
                    Draft
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                <span className="font-mono">
                  {post.publishedAt
                    ? new Date(post.publishedAt).toLocaleDateString()
                    : "Not published"}
                </span>
                <span>{post.readingTime} min read</span>
                {post.categories.length > 0 && (
                  <span>{post.categories.join(", ")}</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={post.published}
                onCheckedChange={(checked) =>
                  handleTogglePublish(post._id, checked)
                }
                disabled={isPending}
                aria-label={`${post.published ? "Unpublish" : "Publish"} ${post.title}`}
              />

              <Button asChild size="icon-xs" variant="ghost">
                <Link
                  href={`/blog/${post.slug}`}
                  target="_blank"
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild size="icon-xs" variant="ghost">
                <Link
                  href={`/blog/${post.slug}/edit`}
                  className="text-zinc-500 hover:text-zinc-300"
                >
                  <Pencil className="h-4 w-4" />
                </Link>
              </Button>

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete &ldquo;{post.title}&rdquo;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the post and all its
                      comments. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => handleDelete(post._id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 py-12 text-center">
            <p className="text-zinc-500">
              {search || filter !== "all"
                ? "No posts match your filters."
                : "No blog posts yet."}
            </p>
            {!search && filter === "all" && (
              <Button asChild size="sm" className="mt-4">
                <Link href="/blog/new">Create your first post</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {posts.length > 0 && (
        <p className="mt-4 text-sm text-zinc-600">
          {posts.filter((p) => p.published).length} published,{" "}
          {posts.filter((p) => !p.published).length} drafts &mdash;{" "}
          {posts.length} total
        </p>
      )}
    </div>
  );
}
