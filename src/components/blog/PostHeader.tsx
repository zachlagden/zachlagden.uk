import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { DeletePostButton } from './DeletePostButton'
import type { SerializedPost } from '@/models/Post'

interface PostHeaderProps {
  post: SerializedPost
  isAdmin?: boolean
}

export function PostHeader({ post, isAdmin = false }: PostHeaderProps) {
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

      {/* Admin controls */}
      {isAdmin && (
        <div className="flex gap-2 mt-4 pt-4 border-t border-neutral-200 dark:border-neutral-800">
          <Button asChild size="sm" variant="outline">
            <Link href={`/blog/${post.slug}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Link>
          </Button>
          <DeletePostButton postId={post._id} postTitle={post.title} />
        </div>
      )}
    </header>
  )
}
