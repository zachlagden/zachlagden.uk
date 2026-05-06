import { loadContentServer } from "@/utils/serverContentLoader";
import { getLatestPosts } from "@/lib/blog";
import { serializePost } from "@/types/blog";
import HomeClient from "./HomeClient";
import HomeIntroBootstrap from "@/components/ui/HomeIntroBootstrap";

export default async function Home() {
  const content = await loadContentServer();

  let blogPosts: ReturnType<typeof serializePost>[] = [];
  try {
    const posts = await getLatestPosts(3);
    blogPosts = posts.map(serializePost);
  } catch (err) {
    console.error("[home] Failed to load latest posts from MongoDB:", err);
  }

  return (
    <>
      <div id="initial-loader" aria-hidden="true">
        <div className="loader-dot" />
      </div>
      <HomeIntroBootstrap />
      <HomeClient content={content} blogPosts={blogPosts} />
    </>
  );
}
