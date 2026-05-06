import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPostBySlug, getAdjacentPosts } from "@/lib/blog";
import { serializePost } from "@/types/blog";
import { loadContentServer } from "@/utils/serverContentLoader";
import BlogPostClient from "./BlogPostClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  const content = await loadContentServer();

  if (!post || post.status !== "published") {
    return { title: "Post Not Found" };
  }

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      authors: [post.author.name],
      tags: post.tags,
      images: post.featuredImage ? [{ url: post.featuredImage }] : undefined,
      url: `${content.metadata.siteUrl}/blog/${post.slug}`,
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : undefined,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const adjacent = post.publishedAt
    ? await getAdjacentPosts(post.publishedAt)
    : { prev: null, next: null };

  const content = await loadContentServer();

  return (
    <BlogPostClient
      post={serializePost(post)}
      prev={adjacent.prev ? serializePost(adjacent.prev) : null}
      next={adjacent.next ? serializePost(adjacent.next) : null}
      siteUrl={content.metadata.siteUrl}
    />
  );
}
