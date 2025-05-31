import { loadContentServer } from "@/utils/serverContentLoader";
import HomeClient from "./HomeClient";

export default async function Home() {
  const content = await loadContentServer();

  return <HomeClient content={content} />;
}
