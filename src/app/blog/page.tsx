import { Metadata } from "next";
import { getPublishedPosts, getAllTags } from "@/lib/blog";
import { serializePost } from "@/types/blog";
import BlogListClient from "./BlogListClient";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Thoughts on development, technology, and building things by Zach Lagden.",
};

export const dynamic = "force-dynamic";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; tag?: string }>;
}) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const tag = params.tag || undefined;

  let result = { posts: [], total: 0, page, totalPages: 0 } as Awaited<
    ReturnType<typeof getPublishedPosts>
  >;
  let tags: string[] = [];
  try {
    [result, tags] = await Promise.all([
      getPublishedPosts(page, 10, tag),
      getAllTags(),
    ]);
  } catch (err) {
    console.error("[blog] Failed to load posts from MongoDB:", err);
  }

  return (
    <BlogListClient
      initialPosts={result.posts.map(serializePost)}
      initialTotal={result.total}
      initialPage={result.page}
      initialTotalPages={result.totalPages}
      tags={tags}
      activeTag={tag}
    />
  );
}
