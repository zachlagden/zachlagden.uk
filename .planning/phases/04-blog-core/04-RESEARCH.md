# Phase 4: Blog Core - Research

**Researched:** 2026-01-21
**Domain:** Next.js 15 blog implementation with MongoDB, MDX, and comprehensive SEO
**Confidence:** HIGH

## Summary

Researched the technical requirements for building a blog with Next.js 15 App Router, MongoDB for post storage, MDX for content authoring, and comprehensive SEO features. The standard approach combines Next.js's built-in metadata APIs, the official @next/mdx package, MongoDB with full-text search indexes, and established rehype/remark plugins for markdown processing.

Next.js 15 App Router provides native support for dynamic metadata generation, structured data, and OG image generation through the ImageResponse API. MongoDB offers full-text search capabilities and compound indexes for efficient filtering by categories and tags. The MDX ecosystem (rehype/remark plugins) handles syntax highlighting, table of contents generation, and heading slug generation without requiring custom implementations.

**Primary recommendation:** Use @next/mdx with Next.js 15 App Router for local file-based content, implement MongoDB full-text search indexes for instant search functionality, use rehype-slug + rehype-autolink-headings for TOC generation, and leverage Next.js built-in generateMetadata API for SEO rather than third-party solutions.

## Standard Stack

The established libraries/tools for Next.js 15 blog implementation:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| @next/mdx | 16.1.x | MDX processing in Next.js | Official Next.js package, optimized for App Router with Server Components |
| @mdx-js/loader | 3.1.x | Webpack loader for MDX | Required peer dependency for @next/mdx |
| @mdx-js/react | 3.1.x | React MDX runtime | Required for component rendering in MDX |
| feed | 5.2.0 | RSS/Atom/JSON feed generation | Most robust RSS package, strongly typed, actively maintained (200+ dependents) |
| reading-time | latest | Calculate reading time | Industry standard (160+ dependents), Medium-like estimation |
| schema-dts | 1.1.5 | TypeScript types for Schema.org | Official Google package, zero runtime cost, type-safe structured data |

### Supporting (Rehype/Remark Plugins)
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| rehype-slug | latest | Add IDs to headings | Required for TOC generation and anchor links |
| rehype-autolink-headings | latest | Add self-links to headings | GitHub-style heading anchors |
| rehype-highlight | latest | Code syntax highlighting | Alternative to Shiki, uses highlight.js with 37 languages bundled |
| rehype-prism-plus | latest | Prism-based highlighting | Alternative with line numbers and line highlighting |
| remark-toc | latest | Generate TOC in markdown | For GitHub README-style TOCs in markdown |
| @microflash/rehype-toc | latest | Generate TOC in HTML | For runtime TOC generation with rehype |
| rehype-sanitize | latest | Sanitize HTML output | Security: prevent XSS through DOM clobbering |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| @next/mdx | next-mdx-remote-client | More complexity, only needed for remote content sources |
| rehype-highlight | react-shiki | react-shiki has built-in GitHub light/dark themes, better for GitHub-style highlighting |
| feed | rss | Less robust, only RSS (no Atom/JSON Feed), smaller feature set |
| MongoDB text search | MongoDB Atlas Search | Atlas Search has faceting and advanced ranking, but requires Atlas hosting |

**Installation:**
```bash
pnpm add @next/mdx @mdx-js/loader @mdx-js/react feed reading-time schema-dts
pnpm add rehype-slug rehype-autolink-headings rehype-sanitize
pnpm add -D @types/mdx
```

**For syntax highlighting (choose one):**
```bash
# Option 1: GitHub-style with theme support
pnpm add react-shiki

# Option 2: Traditional highlight.js
pnpm add rehype-highlight
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   ├── blog/
│   │   ├── page.tsx                    # Blog listing with filters
│   │   ├── [slug]/
│   │   │   ├── page.tsx                # Individual post page
│   │   │   └── opengraph-image.tsx     # Dynamic OG image generation
│   │   └── rss.xml/
│   │       └── route.ts                # RSS feed route handler
│   └── mdx-components.tsx              # Global MDX component overrides
├── components/
│   ├── blog/
│   │   ├── PostCard.tsx                # Blog post card for listing
│   │   ├── PostContent.tsx             # Post content renderer
│   │   ├── TableOfContents.tsx         # Sticky TOC sidebar
│   │   ├── SearchFilter.tsx            # Instant search + filters
│   │   └── CategoryPills.tsx           # Category/tag pills
│   └── syntax/
│       └── CodeBlock.tsx               # Syntax-highlighted code component
├── lib/
│   ├── blog/
│   │   ├── posts.ts                    # Post fetching/querying logic
│   │   ├── search.ts                   # MongoDB full-text search
│   │   └── metadata.ts                 # Blog SEO metadata helpers
│   └── mongodb.ts                      # MongoDB connection (from Phase 3)
└── models/
    └── Post.ts                         # Post schema and model
```


### Pattern 1: Dynamic Metadata Generation

**What:** Use `generateMetadata` to create dynamic SEO metadata for each blog post based on route params

**When to use:** For all dynamic blog post pages ([slug]/page.tsx)

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/generate-metadata
import type { Metadata, ResolvingMetadata } from 'next'
import { getPostBySlug } from '@/lib/blog/posts'

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return {}

  const previousImages = (await parent).openGraph?.images || []

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      images: [post.imageUrl, ...previousImages],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [post.imageUrl],
    },
  }
}
```

### Pattern 2: MongoDB Full-Text Search with Filtering

**What:** Compound indexes that combine text search with category/tag equality filters

**When to use:** When implementing instant search with category/tag filtering

**Example:**
```typescript
// Source: https://www.mongodb.com/docs/manual/text-search/
// Create compound index: category + full-text + tags
db.posts.createIndex({
  category: 1,
  title: "text",
  content: "text",
  excerpt: "text",
  tags: 1
}, {
  name: "blog_search_index",
  weights: {
    title: 10,
    excerpt: 5,
    content: 1
  }
})

// Query with filters
const posts = await db.posts.find({
  $text: { $search: query },
  category: { $in: selectedCategories },
  tags: { $in: selectedTags },
  published: true
}, {
  score: { $meta: "textScore" }
}).sort({
  score: { $meta: "textScore" }
}).toArray()
```

### Pattern 3: URL State Management with useSearchParams

**What:** Maintain filter and search state in URL query params for shareability

**When to use:** For blog listing page with filters and search

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/api-reference/functions/use-search-params
'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { Suspense } from 'react'

function SearchFilters() {
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const router = useRouter()

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div>
      <input
        placeholder="Search posts..."
        onChange={(e) => updateFilters('q', e.target.value)}
        defaultValue={searchParams.get('q') || ''}
      />
    </div>
  )
}

// MUST wrap in Suspense for static pages
export function SearchBar() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchFilters />
    </Suspense>
  )
}
```

### Pattern 4: Dynamic OG Image Generation

**What:** Use ImageResponse API to generate unique OG images per blog post

**When to use:** For blog post social sharing previews

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/getting-started/metadata-and-og-images
// app/blog/[slug]/opengraph-image.tsx
import { ImageResponse } from 'next/og'
import { getPostBySlug } from '@/lib/blog/posts'

export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  if (!post) return null

  return new ImageResponse(
    (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: '100%',
        padding: '80px',
        backgroundColor: '#000',
        color: '#fff',
      }}>
        <h1 style={{ fontSize: 72 }}>{post.title}</h1>
        <p style={{ fontSize: 36, color: '#888' }}>{post.excerpt}</p>
      </div>
    ),
    { ...size }
  )
}
```

### Pattern 5: JSON-LD Structured Data

**What:** Render Article schema as script tag with XSS prevention

**When to use:** For all blog post pages to support Google rich results

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/json-ld
import { WithContext, Article } from 'schema-dts'

export default async function BlogPost({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)

  const jsonLd: WithContext<Article> = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    image: post.imageUrl,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: {
      '@type': 'Person',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'Zach Lagden',
      logo: {
        '@type': 'ImageObject',
        url: 'https://zachlagden.uk/logo.png',
      },
    },
  }

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c'),
        }}
      />
      {/* Post content */}
    </article>
  )
}
```


### Pattern 6: RSS Feed Generation

**What:** Route handler that generates RSS XML using the feed package

**When to use:** For /blog/rss.xml endpoint

**Example:**
```typescript
// Source: https://github.com/jpmonette/feed
import { Feed } from 'feed'
import { getAllPublishedPosts } from '@/lib/blog/posts'

export async function GET() {
  const posts = await getAllPublishedPosts()

  const feed = new Feed({
    title: 'Zach Lagden Blog',
    description: 'Technical blog posts about web development',
    id: 'https://zachlagden.uk/blog',
    link: 'https://zachlagden.uk/blog',
    language: 'en',
    image: 'https://zachlagden.uk/logo.png',
    favicon: 'https://zachlagden.uk/favicon.ico',
    copyright: `All rights reserved ${new Date().getFullYear()}, Zach Lagden`,
    feedLinks: {
      rss: 'https://zachlagden.uk/blog/rss.xml',
    },
  })

  posts.forEach((post) => {
    feed.addItem({
      title: post.title,
      id: `https://zachlagden.uk/blog/${post.slug}`,
      link: `https://zachlagden.uk/blog/${post.slug}`,
      description: post.excerpt,
      content: post.content,
      date: new Date(post.publishedAt),
      image: post.imageUrl,
    })
  })

  return new Response(feed.rss2(), {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  })
}
```

### Pattern 7: MDX Configuration with Rehype Plugins

**What:** Configure @next/mdx with rehype plugins for TOC, slugs, and syntax highlighting

**When to use:** In next.config.mjs for all MDX processing

**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/mdx
import createMDX from '@next/mdx'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypeHighlight from 'rehype-highlight'
import rehypeSanitize from 'rehype-sanitize'

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  options: {
    rehypePlugins: [
      rehypeSlug,
      rehypeAutolinkHeadings,
      rehypeHighlight,
      rehypeSanitize,
    ],
  },
})

export default withMDX(nextConfig)
```

### Anti-Patterns to Avoid

- **Exporting both metadata object and generateMetadata:** Pick one based on whether content is static or dynamic. Never export both from the same component.
- **Using useSearchParams without Suspense boundary:** Static pages will fail to build during production if useSearchParams is not wrapped in Suspense.
- **Replacing parent metadata instead of extending:** Always spread parent metadata when overriding to avoid losing inherited values like OG images.
- **Not sanitizing JSON-LD payload:** Replace `<` with `\\u003c` to prevent XSS injection through structured data.
- **Using rehype-slug without rehype-sanitize:** Opens XSS vulnerability through DOM clobbering.
- **Creating full-text search without compound indexes:** Performance degrades rapidly; use compound indexes with category/tag equality conditions first.
- **Not memoizing heading extraction for TOC:** Extracting headings on every render is wasteful; compute once during MDX processing or memoize the result.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| RSS feed XML generation | Manual XML string building | feed package | Handles RSS 2.0, Atom 1.0, JSON Feed specs correctly, escapes content properly, prevents malformed XML |
| Reading time calculation | Custom word counting | reading-time package | Accounts for images, code blocks, adjusts for language, matches Medium's algorithm (industry standard) |
| Markdown to HTML with syntax highlighting | Custom markdown parser | @next/mdx + rehype plugins | Handles edge cases (nested code, HTML entities, XSS), integrates with Next.js build process, supports React components |
| Blog post slug generation | Custom slug sanitization | GitHub slugger or rehype-slug | Handles unicode, emoji, collisions, matches GitHub/other platforms for consistency |
| Structured data generation | Manual JSON-LD strings | schema-dts + WithContext | Type-safe, catches schema errors at compile time, follows Schema.org spec exactly |
| OG image generation | Canvas API or external service | Next.js ImageResponse | Built-in, works at edge, caches automatically, supports JSX/CSS syntax, zero external dependencies |
| Full-text search ranking | Custom relevance scoring | MongoDB $text with weights | Field weights, phrase search, negation, relevance scoring (textScore), language stemming built-in |
| Table of contents extraction | Regex heading parsing | rehype-slug + rehype-toc or manual rehype AST walk | Handles nested headings, duplicate text, markdown syntax in headings, generates proper IDs |

**Key insight:** Blog infrastructure has mature, battle-tested solutions. Custom implementations miss edge cases that only appear at scale (unicode slugs, XSS in user content, RSS feed validation errors, SEO schema mistakes). Use established packages that thousands of projects depend on.

## Common Pitfalls

### Pitfall 1: useSearchParams Suspense Boundary Error

**What goes wrong:** During production builds, pages using `useSearchParams` fail with "Missing Suspense boundary" error.

**Why it happens:** If a route is statically rendered, calling useSearchParams() causes the tree up to the closest Suspense boundary to be client-side rendered. Without a Suspense boundary, the build cannot determine what to pre-render.

**How to avoid:** Always wrap components using useSearchParams in a Suspense boundary, even if the component is already marked 'use client'. Extract the search params logic into a separate component and wrap that component.

**Warning signs:**
- Build fails with "useSearchParams() should be wrapped in a suspense boundary"
- Page works in development but fails in production build
- Error mentions "prerendering page"

**Source:** [Next.js useSearchParams Documentation](https://nextjs.org/docs/app/api-reference/functions/use-search-params), [Missing Suspense boundary error](https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout)

### Pitfall 2: MongoDB Full-Text Search Without Indexes

**What goes wrong:** Blog search becomes slow (seconds instead of milliseconds) as post count grows beyond 50-100 posts.

**Why it happens:** MongoDB text search without indexes performs a full collection scan. Each query reads every document, checks every field, and calculates relevance scores. This scales O(n) with collection size.

**How to avoid:** Create text indexes before implementing search UI. For filtered search, use compound indexes with equality conditions (category, published status) before the text index to reduce scanned documents.

**Warning signs:**
- Search queries take >500ms
- MongoDB profiling shows "planSummary: COLLSCAN"
- Search gets slower as you add more posts
- CPU usage spikes during search

**Source:** [MongoDB Text Search Documentation](https://www.mongodb.com/docs/manual/text-search/), [Performance Best Practices: Indexing](https://www.mongodb.com/company/blog/performance-best-practices-indexing)

### Pitfall 3: Slug Collisions and URL Changes

**What goes wrong:** When editing post titles or regenerating slugs, old URLs break. Users get 404s on bookmarked links or shared URLs.

**Why it happens:** Slugs generated from titles can change when titles are edited. Two posts with similar titles can generate identical slugs. No system tracks old slugs for redirects.

**How to avoid:**
1. Store slugs separately from titles; don't auto-generate on every save
2. Create a unique index on slug field in MongoDB
3. Keep a `previous_slugs` array field to track old slugs
4. Implement redirect logic checking previous_slugs before returning 404
5. Consider adding a permanent ID in the URL path (e.g., /blog/123-post-slug) so slug can change without breaking links

**Warning signs:**
- Users report 404s on previously working links
- Duplicate slug errors when creating posts with similar titles
- Analytics show sudden drops in traffic to specific posts
- Social share counts reset when URLs change

**Source:** [MongoDB Recommended practices for slugs](https://www.mongodb.com/community/forums/t/recommended-practices-when-using-human-friendly-slugs-as-identifiers/205504)

### Pitfall 4: Dynamic Route Prefetching Performance

**What goes wrong:** Navigation between blog posts feels sluggish, with noticeable loading delay when clicking links.

**Why it happens:** Next.js 15 App Router cannot prefetch full page content for dynamic routes by default. When routes become dynamic (using [slug]), prefetching only fetches the loading.tsx state, not the actual content. The content loads only after navigation starts.

**How to avoid:**
1. Use loading.tsx with skeleton UI for perceived performance
2. Implement proper caching strategies (Cache-Control headers)
3. Consider edge caching for blog post pages
4. Use static metadata where possible to allow more prefetching
5. Ensure database queries are optimized (<100ms)

**Warning signs:**
- Blank page or loading spinner visible when navigating between posts
- Users comment navigation feels "slow" compared to other sites
- Network tab shows content fetched after navigation, not before
- Time to Interactive (TTI) >1s for blog post pages

**Source:** [Debugging Next.js App Router Navigation Lag](https://dev.to/kcsujeet/debugging-nextjs-app-router-navigation-lag-dynamic-routes-and-prefetching-akk), [Common mistakes with Next.js App Router](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them)

### Pitfall 5: Metadata Not Merging with Parent Layout

**What goes wrong:** Blog posts lose site-wide OpenGraph images, Twitter cards, or other metadata defined in parent layouts.

**Why it happens:** When you export metadata from a page, it completely replaces (not merges) nested objects like openGraph from parent layouts. Only top-level fields merge; nested objects are replaced entirely.

**How to avoid:** In generateMetadata, await the parent ResolvingMetadata and spread its values before overriding specific fields. This preserves inherited metadata while allowing page-specific overrides.

**Warning signs:**
- Social share previews missing site logo or default image
- Twitter cards working on homepage but not blog posts
- Metadata in parent layout.tsx doesn't appear on child pages
- OG image array only has one image instead of multiple

**Source:** [Next.js generateMetadata Documentation](https://nextjs.org/docs/app/api-reference/functions/generate-metadata)


### Pitfall 6: XSS Through JSON-LD Structured Data

**What goes wrong:** User-generated content (if blog accepts comments or contributions) can inject malicious scripts through structured data.

**Why it happens:** Structured data is rendered as a script tag with dangerouslySetInnerHTML. If content contains `</script>` or other HTML, it can break out of the script context and execute arbitrary JavaScript.

**How to avoid:** Always sanitize JSON-LD payload by replacing `<` with its unicode equivalent `\\u003c`. Never trust user input in structured data fields. Use schema-dts for type safety but still sanitize the output.

**Warning signs:**
- Security scanner flags XSS vulnerability
- Social share preview tools show broken metadata
- Script tags appear in page source outside the JSON-LD script
- Browser console shows JavaScript syntax errors

**Source:** [Next.js JSON-LD Documentation](https://nextjs.org/docs/app/guides/json-ld)

### Pitfall 7: MDX Infinite Loops with Dynamic Imports

**What goes wrong:** When using dynamic imports for MDX files based on route params, Next.js enters an infinite loop during build or runtime.

**Why it happens:** Circular dependencies, incorrect module resolution paths, or attempting to dynamically import from non-existent paths without proper error handling.

**How to avoid:**
1. Use static imports where possible
2. Implement proper error boundaries for dynamic imports
3. Validate slug/params before attempting import
4. Use try-catch for dynamic imports with fallback to 404
5. Check that MDX files exist before dynamic import

**Warning signs:**
- Build process hangs or times out
- Browser tab freezes when navigating to blog posts
- Webpack/Turbopack shows "module not found" errors repeatedly
- Memory usage spikes during build

**Source:** Based on Next.js MDX patterns and dynamic import best practices

### Pitfall 8: Cache Policy Issues with Route Handlers

**What goes wrong:** RSS feed shows stale data for hours after new posts are published, or conversely, feed regenerates on every request causing server load.

**Why it happens:** Route handlers default to uncached in Next.js 15. Without explicit Cache-Control headers, CDNs and browsers don't cache. With immutable caching, content never updates.

**How to avoid:** Set appropriate Cache-Control headers for RSS feeds:
- `s-maxage=3600`: Cache at CDN for 1 hour
- `stale-while-revalidate`: Serve stale content while fetching fresh
- Use Next.js revalidate for ISR-like behavior
- Consider time-based revalidation (e.g., revalidate every 15 minutes)

**Warning signs:**
- RSS readers show posts from days ago despite new publications
- Server logs show RSS route handler called hundreds of times
- CDN cache hit rate is 0% for RSS feed
- Analytics show same user requesting RSS multiple times

**Source:** [Next.js 15 caching changes](https://prateeksha.com/blog/nextjs-15-upgrade-guide-app-router-caching-migration)

## Code Examples

Verified patterns from official sources:

### MongoDB Post Schema with Indexes

```typescript
// Source: MongoDB best practices for blog schemas
import { ObjectId } from 'mongodb'

export interface Post {
  _id: ObjectId
  slug: string
  previous_slugs: string[]
  title: string
  excerpt: string
  content: string
  author: string
  category: string[]
  tags: string[]
  featuredImage: string
  published: boolean
  publishedAt: Date
  updatedAt: Date
  readingTime: number
  createdAt: Date
}

// Index creation (run in migration or setup script)
export async function createPostIndexes(db: Db) {
  const posts = db.collection('posts')

  // Unique index on slug
  await posts.createIndex({ slug: 1 }, { unique: true })

  // Index for previous slugs (redirect lookups)
  await posts.createIndex({ previous_slugs: 1 })

  // Compound index for full-text search with filtering
  await posts.createIndex({
    category: 1,
    published: 1,
    title: "text",
    excerpt: "text",
    content: "text"
  }, {
    name: "blog_search_index",
    weights: {
      title: 10,
      excerpt: 5,
      content: 1
    }
  })

  // Index for published posts sorted by date
  await posts.createIndex({ published: 1, publishedAt: -1 })

  // Index for category filtering
  await posts.createIndex({ category: 1, published: 1, publishedAt: -1 })

  // Index for tag filtering
  await posts.createIndex({ tags: 1, published: 1, publishedAt: -1 })
}
```

### Blog Post Query with Search and Filters

```typescript
// Source: MongoDB text search patterns
import { Collection } from 'mongodb'
import type { Post } from './Post'

export async function searchPosts(
  posts: Collection<Post>,
  query: string,
  filters: {
    categories?: string[]
    tags?: string[]
    limit?: number
    offset?: number
  }
) {
  const searchFilter: any = {
    published: true
  }

  // Add text search if query provided
  if (query) {
    searchFilter.$text = { $search: query }
  }

  // Add category filter
  if (filters.categories?.length) {
    searchFilter.category = { $in: filters.categories }
  }

  // Add tag filter
  if (filters.tags?.length) {
    searchFilter.tags = { $in: filters.tags }
  }

  // Build projection for text score
  const projection = query ? { score: { $meta: "textScore" } } : {}

  // Build sort criteria
  const sort: any = query
    ? { score: { $meta: "textScore" }, publishedAt: -1 }
    : { publishedAt: -1 }

  const results = await posts
    .find(searchFilter, { projection })
    .sort(sort)
    .skip(filters.offset || 0)
    .limit(filters.limit || 20)
    .toArray()

  return results
}
```

### Reading Time Calculation

```typescript
// Source: reading-time package
import readingTime from 'reading-time'

export function calculateReadingTime(content: string): number {
  const stats = readingTime(content)
  return Math.ceil(stats.minutes)
}

// Usage when saving/updating post
const post = {
  title: 'My Blog Post',
  content: mdxContent,
  readingTime: calculateReadingTime(mdxContent),
  // ... other fields
}
```

### Server-Side Blog Listing Page with Filters

```typescript
// app/blog/page.tsx
import { Suspense } from 'react'
import { searchPosts, getAllCategories } from '@/lib/blog/posts'
import PostCard from '@/components/blog/PostCard'
import SearchFilter from '@/components/blog/SearchFilter'

type Props = {
  searchParams: Promise<{
    q?: string
    category?: string
    tag?: string
  }>
}

export default async function BlogPage({ searchParams }: Props) {
  const params = await searchParams
  const query = params.q || ''
  const categories = params.category?.split(',') || []
  const tags = params.tag?.split(',') || []

  const posts = await searchPosts(query, { categories, tags })
  const allCategories = await getAllCategories()

  return (
    <div>
      <h1>Blog</h1>

      <Suspense fallback={<div>Loading filters...</div>}>
        <SearchFilter
          initialQuery={query}
          categories={allCategories}
        />
      </Suspense>

      {posts.length === 0 ? (
        <div>
          <p>No posts found.</p>
          <p>Try these categories: {allCategories.join(', ')}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <PostCard key={post.slug} post={post} />
          ))}
        </div>
      )}
    </div>
  )
}
```

### Table of Contents Component

```typescript
// components/blog/TableOfContents.tsx
'use client'

import { useEffect, useState } from 'react'

type Heading = {
  id: string
  text: string
  level: number
}

export function TableOfContents({ content }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    // Extract headings from rendered content
    const elements = document.querySelectorAll('article h2, article h3')
    const extracted = Array.from(elements).map(el => ({
      id: el.id,
      text: el.textContent || '',
      level: parseInt(el.tagName.charAt(1))
    }))
    setHeadings(extracted)

    // Intersection observer for active heading
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      { rootMargin: '-20% 0px -80% 0px' }
    )

    elements.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [content])

  if (headings.length < 3) return null // Only show TOC for longer posts

  return (
    <nav className="sticky top-20">
      <h2 className="text-lg font-semibold mb-4">Table of Contents</h2>
      <ul className="space-y-2">
        {headings.map((heading) => (
          <li
            key={heading.id}
            className={`
              ${heading.level === 3 ? 'ml-4' : ''}
              ${activeId === heading.id ? 'font-bold' : ''}
            `}
          >
            <a
              href={`#${heading.id}`}
              className="hover:underline"
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(heading.id)?.scrollIntoView({
                  behavior: 'smooth'
                })
              }}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| next-mdx-remote | @next/mdx | Next.js 13+ App Router | @next/mdx integrates with Server Components, no runtime, better performance |
| Custom getStaticProps metadata | generateMetadata function | Next.js 13 App Router | Dynamic metadata generation, streaming support, automatic memoization |
| Custom OG image services (Cloudinary, etc) | Next.js ImageResponse API | Next.js 13.3+ | Built-in, edge-optimized, no external dependencies or costs |
| MongoDB Atlas Search only | MongoDB text search indexes | Always available | Text search indexes work without Atlas hosting, adequate for most blogs |
| Cached by default (Pages Router) | Uncached by default (App Router) | Next.js 15 | Must explicitly opt into caching with Cache-Control headers or revalidate |
| rss package | feed package | Active development | feed supports RSS 2.0, Atom 1.0, JSON Feed; more robust and maintained |
| Manual slug generation | rehype-slug + GitHub slugger | Ecosystem maturity | Consistent slug generation matching GitHub/GitLab/other platforms |

**Deprecated/outdated:**
- **next-mdx-remote:** Not well maintained as of 2025, use @next/mdx for local files or next-mdx-remote-client for remote content
- **Automatic prefetching for dynamic routes:** Next.js 15 cannot fully prefetch dynamic content; implement loading states and caching
- **metadata object for dynamic content:** Use generateMetadata function instead; metadata object is for static content only
- **Cached GET route handlers by default:** Next.js 15 changed default to uncached; add explicit caching directives

## Open Questions

Things that couldn't be fully resolved:

1. **react-shiki vs rehype-highlight for syntax highlighting**
   - What we know: react-shiki has built-in GitHub light/dark themes, rehype-highlight is more established in rehype ecosystem
   - What's unclear: Which performs better with Next.js 15 Server Components? Does react-shiki work with @next/mdx plugin pipeline?
   - Recommendation: Test both; if react-shiki works with MDX pipeline, use it for GitHub-style themes. Otherwise, use rehype-highlight with custom GitHub themes.

2. **TOC generation threshold (minimum headings)**
   - What we know: TOC should only show for longer posts
   - What's unclear: Industry standard threshold? 3 headings? 5 headings? Based on reading time?
   - Recommendation: Start with 3 headings minimum, adjust based on user feedback and post length distribution.

3. **Search debounce timing**
   - What we know: Instant search should filter as user types, but not on every keystroke
   - What's unclear: Optimal debounce value balancing responsiveness and server load?
   - Recommendation: 300ms debounce based on UX research standards, but test with actual MongoDB query performance.

4. **MongoDB vs PostgreSQL full-text search performance**
   - What we know: MongoDB full-text search works, has good docs
   - What's unclear: Is PostgreSQL full-text search faster/better for this use case? Project already has MongoDB from auth.
   - Recommendation: Stick with MongoDB (already established in Phase 3), create proper indexes, monitor performance, only migrate if severe issues.

5. **Static vs Dynamic rendering for blog listing page**
   - What we know: Blog listing with search/filters should be dynamic for URL state
   - What's unclear: Should initial load (no filters) be statically generated?
   - Recommendation: Make listing page dynamic since filters are core feature. Use proper caching headers to reduce database load.

## Sources

### Primary (HIGH confidence)

- [Next.js generateMetadata Official Docs](https://nextjs.org/docs/app/api-reference/functions/generate-metadata) - Dynamic metadata API
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx) - Official MDX setup
- [Next.js JSON-LD Guide](https://nextjs.org/docs/app/guides/json-ld) - Structured data implementation
- [Next.js useSearchParams Docs](https://nextjs.org/docs/app/api-reference/functions/use-search-params) - URL state management
- [Next.js OG Images Guide](https://nextjs.org/docs/app/getting-started/metadata-and-og-images) - ImageResponse API
- [MongoDB Text Search Documentation](https://www.mongodb.com/docs/manual/text-search/) - Full-text search
- [MongoDB Performance Best Practices: Indexing](https://www.mongodb.com/company/blog/performance-best-practices-indexing) - Official MongoDB blog
- [rehype-slug GitHub](https://github.com/rehypejs/rehype-slug) - Official rehype plugin
- [rehype-autolink-headings GitHub](https://github.com/rehypejs/rehype-autolink-headings) - Official rehype plugin
- [feed npm package](https://www.npmjs.com/package/feed) - RSS generation (v5.2.0)
- [reading-time npm package](https://www.npmjs.com/package/reading-time) - Reading time calculation
- [schema-dts npm package](https://www.npmjs.com/package/schema-dts) - Schema.org TypeScript types (v1.1.5)

### Secondary (MEDIUM confidence)

- [Common mistakes with Next.js App Router - Vercel](https://vercel.com/blog/common-mistakes-with-the-next-js-app-router-and-how-to-fix-them) - Vercel official blog post
- [Next.js 15 Upgrade Guide](https://prateeksha.com/blog/nextjs-15-upgrade-guide-app-router-caching-migration) - Caching changes
- [Managing Advanced Search Param Filtering](https://aurorascharff.no/posts/managing-advanced-search-param-filtering-next-app-router/) - Real-world implementation
- [MongoDB Recommended practices for slugs](https://www.mongodb.com/community/forums/t/recommended-practices-when-using-human-friendly-slugs-as-identifiers/205504) - MongoDB community forum
- [Debugging Next.js Navigation Lag](https://dev.to/kcsujeet/debugging-nextjs-app-router-navigation-lag-dynamic-routes-and-prefetching-akk) - DEV Community post
- [Next.js with MDX tips: Auto link headings](https://mikebifulco.com/posts/mdx-auto-link-headings-with-rehype-slug) - Developer blog

### Tertiary (LOW confidence)

- [Best Practices for Organizing Next.js 15](https://dev.to/bajrayejoon/best-practices-for-organizing-your-nextjs-15-2025-53ji) - Community article
- [Creating an RSS Feed in Next.js](https://dev.to/promathieuthiry/creating-an-rss-feed-in-your-nextjs-project-20em) - Community tutorial
- [MongoDB Schema Design Best Practices](https://www.geeksforgeeks.org/mongodb/mongodb-schema-design-best-practices-and-techniques/) - GeeksforGeeks article

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All packages from official sources (Next.js, MongoDB, rehype), verified versions on npm
- Architecture: HIGH - Patterns from official Next.js documentation and Vercel blog
- Pitfalls: MEDIUM - Mix of official docs (useSearchParams, metadata) and community reports (navigation lag, caching)
- Code examples: HIGH - All examples derived from official documentation or official package READMEs

**Research date:** 2026-01-21
**Valid until:** 2026-02-21 (30 days - Next.js ecosystem is stable, monthly check recommended)

**Notes:**
- Phase depends on MongoDB connection established in Phase 3 (Auth)
- react-shiki compatibility with @next/mdx needs verification during planning
- Monitor Next.js 15 caching behavior as best practices are still stabilizing
- Consider performance testing with realistic post counts (100+, 1000+)
