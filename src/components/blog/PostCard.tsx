"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { SerializedPost } from "@/models/Post";

interface PostCardProps {
  post: SerializedPost;
  index?: number;
}

export function PostCard({ post, index = 0 }: PostCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Draft";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:border-cyan-500/20"
      >
        {/* Featured Image */}
        {post.featuredImage && (
          <div className="relative aspect-[16/9] overflow-hidden bg-zinc-800">
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Category pill + reading time */}
          <div className="flex items-center gap-3">
            {post.categories[0] && (
              <span className="rounded-full border border-zinc-700 bg-zinc-800 px-2.5 py-0.5 text-xs text-zinc-400">
                {post.categories[0]}
              </span>
            )}
            <span className="font-mono text-xs text-zinc-500">
              {post.readingTime} min read
            </span>
          </div>

          {/* Title */}
          <h2 className="mt-3 font-heading text-lg font-medium text-zinc-100 transition-colors group-hover:text-cyan-500 line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Date */}
          <time
            dateTime={post.publishedAt || undefined}
            className="mt-4 block font-mono text-xs text-zinc-500"
          >
            {formatDate(post.publishedAt)}
          </time>
        </div>
      </Link>
    </motion.article>
  );
}
