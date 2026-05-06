"use client";

import Image from "next/image";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft, ArrowRight } from "lucide-react";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import TableOfContents from "@/components/blog/TableOfContents";
import ShareButtons from "@/components/blog/ShareButtons";
import BlogTagBadge from "@/components/blog/BlogTagBadge";
import { BlogPostSerialized } from "@/types/blog";

interface BlogPostClientProps {
  post: BlogPostSerialized;
  prev: BlogPostSerialized | null;
  next: BlogPostSerialized | null;
  siteUrl: string;
}

export default function BlogPostClient({
  post,
  prev,
  next,
  siteUrl,
}: BlogPostClientProps) {
  const date = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "";

  const fullUrl = `${siteUrl}/blog/${post.slug}`;

  return (
    <article className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-0 py-12">
      {/* Header */}
      <header className="mb-10">
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <BlogTagBadge key={tag} tag={tag} href={`/blog?tag=${tag}`} />
            ))}
          </div>
        )}
        <h1 className="text-3xl md:text-4xl font-heading font-bold tracking-tight mb-4">
          {post.title}
        </h1>
        <div className="flex items-center gap-4 text-sm text-neutral-500">
          <div className="flex items-center gap-2">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={24}
                height={24}
                className="rounded-full"
              />
            )}
            <span>{post.author.name}</span>
          </div>
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {date}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {post.readingTime} min read
          </span>
        </div>
      </header>

      {/* Featured image */}
      {post.featuredImage && (
        <div className="relative aspect-[2/1] rounded-lg overflow-hidden mb-10 bg-neutral-100">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>
      )}

      {/* Content + TOC */}
      <div className="flex gap-10">
        <div className="flex-1 max-w-3xl">
          <MarkdownRenderer content={post.content} />
        </div>
        <aside className="hidden lg:block w-56 shrink-0">
          <TableOfContents content={post.content} />
        </aside>
      </div>

      {/* Share + nav */}
      <div className="mt-12 pt-8 border-t border-neutral-200">
        <div className="flex items-center justify-between mb-8">
          <ShareButtons title={post.title} url={fullUrl} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prev && (
            <Link
              href={`/blog/${prev.slug}`}
              className="flex items-center gap-3 p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
              <div>
                <span className="text-xs text-neutral-500">Previous</span>
                <p className="text-sm font-medium truncate">{prev.title}</p>
              </div>
            </Link>
          )}
          {next && (
            <Link
              href={`/blog/${next.slug}`}
              className="flex items-center justify-end gap-3 p-4 border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors group md:col-start-2"
            >
              <div className="text-right">
                <span className="text-xs text-neutral-500">Next</span>
                <p className="text-sm font-medium truncate">{next.title}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-neutral-400 group-hover:text-neutral-700 transition-colors" />
            </Link>
          )}
        </div>
      </div>
    </article>
  );
}
