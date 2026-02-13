import { getAllPosts } from "@/lib/blog/posts";
import { BlogAdmin } from "@/components/admin/BlogAdmin";

export const metadata = {
  title: "Blog",
};

export default async function AdminBlogPage() {
  const posts = await getAllPosts();

  return <BlogAdmin posts={posts} />;
}
