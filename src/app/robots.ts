import type { MetadataRoute } from "next";
import { loadContentServer } from "@/utils/serverContentLoader";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await loadContentServer();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${content.metadata.siteUrl}/sitemap.xml`,
    host: content.metadata.siteUrl,
  };
}
