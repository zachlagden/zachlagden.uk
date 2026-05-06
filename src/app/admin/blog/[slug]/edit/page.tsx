import { notFound } from "next/navigation";
import { getPostBySlug } from "@/lib/blog";
import { serializePost } from "@/types/blog";
import AdminSidebar from "@/components/admin/AdminSidebar";
import BlogEditor from "@/components/admin/BlogEditor";

export default async function EditPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-4xl">
        <BlogEditor post={serializePost(post)} />
      </div>
    </div>
  );
}
