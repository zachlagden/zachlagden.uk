import { Suspense } from "react";
import { searchPosts } from "@/lib/blog/search";
import { getAllCategories, getAllTags } from "@/lib/blog/posts";
import { PostCard } from "@/components/blog/PostCard";
import { SearchFilter } from "@/components/blog/SearchFilter";
import { CategoryPills } from "@/components/blog/CategoryPills";
import { EmptyState } from "@/components/blog/EmptyState";

// Force dynamic rendering - blog content comes from database
export const dynamic = "force-dynamic";

interface BlogPageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    tag?: string;
  }>;
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  // Await searchParams (Next.js 15 Promise-based API)
  const params = await searchParams;

  // Parse search parameters
  const query = params.q;
  const categories = params.category?.split(",").filter(Boolean) || [];
  const tags = params.tag?.split(",").filter(Boolean) || [];

  // Fetch filtered posts and filter options in parallel
  const [posts, allCategories, allTags] = await Promise.all([
    searchPosts({
      query,
      categories: categories.length > 0 ? categories : undefined,
      tags: tags.length > 0 ? tags : undefined,
      limit: 50,
    }),
    getAllCategories(),
    getAllTags(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="py-24 sm:py-32">
        <h1 className="font-heading text-5xl font-bold text-text-primary sm:text-6xl">
          Blog
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          Technical articles, tutorials, and insights on web development, React,
          TypeScript, and more.
        </p>
      </div>

      {/* Search */}
      <div className="mb-8">
        <Suspense
          fallback={
            <div className="h-12 animate-pulse rounded-lg bg-zinc-900" />
          }
        >
          <SearchFilter />
        </Suspense>
      </div>

      {/* Category/Tag Filters */}
      <div className="mb-10">
        <Suspense
          fallback={
            <div className="h-10 animate-pulse rounded-lg bg-zinc-900" />
          }
        >
          <CategoryPills categories={allCategories} tags={allTags} />
        </Suspense>
      </div>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid gap-6 pb-24 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, index) => (
            <PostCard key={post._id} post={post} index={index} />
          ))}
        </div>
      ) : (
        <div className="pb-24">
          <EmptyState
            query={query}
            categories={categories}
            tags={tags}
            availableCategories={allCategories}
          />
        </div>
      )}
    </div>
  );
}
