# Phase 5: Blog Admin - Research

**Researched:** 2026-01-23
**Domain:** Next.js admin CRUD with rich text editing
**Confidence:** HIGH

## Summary

Blog admin interfaces in Next.js 15 App Router follow a standard pattern: Next.js Server Actions for CRUD operations with Zod validation, client-side rich text editors lazy-loaded with `next/dynamic`, and path-based cache revalidation after mutations.

For MDX editing specifically, the ecosystem has converged on two mature solutions: **MDXEditor** (@mdxeditor/editor) for WYSIWYG editing with component support, and **Tiptap** with its Markdown extension for a lighter, more customizable approach. Both require `{ssr: false}` to prevent hydration errors.

The architecture follows a three-tier pattern already established in this codebase: database operations through MongoDB client, server-side validation and authorization via DAL functions (`requireAdmin()`), and client components for interactive UI with proper lazy loading.

**Primary recommendation:** Use **Tiptap with Markdown extension** for a lightweight, flexible solution that matches the existing tech stack (React 19, Next.js 15, TypeScript). Tiptap's modular architecture keeps bundle sizes small, its Markdown extension provides bidirectional conversion (matching the existing `content: string` field storing MDX), and it has official Next.js App Router documentation with proper SSR handling. Lazy load with `next/dynamic` and `{ssr: false}`, validate with Zod schemas in Server Actions, and revalidate `/blog` paths after mutations.

## Standard Stack

The established libraries/tools for Next.js admin interfaces with rich text editing:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next/dynamic | Built-in | Lazy loading heavy components | Official Next.js solution, composite of React.lazy + Suspense |
| Server Actions | Built-in | Form handling and mutations | Next.js 15 standard for CRUD, eliminates API routes |
| Zod | 3.x | Schema validation | De facto standard for TypeScript validation in Next.js ecosystem |
| Tiptap | Latest | Rich text editing | 12.8M monthly downloads, modular, official Next.js support |
| @tiptap/extension-markdown | Latest | Markdown support | Bidirectional Markdown <-> JSON conversion |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| reading-time | 1.x | Calculate read duration | Already in project dependencies (used in OG images) |
| DOMPurify | 3.x | HTML sanitization | XSS prevention when rendering user-supplied content |
| useActionState | Built-in React 19 | Form state management | Handle validation errors, pending states |
| revalidatePath | Built-in | Cache invalidation | Clear cached pages after CRUD operations |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Tiptap | MDXEditor (@mdxeditor/editor) | 851KB gzipped vs ~50KB; WYSIWYG vs toolbar; JSX component editing vs markdown-only; slower initial load but richer features |
| Tiptap | @uiw/react-md-editor | 4.6KB gzipped; simpler but Next.js SSR issues requiring dynamic imports; less customizable |
| Zod | Valibot / ArkType | Smaller bundle size but less ecosystem maturity |
| Server Actions | API Routes | More boilerplate, no progressive enhancement, outdated pattern |

**Installation:**
```bash
npm install @tiptap/react @tiptap/pm @tiptap/starter-kit @tiptap/extension-markdown zod
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── blog/
│       ├── new/
│       │   └── page.tsx           # Create post page (requireAdmin)
│       └── [slug]/
│           └── edit/
│               └── page.tsx       # Edit post page (requireAdmin)
├── components/
│   └── blog/
│       ├── PostEditor.tsx         # Lazy-loaded Tiptap wrapper (client)
│       └── PostForm.tsx           # Form wrapper with validation (client)
├── lib/
│   ├── actions/
│   │   └── posts.ts               # Server Actions (createPost, updatePost, deletePost)
│   └── blog/
│       ├── posts.ts               # Data access (already exists)
│       └── validation.ts          # Zod schemas
```

### Pattern 1: Lazy-Loaded Editor Component
**What:** Client component using `next/dynamic` to load Tiptap only when needed
**When to use:** All rich text editors to prevent blocking initial page load
**Example:**
```typescript
// Source: https://tiptap.dev/docs/editor/getting-started/install/nextjs
// components/blog/PostEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Markdown from '@tiptap/extension-markdown'

export function PostEditor({ initialContent, onChange }: Props) {
  const editor = useEditor({
    extensions: [StarterKit, Markdown],
    content: initialContent,
    contentType: 'markdown',
    immediatelyRender: false, // Critical for Next.js SSR
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown())
    }
  })

  return <EditorContent editor={editor} />
}
```

```typescript
// app/blog/new/page.tsx (Server Component)
import dynamic from 'next/dynamic'

const PostEditor = dynamic(() =>
  import('@/components/blog/PostEditor').then(mod => mod.PostEditor),
  { ssr: false }
)
```

### Pattern 2: Server Action with Zod Validation
**What:** Server-side validation and authorization before database mutations
**When to use:** All create/update/delete operations
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/forms
// lib/actions/posts.ts
'use server'

import { z } from 'zod'
import { requireAdmin } from '@/lib/dal'
import { revalidatePath } from 'next/cache'
import { calculateReadingTime } from '@/lib/blog/posts'
import clientPromise from '@/lib/db'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  slug: z.string().min(1, 'Slug is required').regex(/^[a-z0-9-]+$/),
  excerpt: z.string().min(1, 'Excerpt is required'),
  content: z.string().min(1, 'Content is required'),
  categories: z.array(z.string()).min(1),
  tags: z.array(z.string()),
  featuredImage: z.string().url('Must be valid URL'),
  published: z.boolean()
})

export async function createPost(prevState: any, formData: FormData) {
  // Authorization
  await requireAdmin()

  // Validation
  const validated = postSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    categories: JSON.parse(formData.get('categories') as string),
    tags: JSON.parse(formData.get('tags') as string),
    featuredImage: formData.get('featuredImage'),
    published: formData.get('published') === 'true'
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  // Database mutation
  const client = await clientPromise
  const db = client.db('zachlagden-uk')
  const collection = db.collection('posts')

  await collection.insertOne({
    ...validated.data,
    author: 'Zach Lagden',
    previous_slugs: [],
    readingTime: calculateReadingTime(validated.data.content),
    publishedAt: validated.data.published ? new Date() : null,
    updatedAt: new Date(),
    createdAt: new Date()
  })

  // Cache invalidation
  revalidatePath('/blog')
  revalidatePath('/')

  return { success: true }
}
```

### Pattern 3: Form with useActionState
**What:** Client component managing form state and Server Action invocation
**When to use:** All forms with validation and error display
**Example:**
```typescript
// Source: https://nextjs.org/docs/app/guides/forms
// components/blog/PostForm.tsx
'use client'

import { useActionState } from 'react'
import { createPost } from '@/lib/actions/posts'

export function PostForm() {
  const [state, formAction, pending] = useActionState(createPost, null)

  return (
    <form action={formAction}>
      <input type="text" name="title" required />
      {state?.errors?.title && <p>{state.errors.title}</p>}

      {/* More fields */}

      <button disabled={pending}>
        {pending ? 'Saving...' : 'Save Post'}
      </button>
    </form>
  )
}
```

### Pattern 4: Image Upload Handler
**What:** Server Action accepting File objects from FormData
**When to use:** Featured images, MDX embedded images
**Example:**
```typescript
// Source: https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions
'use server'

export async function uploadImage(formData: FormData) {
  await requireAdmin()

  const file = formData.get('file') as File

  // Validate file type
  if (!file.type.startsWith('image/')) {
    return { error: 'Must be an image' }
  }

  // Validate file size (e.g., 5MB limit)
  if (file.size > 5 * 1024 * 1024) {
    return { error: 'File too large (max 5MB)' }
  }

  // Save to public/images/blog or upload to CDN
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const filename = `${Date.now()}-${file.name}`

  // Write to public directory or upload to cloud storage
  // Return URL
  return { url: `/images/blog/${filename}` }
}
```

### Anti-Patterns to Avoid
- **Editor in Server Components:** Rich text editors use browser APIs; they must be client components with `{ssr: false}`
- **Skipping authorization in Server Actions:** Always call `requireAdmin()` at the top of mutation functions; Server Actions are public HTTP endpoints
- **Validation only on client:** Client validation is easily bypassed; always validate in Server Actions
- **Forgetting revalidatePath:** After creating/updating posts, must revalidate `/blog` and `/` to clear cached lists
- **Using React.lazy directly:** Use `next/dynamic` instead; it's optimized for Next.js and handles both app and pages directories

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| Markdown parsing/rendering | Custom regex parser | Tiptap Markdown extension or next-mdx-remote | Markdown has 30+ edge cases (nested lists, code blocks, escaping); existing solutions handle them |
| Slug generation | String.replace chains | `slugify` npm package or similar | Unicode handling, transliteration, deduplication logic already solved |
| Reading time calculation | Word count / 200 | `reading-time` package | Already in dependencies; handles CJK characters, code blocks |
| Form validation | Manual checks | Zod schemas | Type inference, error messages, nested validation, async rules |
| Rich text toolbar | Custom buttons | Tiptap's StarterKit or UI components | Keyboard shortcuts, accessibility, undo/redo, proper state management |
| XSS sanitization | Blacklist approach | DOMPurify (if rendering user HTML) | Constantly updated for new bypass techniques; whitelist-based |
| Image optimization | Manual resizing | Next.js Image component | Automatic format conversion, lazy loading, responsive sizes |
| Draft/publish workflow | Boolean flag only | Boolean + publishedAt timestamp | Enables sorting by publish date, scheduling, audit trail |

**Key insight:** Rich text editing and content management have been solved problems since 2020. Modern editors like Tiptap are battle-tested with thousands of edge cases handled. Focus on integration and business logic, not reimplementing editor features.

## Common Pitfalls

### Pitfall 1: Hydration Errors with Rich Text Editors
**What goes wrong:** Editor renders on server, client receives different output, React throws hydration mismatch
**Why it happens:** Editors use `window`, `document`, and other browser-only APIs that don't exist during SSR
**How to avoid:**
- Always use `next/dynamic` with `{ssr: false}` for editor components
- Set `immediatelyRender: false` in Tiptap's `useEditor` config
- Initialize plugins client-side only (not in module scope)
**Warning signs:** Console errors mentioning "Hydration failed" or "Text content does not match" when editor loads

### Pitfall 2: Treating Server Actions as Secure Without Validation
**What goes wrong:** Assuming Server Actions are private because they're in server files; attackers can call them directly with crafted payloads
**Why it happens:** Server Actions create public HTTP endpoints; client code can be inspected to find endpoint IDs
**How to avoid:**
- Call `requireAdmin()` at the top of every mutation Server Action
- Validate all inputs with Zod schemas, never trust FormData directly
- Treat Server Actions with same security rigor as API routes
**Warning signs:** No authorization checks in Server Action functions; validation only in client code

### Pitfall 3: Forgetting Cache Revalidation After Mutations
**What goes wrong:** Creating a post succeeds, but `/blog` still shows old list because it's cached
**Why it happens:** Next.js aggressively caches pages; mutations don't automatically invalidate related caches
**How to avoid:**
- Call `revalidatePath('/blog')` after any post creation/update/deletion
- Call `revalidatePath('/')` if home page shows recent posts
- Use `revalidatePath(`/blog/${slug}`)` when editing specific posts
- Call revalidation **before** `redirect()` (redirect throws and stops execution)
**Warning signs:** Changes not appearing after save; requiring manual refresh to see updates

### Pitfall 4: Incorrect Slug Handling on Updates
**What goes wrong:** User changes post slug, old URL breaks, no redirects configured
**Why it happens:** Forgetting to save previous slug for redirect support
**How to avoid:**
- When slug changes, append old slug to `previous_slugs` array
- Use existing `getPostByPreviousSlug()` function in catch-all route
- Validate new slug is unique before updating
**Warning signs:** 404 errors on old URLs after slug changes; SEO links breaking

### Pitfall 5: Large Editor Bundles Blocking Page Load
**What goes wrong:** Admin pages take 3-5 seconds to become interactive because editor JavaScript is massive
**Why it happens:** Not lazy loading editor, or loading it too early in component tree
**How to avoid:**
- Use `next/dynamic` to code-split editor into separate chunk
- Load editor component only when user navigates to create/edit pages
- Consider loading editor on user interaction (click "Edit" button) for extra optimization
**Warning signs:** Lighthouse scores showing large JavaScript bundles; slow Time to Interactive on admin pages

### Pitfall 6: Image Upload Without Size/Type Validation
**What goes wrong:** User uploads 50MB video file as "featured image", server runs out of disk space
**Why it happens:** Accepting File objects without validation in Server Actions
**How to avoid:**
- Validate `file.type` starts with `image/`
- Validate `file.size` is under reasonable limit (e.g., 5MB)
- Note: Next.js Server Actions have 1MB default body size limit (configurable)
- Consider direct-to-CDN uploads for larger files
**Warning signs:** No file validation code in upload Server Actions; error messages about body size limits

### Pitfall 7: MDX Parsing Errors Not Handled
**What goes wrong:** User writes invalid MDX syntax, editor silently fails or throws unhandled error
**Why it happens:** MDX parser can fail on certain content (unclosed tags, invalid JSX)
**How to avoid:**
- For MDXEditor: Pass `onError` callback to get parsing errors
- For Tiptap: Markdown is more forgiving, but validate on server before saving
- Consider preview mode to catch rendering errors before publish
**Warning signs:** Editor becomes empty on certain content; no error feedback to users

### Pitfall 8: Not Respecting Existing DAL Patterns
**What goes wrong:** Directly importing auth() in Server Actions instead of using DAL functions
**Why it happens:** Not reviewing existing codebase patterns before implementing
**How to avoid:**
- Use `requireAdmin()` from `@/lib/dal.ts` (already implemented)
- Use `getOptionalSession()` for conditional admin features
- Follow existing pattern: DAL for auth, separate files for data access
**Warning signs:** Inconsistent authorization patterns; duplicated auth logic

## Code Examples

Verified patterns from official sources:

### Lazy-Loaded Editor (Official Tiptap Pattern)
```typescript
// Source: https://tiptap.dev/docs/editor/getting-started/install/nextjs
// app/blog/new/page.tsx
import dynamic from 'next/dynamic'
import { requireAdmin } from '@/lib/dal'

const PostEditor = dynamic(() =>
  import('@/components/blog/PostEditor').then(mod => mod.PostEditor),
  {
    ssr: false,
    loading: () => <div>Loading editor...</div>
  }
)

export default async function NewPostPage() {
  await requireAdmin() // Server-side auth check

  return (
    <div>
      <h1>Create New Post</h1>
      <PostEditor initialContent="" />
    </div>
  )
}
```

### Tiptap with Markdown Extension (Official Example)
```typescript
// Source: https://tiptap.dev/docs/editor/markdown
// components/blog/PostEditor.tsx
'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Markdown from '@tiptap/extension-markdown'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import { common, createLowlight } from 'lowlight'

const lowlight = createLowlight(common)

export function PostEditor({ initialContent, onChange }: {
  initialContent: string
  onChange: (markdown: string) => void
}) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Markdown,
      CodeBlockLowlight.configure({ lowlight }),
      Image
    ],
    content: initialContent,
    contentType: 'markdown',
    immediatelyRender: false, // Prevent SSR issues
    onUpdate: ({ editor }) => {
      onChange(editor.storage.markdown.getMarkdown())
    }
  })

  if (!editor) return null

  return (
    <div>
      {/* Toolbar */}
      <div className="toolbar">
        <button onClick={() => editor.chain().focus().toggleBold().run()}>
          Bold
        </button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>
          Italic
        </button>
        <button onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
          Code Block
        </button>
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  )
}
```

### Server Action with Full Validation (Official Next.js Pattern)
```typescript
// Source: https://nextjs.org/docs/app/guides/forms
// lib/actions/posts.ts
'use server'

import { z } from 'zod'
import { requireAdmin } from '@/lib/dal'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { ObjectId } from 'mongodb'
import clientPromise from '@/lib/db'
import { calculateReadingTime } from '@/lib/blog/posts'

const postSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, and hyphens'),
  excerpt: z.string().min(10).max(500),
  content: z.string().min(1),
  categories: z.array(z.string()).min(1, 'Select at least one category'),
  tags: z.array(z.string()),
  featuredImage: z.string().url('Must be valid image URL'),
  published: z.boolean()
})

type PostFormState = {
  errors?: z.inferFlattenedErrors<typeof postSchema>['fieldErrors']
  message?: string
}

export async function createPost(
  prevState: PostFormState | null,
  formData: FormData
): Promise<PostFormState> {
  // Authorization
  await requireAdmin()

  // Parse and validate
  const validated = postSchema.safeParse({
    title: formData.get('title'),
    slug: formData.get('slug'),
    excerpt: formData.get('excerpt'),
    content: formData.get('content'),
    categories: JSON.parse(formData.get('categories') as string),
    tags: JSON.parse(formData.get('tags') as string),
    featuredImage: formData.get('featuredImage'),
    published: formData.get('published') === 'true'
  })

  if (!validated.success) {
    return { errors: validated.error.flatten().fieldErrors }
  }

  // Check slug uniqueness
  const client = await clientPromise
  const db = client.db('zachlagden-uk')
  const collection = db.collection('posts')

  const existing = await collection.findOne({ slug: validated.data.slug })
  if (existing) {
    return {
      errors: { slug: ['Slug already exists'] }
    }
  }

  // Insert
  await collection.insertOne({
    ...validated.data,
    _id: new ObjectId(),
    author: 'Zach Lagden',
    previous_slugs: [],
    readingTime: calculateReadingTime(validated.data.content),
    publishedAt: validated.data.published ? new Date() : null,
    updatedAt: new Date(),
    createdAt: new Date()
  })

  // Revalidate before redirect
  revalidatePath('/blog')
  revalidatePath('/')

  redirect('/blog')
}
```

### Client Form with useActionState (Official Next.js Pattern)
```typescript
// Source: https://nextjs.org/docs/app/guides/forms
// components/blog/PostForm.tsx
'use client'

import { useActionState } from 'react'
import dynamic from 'next/dynamic'
import { createPost } from '@/lib/actions/posts'

const PostEditor = dynamic(() =>
  import('./PostEditor').then(m => m.PostEditor),
  { ssr: false }
)

export function PostForm() {
  const [state, formAction, pending] = useActionState(createPost, null)

  return (
    <form action={formAction} className="space-y-6">
      <div>
        <label htmlFor="title">Title</label>
        <input
          type="text"
          name="title"
          id="title"
          required
        />
        {state?.errors?.title && (
          <p className="text-red-600">{state.errors.title[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="slug">Slug</label>
        <input
          type="text"
          name="slug"
          id="slug"
          pattern="[a-z0-9-]+"
          required
        />
        {state?.errors?.slug && (
          <p className="text-red-600">{state.errors.slug[0]}</p>
        )}
      </div>

      <div>
        <label htmlFor="content">Content</label>
        <PostEditor
          initialContent=""
          onChange={(md) => {
            // Store in hidden input for form submission
            const input = document.querySelector<HTMLInputElement>('input[name="content"]')
            if (input) input.value = md
          }}
        />
        <input type="hidden" name="content" required />
        {state?.errors?.content && (
          <p className="text-red-600">{state.errors.content[0]}</p>
        )}
      </div>

      {/* More fields... */}

      <div>
        <label>
          <input type="checkbox" name="published" value="true" />
          Publish immediately
        </label>
      </div>

      <button type="submit" disabled={pending}>
        {pending ? 'Saving...' : 'Save Post'}
      </button>
    </form>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| API Routes for mutations | Server Actions | Next.js 13 (2023) | Eliminates boilerplate; progressive enhancement; automatic serialization |
| React.lazy | next/dynamic | Next.js 9 (2019) | Better SSR handling; works in both app and pages directories |
| Custom validation | Zod schemas | ~2021 | Type inference; better DX; standardized error format |
| Draft.js / Slate | Tiptap / Lexical | ~2021-2022 | Modern React patterns; better performance; active maintenance |
| useFormState | useActionState | React 19 (2024) | Renamed for clarity; same functionality |
| Custom markdown parsers | Tiptap Markdown extension | ~2022 | Bidirectional conversion; handles edge cases; maintained |

**Deprecated/outdated:**
- **API Routes for mutations:** Server Actions are now standard in Next.js 15; API routes add unnecessary complexity
- **Draft.js:** Facebook-maintained editor; no longer actively developed; use Tiptap or Lexical instead
- **react-markdown-editor-lite:** No commits in 2+ years; security risk
- **Manual FormData parsing:** Use Zod for type-safe validation instead
- **useFormState:** Renamed to useActionState in React 19

## Open Questions

Things that couldn't be fully resolved:

1. **Image Storage Strategy**
   - What we know: Can upload to `/public/images/blog` or cloud storage (S3, Cloudinary)
   - What's unclear: Project has no cloud storage configured; budget/preference unknown
   - Recommendation: Start with `/public` directory for MVP; migrate to CDN if needed

2. **MDX Component Support**
   - What we know: Post model stores MDX content; Tiptap Markdown extension doesn't parse JSX components
   - What's unclear: Are custom MDX components required for Phase 5, or just markdown?
   - Recommendation: Start with pure markdown (Tiptap); if JSX components needed, switch to MDXEditor or add custom JSX button to Tiptap

3. **Code Block Language Selection**
   - What we know: Requirement ADMIN-07 specifies language selection; CodeBlockLowlight extension supports it
   - What's unclear: UI pattern for language dropdown in editor toolbar
   - Recommendation: Use Tiptap's BubbleMenu or FloatingMenu for language picker when code block is selected

4. **Slug Auto-Generation**
   - What we know: Slug must be URL-safe; `slugify` package exists
   - What's unclear: Should slug auto-generate from title, or manual entry only?
   - Recommendation: Auto-generate on title change, allow manual override (common CMS pattern)

5. **Image Upload from Editor**
   - What we know: MDXEditor has `imageUploadHandler` prop; Tiptap Image extension can use custom upload
   - What's unclear: Inline upload during editing vs separate featured image field?
   - Recommendation: Separate featured image field (required); add inline image upload in Phase 6 if needed

## Sources

### Primary (HIGH confidence)
- Tiptap Next.js Documentation - https://tiptap.dev/docs/editor/getting-started/install/nextjs
- Tiptap Markdown Extension - https://tiptap.dev/docs/editor/markdown
- Next.js Forms & Server Actions - https://nextjs.org/docs/app/guides/forms
- Next.js Lazy Loading - https://nextjs.org/docs/app/guides/lazy-loading
- Next.js Updating Data & Revalidation - https://nextjs.org/docs/app/getting-started/updating-data
- Next.js Data Security - https://nextjs.org/docs/app/guides/data-security
- MDXEditor Documentation - https://mdxeditor.dev/editor/docs/getting-started
- MDXEditor GitHub - https://github.com/mdx-editor/editor

### Secondary (MEDIUM confidence)
- Strapi Next.js 15 File Upload Tutorial - https://strapi.io/blog/epic-next-js-15-tutorial-part-5-file-upload-using-server-actions
- Vercel Next.js Security Blog - https://nextjs.org/blog/security-nextjs-server-components-actions
- FreeCodecamp Zod Forms Guide - https://www.freecodecamp.org/news/handling-forms-nextjs-server-actions-zod/
- MDX Best Practices - https://www.mdxblog.io/blog/mdx-best-practices-and-common-pitfalls
- 5 Best Markdown Editors for React (Strapi) - https://strapi.io/blog/top-5-markdown-editors-for-react

### Tertiary (LOW confidence)
- Medium: Building Real-Time Editor with MDXEditor - https://medium.com/@Krishna_Rati/building-a-real-time-editor-in-next-js-with-mdxeditor-a-step-by-step-guide-32d3df9ec72
- Medium: Tiptap Best Practices - https://techolyze.com/open/blog/best-rich-text-markdown-editor-tiptap-react-nextjs/
- Syncfusion: React Rich Text XSS Prevention - https://www.syncfusion.com/blogs/post/react-rich-text-editor-xss-prevention
- Medium: Next.js Advanced Patterns 2026 - https://medium.com/@beenakumawat002/next-js-app-router-advanced-patterns-for-2026-server-actions-ppr-streaming-edge-first-b76b1b3dcac7

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Tiptap, Zod, Server Actions verified via official documentation
- Architecture: HIGH - Patterns match official Next.js 15 guides; lazy loading verified
- Pitfalls: HIGH - Hydration, authorization, cache revalidation well-documented issues
- Image upload: MEDIUM - File upload Server Actions verified, but storage strategy project-specific
- MDX components: LOW - Unclear if JSX components in markdown are required for this phase

**Research date:** 2026-01-23
**Valid until:** ~2026-02-23 (30 days - stable ecosystem, mature libraries)
