import type { MetadataRoute } from "next";
import { getSiteSetting } from "@/lib/content/site";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const siteUrlSetting = await getSiteSetting("siteUrl");
  const siteUrl = (siteUrlSetting?.value as string) || "https://zachlagden.uk";

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
