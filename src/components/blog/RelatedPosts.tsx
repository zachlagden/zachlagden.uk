import Link from "next/link";
import Image from "next/image";
import type { SerializedPost } from "@/models/Post";

interface RelatedPostsProps {
  posts: SerializedPost[];
}

export function RelatedPosts({ posts }: RelatedPostsProps) {
  if (posts.length === 0) {
    return null;
  }

  return (
    <section className="mt-16 border-t border-zinc-800 pt-8">
      <h2 className="mb-6 font-heading text-2xl font-bold text-text-primary">
        Related Posts
      </h2>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post._id}
            href={`/blog/${post.slug}`}
            className="group block"
          >
            <article className="h-full overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:border-cyan-500/20">
              {/* Thumbnail */}
              {post.featuredImage && (
                <div className="relative aspect-video overflow-hidden bg-zinc-800">
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
                  <div className="mb-2 flex flex-wrap gap-1">
                    {post.categories.slice(0, 2).map((category) => (
                      <span
                        key={category}
                        className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                )}

                {/* Title */}
                <h3 className="font-heading font-semibold text-zinc-100 transition-colors group-hover:text-cyan-500 line-clamp-2">
                  {post.title}
                </h3>

                {/* Meta */}
                <p className="mt-2 font-mono text-xs text-zinc-600">
                  {post.readingTime} min read
                </p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </section>
  );
}
