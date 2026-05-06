import type { MetadataRoute } from "next";
import { loadContentServer } from "@/utils/serverContentLoader";
import { getAllPublishedSlugsWithDates } from "@/lib/blog";

// Stable per-process timestamp for static pages — avoids "modified just
// now" on every sitemap fetch that defeats search engine change signals.
// Set BUILD_DATE in CI/Docker if you want true build-time stamping.
const BUILD_DATE = process.env.BUILD_DATE
  ? new Date(process.env.BUILD_DATE)
  : new Date();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadContentServer();
  const siteUrl = content.metadata.siteUrl;

  let posts: Array<{ slug: string; updatedAt: Date }> = [];
  try {
    posts = await getAllPublishedSlugsWithDates();
  } catch (err) {
    console.error(
      "[sitemap] Failed to load blog slugs+dates from MongoDB:",
      err,
    );
  }

  const blogPostUrls: MetadataRoute.Sitemap = posts.map(
    ({ slug, updatedAt }) => ({
      url: `${siteUrl}/blog/${slug}`,
      lastModified: updatedAt,
      changeFrequency: "weekly",
      priority: 0.7,
    }),
  );

  return [
    {
      url: siteUrl,
      lastModified: BUILD_DATE,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: BUILD_DATE,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPostUrls,
  ];
}
