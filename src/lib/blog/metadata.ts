import type { Metadata } from 'next'
import type { SerializedPost } from '@/models/Post'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://zachlagden.uk'

/**
 * Generate SEO metadata for blog post
 */
export function generatePostMetadata(post: SerializedPost): Metadata {
  const url = `${SITE_URL}/blog/${post.slug}`
  const publishedTime = post.publishedAt || undefined

  return {
    title: post.title,
    description: post.excerpt,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url,
      siteName: 'Zach Lagden',
      type: 'article',
      publishedTime,
      authors: [post.author],
      images: [
        {
          url: post.featuredImage,
          alt: post.title,
        },
      ],
      tags: [...post.categories, ...post.tags],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.featuredImage],
    },
  }
}

/**
 * Generate JSON-LD structured data for Article schema
 * XSS protection: Unicode-escape special characters to prevent script injection
 */
export function generateArticleJsonLd(post: SerializedPost): string {
  const url = `${SITE_URL}/blog/${post.slug}`

  const data = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.featuredImage,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Person',
      name: post.author,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    keywords: [...post.categories, ...post.tags].join(', '),
  }

  // Convert to JSON string and escape for safe HTML embedding
  const jsonString = JSON.stringify(data)

  // Unicode-escape special characters to prevent XSS
  return jsonString.replace(/</g, '\\u003c').replace(/>/g, '\\u003e')
}
