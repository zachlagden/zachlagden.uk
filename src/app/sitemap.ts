import type { MetadataRoute } from "next";
import { loadContentServer } from "@/utils/serverContentLoader";
import { getPublishedPosts } from "@/lib/blog/posts";

// Force dynamic rendering - sitemap includes blog posts from database
export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadContentServer();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: content.metadata.siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${content.metadata.siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];

  // Blog posts
  const posts = await getPublishedPosts({ limit: 1000 });
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${content.metadata.siteUrl}/blog/${post.slug}`,
    lastModified: new Date(post.updatedAt),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticPages, ...blogPages];
}
