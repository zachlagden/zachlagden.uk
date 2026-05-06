import { getPublishedPosts } from "@/lib/blog";
import { loadContentServer } from "@/utils/serverContentLoader";
import type { BlogPost } from "@/types/blog";

export const dynamic = "force-dynamic";

export async function GET() {
  const content = await loadContentServer();
  const siteUrl = content.metadata.siteUrl;

  let posts: BlogPost[] = [];
  try {
    ({ posts } = await getPublishedPosts(1, 20));
  } catch (err) {
    console.error("[blog/feed] Failed to load posts from MongoDB:", err);
  }

  const items = posts
    .map(
      (post) => `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${siteUrl}/blog/${post.slug}</link>
      <guid isPermaLink="true">${siteUrl}/blog/${post.slug}</guid>
      <description><![CDATA[${post.excerpt}]]></description>
      <pubDate>${post.publishedAt ? new Date(post.publishedAt).toUTCString() : ""}</pubDate>
      ${post.tags.map((t) => `<category>${t}</category>`).join("\n      ")}
    </item>`,
    )
    .join("");

  const feed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${content.personal.name} - Blog</title>
    <link>${siteUrl}/blog</link>
    <description>Thoughts on development, technology, and building things.</description>
    <language>en-gb</language>
    <atom:link href="${siteUrl}/blog/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;

  return new Response(feed.trim(), {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
