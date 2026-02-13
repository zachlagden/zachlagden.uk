import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DeletePostButton } from "./DeletePostButton";
import type { SerializedPost } from "@/models/Post";

interface PostHeaderProps {
  post: SerializedPost;
  isAdmin?: boolean;
}

export function PostHeader({ post, isAdmin = false }: PostHeaderProps) {
  const publishedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <header className="mb-8">
      {/* Back link */}
      <Link
        href="/blog"
        className="mb-6 inline-flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-cyan-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Blog
      </Link>

      {/* Categories */}
      {post.categories.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {post.categories.map((category) => (
            <Link
              key={category}
              href={`/blog?category=${encodeURIComponent(category)}`}
              className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
            >
              {category}
            </Link>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="mb-4 font-heading text-4xl font-bold text-text-primary md:text-5xl">
        {post.title}
      </h1>

      {/* Excerpt */}
      <p className="mb-6 text-lg text-zinc-400">{post.excerpt}</p>

      {/* Meta info */}
      <div className="mb-8 flex flex-wrap items-center gap-4 text-sm text-zinc-500">
        <span>{post.author}</span>
        {publishedDate && (
          <>
            <span className="text-zinc-700">&middot;</span>
            <time
              dateTime={post.publishedAt || undefined}
              className="font-mono"
            >
              {publishedDate}
            </time>
          </>
        )}
        <span className="text-zinc-700">&middot;</span>
        <span className="font-mono">{post.readingTime} min read</span>
      </div>

      {/* Featured image */}
      {post.featuredImage && (
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-zinc-800">
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
        <div className="mt-4 flex gap-2 border-t border-zinc-800 pt-4">
          <Button asChild size="sm" variant="outline">
            <Link href={`/blog/${post.slug}/edit`}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </Link>
          </Button>
          <DeletePostButton postId={post._id} postTitle={post.title} />
        </div>
      )}
    </header>
  );
}
