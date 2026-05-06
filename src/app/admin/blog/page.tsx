import { getDb } from "@/lib/mongodb";
import { serializePost } from "@/types/blog";
import type { BlogPost } from "@/types/blog";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminBlogClient from "./AdminBlogClient";

export default async function AdminBlogPage() {
  const db = await getDb();
  const posts = await db
    .collection<BlogPost>("posts")
    .find()
    .sort({ updatedAt: -1 })
    .toArray();

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-4xl">
        <AdminBlogClient posts={(posts as BlogPost[]).map(serializePost)} />
      </div>
    </div>
  );
}
