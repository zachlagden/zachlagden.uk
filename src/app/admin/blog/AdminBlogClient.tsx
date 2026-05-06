"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { PenSquare, Trash2, ExternalLink, Search } from "lucide-react";
import { BlogPostSerialized } from "@/types/blog";

interface AdminBlogClientProps {
  posts: BlogPostSerialized[];
}

export default function AdminBlogClient({ posts }: AdminBlogClientProps) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const filtered = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(search.toLowerCase())),
  );

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setDeleting(id);
    await fetch(`/api/blog/posts/${id}`, { method: "DELETE" });
    setDeleting(null);
    router.refresh();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-heading font-bold">Posts</h1>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
        >
          <PenSquare className="w-4 h-4" />
          New Post
        </Link>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          placeholder="Search posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-sm border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-900"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-neutral-500 text-center py-12">
          {posts.length === 0
            ? "No posts yet. Create your first post!"
            : "No posts match your search."}
        </p>
      ) : (
        <div className="border border-neutral-200 rounded-lg overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-neutral-50 text-left text-xs font-medium text-neutral-500">
                <th className="px-4 py-3">Title</th>
                <th className="px-4 py-3 hidden md:table-cell">Status</th>
                <th className="px-4 py-3 hidden md:table-cell">Date</th>
                <th className="px-4 py-3 w-24">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filtered.map((post) => (
                <tr key={post._id} className="hover:bg-neutral-50">
                  <td className="px-4 py-3">
                    <div>
                      <span className="text-sm font-medium">{post.title}</span>
                      <div className="flex gap-1.5 mt-1 md:hidden">
                        <span
                          className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                            post.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {post.status}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span
                      className={`inline-block text-xs px-2 py-0.5 rounded-full ${
                        post.status === "published"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500 hidden md:table-cell">
                    {new Date(post.updatedAt).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors rounded"
                        title="Edit"
                      >
                        <PenSquare className="w-4 h-4" />
                      </Link>
                      {post.status === "published" && (
                        <Link
                          href={`/blog/${post.slug}`}
                          className="p-1.5 text-neutral-400 hover:text-neutral-700 transition-colors rounded"
                          title="View"
                          target="_blank"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(post._id)}
                        disabled={deleting === post._id}
                        className="p-1.5 text-neutral-400 hover:text-red-600 transition-colors rounded disabled:opacity-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
