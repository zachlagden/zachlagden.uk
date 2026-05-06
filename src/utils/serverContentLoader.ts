import { ContentData } from "@/types/content";
import { promises as fs } from "fs";
import path from "path";

export async function loadContentServer(): Promise<ContentData> {
  const contentPath = path.join(process.cwd(), "public", "content.json");
  const contentString = await fs.readFile(contentPath, "utf-8");
  return JSON.parse(contentString) as ContentData;
}
