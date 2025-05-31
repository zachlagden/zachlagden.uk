import type { MetadataRoute } from "next";
import { loadContentServer } from "@/utils/serverContentLoader";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await loadContentServer();
  return [
    {
      url: content.metadata.siteUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
