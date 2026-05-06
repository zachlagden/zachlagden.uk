import AdminSidebar from "@/components/admin/AdminSidebar";
import BlogEditor from "@/components/admin/BlogEditor";

export default function NewPostPage() {
  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8 max-w-4xl">
        <BlogEditor />
      </div>
    </div>
  );
}
