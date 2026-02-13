import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import type { SerializedPost } from "@/models/Post";

interface LatestPostsSectionProps {
  posts: SerializedPost[];
}

export default function LatestPostsSection({ posts }: LatestPostsSectionProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <h2 className="font-heading text-3xl font-semibold text-text-primary">
        Latest from the blog
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-cyan-500/20"
          >
            <div className="flex items-center gap-3">
              {post.categories[0] && (
                <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                  {post.categories[0]}
                </span>
              )}
              <span className="font-mono text-xs text-zinc-600">
                {post.readingTime} min read
              </span>
            </div>

            <h3 className="mt-3 font-heading text-lg font-medium text-zinc-100 group-hover:text-cyan-500 transition-colors">
              {post.title}
            </h3>

            <p className="mt-2 text-sm leading-relaxed text-zinc-400 line-clamp-2">
              {post.excerpt}
            </p>

            <span className="mt-3 block font-mono text-xs text-zinc-600">
              {post.publishedAt
                ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "Draft"}
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-cyan-500"
        >
          View all posts
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
