import { Db } from "mongodb";

/**
 * Create all indexes for the posts collection
 * This function should be called at app startup or via a migration script
 *
 * Index strategy:
 * - Unique index on slug for primary lookups
 * - Index on previous_slugs for handling redirects
 * - Compound text search index for filtering by category/published with full-text search
 * - Indexes for common query patterns (published listing, category/tag filtering)
 *
 * @param db - MongoDB database instance
 */
export async function createPostIndexes(db: Db): Promise<void> {
  const posts = db.collection("posts");

  // Unique index on slug (primary lookup)
  await posts.createIndex({ slug: 1 }, { unique: true });

  // Index for previous slugs (redirect lookups)
  await posts.createIndex({ previous_slugs: 1 });

  // Compound index for full-text search with filtering
  // Order matters: equality conditions (published, categories) before text
  await posts.createIndex(
    {
      published: 1,
      categories: 1,
      title: "text",
      excerpt: "text",
      content: "text",
    },
    {
      name: "blog_search_index",
      weights: {
        title: 10, // Title matches ranked highest
        excerpt: 5, // Excerpt matches second
        content: 1, // Content matches lowest
      },
    },
  );

  // Index for published posts sorted by date (listing page)
  await posts.createIndex({ published: 1, publishedAt: -1 });

  // Index for category filtering
  await posts.createIndex({ categories: 1, published: 1, publishedAt: -1 });

  // Index for tag filtering
  await posts.createIndex({ tags: 1, published: 1, publishedAt: -1 });
}
