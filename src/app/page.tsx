import { loadContentServer } from "@/utils/serverContentLoader";
import { getLatestPosts } from "@/lib/blog";
import { serializePost } from "@/types/blog";
import HomeClient from "./HomeClient";

export default async function Home() {
  const content = await loadContentServer();

  let blogPosts: ReturnType<typeof serializePost>[] = [];
  try {
    const posts = await getLatestPosts(3);
    blogPosts = posts.map(serializePost);
  } catch (err) {
    console.error("[home] Failed to load latest posts from MongoDB:", err);
  }

  return <HomeClient content={content} blogPosts={blogPosts} />;
}
