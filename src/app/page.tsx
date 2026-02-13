import { getPublishedPosts } from "@/lib/blog/posts";
import HomeClient from "./HomeClient";

export default async function Home() {
  const latestPosts = await getPublishedPosts({ limit: 3 });

  return <HomeClient latestPosts={latestPosts} />;
}
