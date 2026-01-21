import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft } from 'lucide-react'
import type { SerializedPost } from '@/models/Post'

interface PostHeaderProps {
  post: SerializedPost
}

export function PostHeader({ post }: PostHeaderProps) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    : null

  return (
    <header className="mb-8">
      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Blog
      </Link>

      {/* Categories */}
      {post.categories.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.categories.map((category) => (
            <Link
              key={category}
              href={`/blog?category=${encodeURIComponent(category)}`}
              className="text-xs font-medium px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              {category}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-4xl md:text-5xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="text-lg text-neutral-600 dark:text-neutral-400 mb-6">
        {post.excerpt}
      </p>

      {/* Meta info */}
      <div className="flex flex-wrap items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400 mb-8">
        <span>By {post.author}</span>
        {publishedDate && (
          <>
            <span className="text-neutral-300 dark:text-neutral-700">•</span>
            <time dateTime={post.publishedAt || undefined}>{publishedDate}</time>
          </>
        )}
        <span className="text-neutral-300 dark:text-neutral-700">•</span>
        <span>{post.readingTime} min read</span>
      </div>

      {/* Featured image */}
      {post.featuredImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-800">
          <Image
            src={post.featuredImage}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
      )}
    </header>
  )
}
