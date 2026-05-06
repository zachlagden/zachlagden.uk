import { NextRequest, NextResponse } from "next/server";
import { getPublishedPosts, createPost } from "@/lib/blog";
import { auth } from "@/lib/auth";
import { serializePost } from "@/types/blog";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "10");
  const tag = searchParams.get("tag") || undefined;
  const search = searchParams.get("search") || undefined;

  const result = await getPublishedPosts(page, limit, tag, search);

  return NextResponse.json({
    posts: result.posts.map(serializePost),
    total: result.total,
    page: result.page,
    totalPages: result.totalPages,
  });
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user?.isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json();
  const post = await createPost(body, {
    name: session.user.name || "Admin",
    githubUsername: session.user.githubUsername || "",
    avatar: session.user.image || undefined,
  });

  return NextResponse.json(serializePost(post), { status: 201 });
}
