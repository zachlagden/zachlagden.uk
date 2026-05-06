"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Clock } from "lucide-react";
import BlogTagBadge from "./BlogTagBadge";
import { BlogPostSerialized } from "@/types/blog";

interface BlogPostCardProps {
  post: BlogPostSerialized;
  featured?: boolean;
  index?: number;
}

export default function BlogPostCard({
  post,
  featured = false,
  index = 0,
}: BlogPostCardProps) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className={`group ${featured ? "" : "h-full"}`}
    >
      <Link
        href={`/blog/${post.slug}`}
        className={`block border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-colors ${featured ? "" : "h-full flex flex-col"}`}
      >
        {post.featuredImage && (
          <div
            className={`relative overflow-hidden bg-neutral-100 ${featured ? "aspect-[2/1]" : "aspect-[16/9]"}`}
          >
            <Image
              src={post.featuredImage}
              alt={post.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-500"
              sizes={
                featured
                  ? "100vw"
                  : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              }
            />
          </div>
        )}
        <div className={`p-6 ${featured ? "" : "flex-1 flex flex-col"}`}>
          <div className="flex items-center gap-3 text-xs text-neutral-500 mb-3">
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              {date}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {post.readingTime} min read
            </span>
          </div>
          <h3
            className={`font-heading font-bold tracking-tight mb-2 group-hover:text-neutral-600 transition-colors ${featured ? "text-2xl md:text-3xl" : "text-lg"}`}
          >
            {post.title}
          </h3>
          <p
            className={`text-neutral-600 leading-relaxed ${featured ? "text-base" : "text-sm flex-1"}`}
          >
            {post.excerpt}
          </p>
          {post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.slice(0, 3).map((tag) => (
                <BlogTagBadge key={tag} tag={tag} />
              ))}
            </div>
          )}
        </div>
      </Link>
    </motion.article>
  );
}
