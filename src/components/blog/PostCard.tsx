"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import type { SerializedPost } from "@/models/Post";

interface PostCardProps {
  post: SerializedPost;
}

export function PostCard({ post }: PostCardProps) {
  // Format date for display
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Draft";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <Link
        href={`/blog/${post.slug}`}
        className="block h-full border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-colors"
      >
        {/* Featured Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Categories - Primary category only for card */}
          {post.categories.length > 0 && (
            <div className="mb-3">
              <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-700">
                {post.categories[0]}
              </span>
            </div>
          )}

          {/* Title */}
          <h2 className="text-xl font-semibold mb-2 group-hover:text-neutral-600 transition-colors line-clamp-2">
            {post.title}
          </h2>

          {/* Excerpt */}
          <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {post.excerpt}
          </p>

          {/* Meta: Date and Reading Time */}
          <div className="flex items-center gap-3 text-xs text-neutral-500">
            <time dateTime={post.publishedAt || undefined}>
              {formatDate(post.publishedAt)}
            </time>
            <span>•</span>
            <span>{post.readingTime} min read</span>
          </div>
        </div>
      </Link>
    </motion.article>
  );
}
