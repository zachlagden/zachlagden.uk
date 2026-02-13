import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/dal";
import {
  getPostBySlugForEdit,
  getAllCategories,
  getAllTags,
} from "@/lib/blog/posts";
import { PostForm } from "@/components/blog/PostForm";

export const metadata = {
  title: "Edit Post | Zach Lagden",
  robots: "noindex, nofollow",
};

const defaultCategories = [
  "Tutorials",
  "Projects",
  "Deep Dives",
  "Quick Tips",
  "Personal",
];

interface EditPostPageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  await requireAdmin();

  const { slug } = await params;
  const [post, categories, tags] = await Promise.all([
    getPostBySlugForEdit(slug),
    getAllCategories(),
    getAllTags(),
  ]);

  if (!post) {
    notFound();
  }

  return (
    <main className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Post</h1>
        <p className="text-muted-foreground mt-2">
          Update &ldquo;{post.title}&rdquo;
        </p>
      </div>

      <PostForm
        mode="edit"
        initialData={{
          id: post._id,
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          categories: post.categories,
          tags: post.tags,
          featuredImage: post.featuredImage,
          published: post.published,
        }}
        availableCategories={categories.length ? categories : defaultCategories}
        availableTags={tags}
      />
    </main>
  );
}
