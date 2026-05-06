import { NextResponse } from "next/server";
import { getAllTags } from "@/lib/blog";

export async function GET() {
  const tags = await getAllTags();
  return NextResponse.json(tags);
}
