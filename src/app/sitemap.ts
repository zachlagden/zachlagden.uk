import type { MetadataRoute } from "next";
import { loadContentServer } from "@/utils/serverContentLoader";
import { getAllPublishedSlugs } from "@/lib/blog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadContentServer();
  const siteUrl = content.metadata.siteUrl;

  let slugs: string[] = [];
  try {
    slugs = await getAllPublishedSlugs();
  } catch (err) {
    console.error("[sitemap] Failed to load blog slugs from MongoDB:", err);
  }

  const blogPostUrls: MetadataRoute.Sitemap = slugs.map((slug) => ({
    url: `${siteUrl}/blog/${slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPostUrls,
  ];
}
