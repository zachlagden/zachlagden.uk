import { requireAdmin } from '@/lib/dal'
import { getAllCategories, getAllTags } from '@/lib/blog/posts'
import { PostForm } from '@/components/blog/PostForm'

export const metadata = {
  title: 'Create New Post | Zach Lagden',
  robots: 'noindex, nofollow', // Admin pages shouldn't be indexed
}

const defaultCategories = [
  'Tutorials',
  'Projects',
  'Deep Dives',
  'Quick Tips',
  'Personal',
]

export default async function NewPostPage() {
  // Server-side admin check - redirects non-admins
  await requireAdmin()

  // Fetch existing categories and tags for suggestions
  const [categories, tags] = await Promise.all([
    getAllCategories(),
    getAllTags(),
  ])

  return (
    <main className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create New Post</h1>
        <p className="text-muted-foreground mt-2">
          Write and publish a new blog post
        </p>
      </div>

      <PostForm
        mode="create"
        availableCategories={
          categories.length > 0 ? categories : defaultCategories
        }
        availableTags={tags}
      />
    </main>
  )
}
