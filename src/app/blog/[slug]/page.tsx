import { notFound, redirect } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getPostBySlug, getPostByPreviousSlug, getRelatedPosts } from '@/lib/blog/posts'
import { generatePostMetadata, generateArticleJsonLd } from '@/lib/blog/metadata'
import { extractHeadings } from '@/lib/blog/toc'
import { getOptionalSession } from '@/lib/dal'
import { getCommentsByPostId } from '@/lib/dal/comments'
import { getUserReaction, getReactionCount } from '@/lib/dal/reactions'
import { PostHeader } from '@/components/blog/PostHeader'
import { PostContent } from '@/components/blog/PostContent'
import { MDXContent } from '@/components/blog/MDXContent'
import { TableOfContents } from '@/components/blog/TableOfContents'
import { CommentSection } from '@/components/blog/CommentSection'
import { ReactionButton } from '@/components/blog/ReactionButton'
import { RelatedPosts } from '@/components/blog/RelatedPosts'

interface PostPageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  return generatePostMetadata(post)
}

export default async function PostPage({ params }: PostPageProps) {
  const { slug } = await params

  // Try to get post by current slug
  const post = await getPostBySlug(slug)

  // If not found, check if this is a previous slug (redirect support)
  if (!post) {
    const redirectPost = await getPostByPreviousSlug(slug)
    if (redirectPost) {
      redirect(`/blog/${redirectPost.slug}`)
    }
    notFound()
  }

  // Extract headings for table of contents
  const headings = extractHeadings(post.content)

  // Generate JSON-LD structured data
  const jsonLd = generateArticleJsonLd(post)

  // Check if user is admin for edit/delete controls
  const session = await getOptionalSession()
  const isAdmin = session?.user?.role === 'admin'

  // Fetch engagement data in parallel
  const [comments, reactionCount, relatedPosts] = await Promise.all([
    getCommentsByPostId(post._id),
    getReactionCount(post._id),
    getRelatedPosts(post._id, post.tags, post.categories, 3),
  ])

  // Check if current user has reacted (only if authenticated)
  const isAuthenticated = !!session?.user
  let userLiked = false
  if (isAuthenticated && session.user.id) {
    userLiked = await getUserReaction(post._id, session.user.id)
  }

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd }}
      />

      <div className="min-h-screen bg-white dark:bg-neutral-950">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid lg:grid-cols-[1fr_250px] gap-12">
            {/* Main Content */}
            <div className="max-w-3xl">
              <PostHeader post={post} isAdmin={isAdmin} />

              {/* Reaction Button */}
              <div className="mb-8">
                <ReactionButton
                  postId={post._id}
                  initialLiked={userLiked}
                  initialCount={reactionCount}
                  isAuthenticated={isAuthenticated}
                />
              </div>

              <PostContent>
                <MDXContent content={post.content} />
              </PostContent>

              {/* Tags */}
              {post.tags.length > 0 && (
                <div className="mt-12 pt-8 border-t border-neutral-200 dark:border-neutral-800">
                  <h3 className="text-sm font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {post.tags.map((tag) => (
                      <Link
                        key={tag}
                        href={`/blog?tag=${encodeURIComponent(tag)}`}
                        className="text-xs px-3 py-1 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              <CommentSection
                postId={post._id}
                comments={comments}
                isAuthenticated={isAuthenticated}
                isAdmin={isAdmin}
              />

              {/* Related Posts */}
              <RelatedPosts posts={relatedPosts} />
            </div>

            {/* Table of Contents Sidebar */}
            <TableOfContents headings={headings} />
          </div>
        </div>
      </div>
    </>
  )
}
