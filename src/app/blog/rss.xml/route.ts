import { Feed } from 'feed'
import { getPublishedPosts } from '@/lib/blog/posts'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zachlagden.uk'
const SITE_NAME = 'Zach Lagden'
const SITE_DESCRIPTION = 'Technical articles about web development, TypeScript, React, and more.'

export async function GET() {
  const posts = await getPublishedPosts({ limit: 50 })

  const feed = new Feed({
    title: `${SITE_NAME} Blog`,
    description: SITE_DESCRIPTION,
    id: `${SITE_URL}/blog`,
    link: `${SITE_URL}/blog`,
    language: 'en',
    image: `${SITE_URL}/og-default.png`,
    favicon: `${SITE_URL}/favicon.ico`,
    copyright: `All rights reserved ${new Date().getFullYear()}, ${SITE_NAME}`,
    feedLinks: {
      rss: `${SITE_URL}/blog/rss.xml`,
    },
    author: {
      name: SITE_NAME,
      link: SITE_URL,
    },
  })

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `${SITE_URL}/blog/${post.slug}`,
      link: `${SITE_URL}/blog/${post.slug}`,
      description: post.excerpt,
      content: post.excerpt, // Full content would be too large for RSS; excerpt is standard
      date: new Date(post.publishedAt ?? post.createdAt),
      image: post.featuredImage,
      category: post.categories.map(cat => ({ name: cat })),
      author: [{ name: post.author }],
    })
  })

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
