import Link from 'next/link'
import Image from 'next/image'
import type { SerializedPost } from '@/models/Post'

interface RelatedPostsProps {
  posts: SerializedPost[]
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  // Don't render if no related posts
  if (posts.length === 0) {
    return null
  }

  return (
    <section className="mt-16 pt-8 border-t border-neutral-200 dark:border-neutral-800">
      <h2 className="text-2xl font-bold mb-6 text-neutral-900 dark:text-neutral-100">
        Related Posts
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <article className="h-full rounded-lg border border-neutral-200 dark:border-neutral-800 overflow-hidden hover:border-neutral-300 dark:hover:border-neutral-700 transition-colors">
              {/* Thumbnail */}
              {post.featuredImage && (
                <div className="relative aspect-video">
                  <Image
                    src={post.featuredImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                </div>
              )}

              <div className="p-4">
                {/* Categories */}
                {post.categories.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-2">
                    {post.categories.slice(0, 2).map((category) => (
                      <span
                        key={category}
                        className="text-xs px-2 py-0.5 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-semibold text-neutral-900 dark:text-neutral-100 group-hover:text-neutral-600 dark:group-hover:text-neutral-300 transition-colors line-clamp-2">
                  {post.title}
                </h3>

                {/* Meta */}
                <p className="mt-2 text-xs text-neutral-500 dark:text-neutral-500">
                  {post.readingTime} min read
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  )
}
