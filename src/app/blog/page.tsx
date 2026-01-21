import { Suspense } from "react";
import { searchPosts } from "@/lib/blog/search";
import { getAllCategories, getAllTags } from "@/lib/blog/posts";
import { PostCard } from "@/components/blog/PostCard";
import { SearchFilter } from "@/components/blog/SearchFilter";
import { CategoryPills } from "@/components/blog/CategoryPills";
import { EmptyState } from "@/components/blog/EmptyState";

// Force dynamic rendering - blog content comes from database
export const dynamic = 'force-dynamic';

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

  // Fetch filtered posts
  const posts = await searchPosts({
    query,
    categories: categories.length > 0 ? categories : undefined,
    tags: tags.length > 0 ? tags : undefined,
    limit: 50,
  });

  // Fetch all available categories and tags for filters
  const [allCategories, allTags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ]);

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Blog
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
            Technical articles, tutorials, and insights on web development,
            React, TypeScript, and more.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-[1fr_300px] gap-8">
          {/* Posts Grid */}
          <div>
            {/* Search */}
            <div className="mb-8">
              <Suspense fallback={<div className="h-12 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />}>
                <SearchFilter />
              </Suspense>
            </div>

            {/* Posts */}
            {posts.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-6">
                {posts.map((post) => (
                  <PostCard key={post._id} post={post} />
                ))}
              </div>
            ) : (
              <EmptyState
                query={query}
                categories={categories}
                tags={tags}
                availableCategories={allCategories}
              />
            )}
          </div>

          {/* Sidebar Filters */}
          <aside className="lg:sticky lg:top-8 h-fit">
            <div className="border border-neutral-200 dark:border-neutral-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold mb-4 text-neutral-900 dark:text-neutral-100">
                Filters
              </h2>
              <Suspense fallback={<div className="h-32 bg-neutral-100 dark:bg-neutral-800 rounded animate-pulse" />}>
                <CategoryPills categories={allCategories} tags={allTags} />
              </Suspense>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
