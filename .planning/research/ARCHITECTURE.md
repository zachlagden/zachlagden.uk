# Architecture Research

**Research Date:** 2026-01-21
**Focus:** Blog routes, MongoDB data layer, GitHub OAuth, dark mode theming, projects showcase integration with existing Next.js 15 App Router architecture

## Executive Summary

The existing portfolio is a single-page application using Next.js 15 App Router with a client-side orchestration pattern (`HomeClient.tsx`). Adding blog routes, authentication, database layer, and dark mode requires extending this architecture while preserving the content-driven, props-based component pattern already established.

**Key Architectural Decision:** The new features should use a **parallel architecture** -- the blog and projects become additional route trees alongside the existing home page, sharing layout components but with their own data sources (MongoDB for blog, GitHub API for projects).

## Current Architecture Analysis

### Existing Component Hierarchy

```
RootLayout (Server)
  └── SmoothScrollProvider (Client)
        └── Page Routes
              ├── / (Home)
              │     └── HomeClient (Client orchestrator)
              │           ├── Header
              │           ├── Navigation
              │           ├── Sections (dynamically imported)
              │           └── Footer
              └── /blog, /projects (NEW)
```

### Current Data Flow

```
content.json (static file)
       │
       ▼
serverContentLoader.ts (Server)
       │
       ▼
page.tsx (Server Component)
       │
       ▼ (props)
HomeClient.tsx (Client Component)
       │
       ▼ (props drilling)
All child components
```

### Current Technology Stack

| Layer | Technology | Version |
|-------|------------|---------|
| Framework | Next.js | 15.3.8 |
| React | React | 19.1.4 |
| Styling | Tailwind CSS | 4.1.10 |
| Animations | Framer Motion | 12.23.26 |
| Smooth Scroll | Lenis | 1.3.16 |
| Forms | Formspree | 3.0.0 |
| Monitoring | Sentry | 10.31.0 |

## Integration Points

### Existing -> New Connections

| Existing Component | Integration Point | How It Connects |
|--------------------|-------------------|-----------------|
| **RootLayout** | Theme Provider | Wrap children with ThemeProvider for dark mode |
| **RootLayout** | Session Provider | Wrap children with SessionProvider for auth |
| **Header** | Navigation Links | Add Blog/Projects links to header |
| **Footer** | Navigation Links | Add Blog/Projects links to footer |
| **Navigation** | Route Awareness | Extend to support page-level nav (not just sections) |
| **globals.css** | CSS Variables | Add dark mode color variables |
| **SmoothScrollProvider** | Multi-page Support | Already works across routes (no change needed) |
| **content.json** | Projects Data Source | Can extend to include projects OR use GitHub API |

### New -> Existing Dependencies

| New Component | Depends On |
|---------------|------------|
| BlogLayout | RootLayout, ThemeProvider, Footer |
| BlogPost | Section component pattern, animation utilities |
| ProjectCard | SkillCategory pattern, AboutCard pattern |
| ThemeToggle | Header (placement), existing button patterns |
| AdminLayout | Auth session, Header, Footer |

## New Components Needed

### Core Infrastructure

| Component | Location | Purpose | Pattern Reference |
|-----------|----------|---------|-------------------|
| **ThemeProvider** | `src/components/providers/` | Wraps app with next-themes | Follows SmoothScrollProvider pattern |
| **ThemeToggle** | `src/components/ui/` | Toggle button for theme | Follows SocialIcon pattern |
| **SessionProvider** | `src/components/providers/` | Auth.js session context | Follows SmoothScrollProvider pattern |

### Blog Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **BlogCard** | `src/components/blog/` | Post preview card for listing |
| **BlogContent** | `src/components/blog/` | Renders MDX/Markdown content (sanitized) |
| **BlogHeader** | `src/components/blog/` | Post title, date, tags |
| **BlogNav** | `src/components/blog/` | Blog-specific navigation (categories, tags) |
| **AdminEditor** | `src/components/admin/` | Markdown editor for posts |
| **AdminPostList** | `src/components/admin/` | CRUD list for managing posts |

### Projects Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **ProjectCard** | `src/components/projects/` | Individual project display |
| **ProjectGrid** | `src/components/projects/` | Grid layout for projects |
| **ProjectFilter** | `src/components/projects/` | Filter by technology/type |

### Layout Components

| Component | Location | Purpose |
|-----------|----------|---------|
| **PageHeader** | `src/components/layout/` | Reusable page header (not full-screen like home) |
| **PageLayout** | `src/components/layout/` | Standard page wrapper for blog/projects |

## Data Flow

### Blog Data Flow

```
MongoDB Atlas
     │
     ▼
API Route Handlers (/api/blog/*)
     │
     ├── GET /api/blog → List posts (paginated)
     ├── GET /api/blog/[slug] → Single post
     ├── POST /api/blog → Create (auth required)
     ├── PUT /api/blog/[slug] → Update (auth required)
     └── DELETE /api/blog/[slug] → Delete (auth required)
     │
     ▼
Server Components (fetch in RSC)
     │
     ├── /blog/page.tsx (list view)
     │     └── Fetches posts, renders BlogCard[]
     │
     └── /blog/[slug]/page.tsx (detail view)
           └── Fetches single post, renders BlogContent
```

**MongoDB Schema (Blog Posts):**
```typescript
interface BlogPost {
  _id: ObjectId;
  slug: string;           // URL-friendly identifier
  title: string;
  content: string;        // Markdown content
  excerpt: string;        // Preview text
  coverImage?: string;    // Optional hero image
  tags: string[];
  published: boolean;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;       // GitHub user ID
}
```

### Auth Flow (GitHub OAuth)

```
User clicks "Sign In"
     │
     ▼
/api/auth/signin (Auth.js route)
     │
     ▼
GitHub OAuth redirect
     │
     ▼
/api/auth/callback/github
     │
     ▼
Auth.js creates session (JWT or database)
     │
     ▼
Session available via:
  - Server: auth() function
  - Client: useSession() hook
```

**Auth Configuration (auth.ts):**
```typescript
// Root level auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [GitHub],
  callbacks: {
    authorized: async ({ auth, request: { nextUrl } }) => {
      const isAdmin = nextUrl.pathname.startsWith("/blog/new") ||
                      nextUrl.pathname.includes("/edit");
      if (isAdmin && !auth) return false;
      return true;
    }
  }
})
```

### Theme Flow (Dark Mode)

```
User preference detection (initial load)
     │
     ├── Check localStorage (user override)
     ├── Check system preference (prefers-color-scheme)
     └── Default to light
     │
     ▼
ThemeProvider sets data-theme attribute on <html>
     │
     ▼
CSS Variables respond to [data-theme="dark"]
     │
     ▼
Tailwind dark: variant applies styles
```

**CSS Variables Approach (Tailwind v4):**
```css
/* globals.css addition */
:root {
  --background: 250 250 250;      /* Light: neutral-50 */
  --foreground: 17 17 17;         /* Light: neutral-900 */
  --card: 255 255 255;
  --card-foreground: 17 17 17;
  /* ... more variables */
}

[data-theme="dark"] {
  --background: 10 10 10;         /* Dark: neutral-950 */
  --foreground: 250 250 250;      /* Dark: neutral-50 */
  --card: 23 23 23;               /* Dark: neutral-900 */
  --card-foreground: 250 250 250;
  /* ... more variables */
}

@variant dark (&:where([data-theme="dark"] *));
```

### Projects Data Flow

**Option A: GitHub API (Recommended)**
```
GitHub API (public repos)
     │
     ▼
Server Component fetches on render
     │
     ▼
/projects/page.tsx
     └── Fetches repos from zachlagden/*, Lagden-Development/*
     └── Filters by topics/stars
     └── Renders ProjectCard[]
```

**Option B: content.json Extension**
```
content.json (projects array)
     │
     ▼
serverContentLoader.ts
     │
     ▼
/projects/page.tsx
     └── Uses static project data
```

**Recommendation:** Use GitHub API for automatic updates when repos change, with fallback to static data if API fails.

## File Structure Changes

### New Directories

```
src/
├── app/
│   ├── (home)/                    # Route group for home page
│   │   └── page.tsx               # Move current page.tsx here
│   ├── blog/
│   │   ├── page.tsx               # Blog listing
│   │   ├── [slug]/
│   │   │   └── page.tsx           # Individual post
│   │   ├── new/
│   │   │   └── page.tsx           # Create post (auth required)
│   │   └── [slug]/
│   │       └── edit/
│   │           └── page.tsx       # Edit post (auth required)
│   ├── projects/
│   │   └── page.tsx               # Projects listing
│   └── api/
│       ├── auth/
│       │   └── [...nextauth]/
│       │       └── route.ts       # Auth.js handlers
│       └── blog/
│           ├── route.ts           # GET (list), POST (create)
│           └── [slug]/
│               └── route.ts       # GET, PUT, DELETE
├── components/
│   ├── blog/
│   │   ├── BlogCard.tsx
│   │   ├── BlogContent.tsx
│   │   ├── BlogHeader.tsx
│   │   └── BlogNav.tsx
│   ├── projects/
│   │   ├── ProjectCard.tsx
│   │   ├── ProjectGrid.tsx
│   │   └── ProjectFilter.tsx
│   ├── admin/
│   │   ├── AdminEditor.tsx
│   │   └── AdminPostList.tsx
│   └── providers/
│       └── ThemeProvider.tsx      # NEW
├── lib/
│   ├── db/
│   │   ├── mongodb.ts             # MongoDB connection singleton
│   │   └── models/
│   │       └── post.ts            # Post model/schema
│   └── github.ts                  # GitHub API helpers
└── types/
    ├── blog.ts                    # Blog post types
    └── project.ts                 # Project types

(root)
├── auth.ts                        # Auth.js configuration
└── middleware.ts                  # Auth middleware for protected routes
```

### Modified Files

| File | Modification |
|------|--------------|
| `src/app/layout.tsx` | Add ThemeProvider, SessionProvider wrappers |
| `src/app/globals.css` | Add dark mode CSS variables, @variant dark |
| `src/components/layout/Header.tsx` | Add ThemeToggle, Blog/Projects links |
| `src/components/layout/Footer.tsx` | Add Blog/Projects links |
| `src/components/layout/Navigation.tsx` | Support page-level navigation |
| `src/types/content.ts` | Extend to optionally include projects |
| `package.json` | Add next-auth, mongodb, next-themes dependencies |

## Suggested Build Order

Based on dependencies and integration complexity:

### Phase 1: Theme Infrastructure (Foundation)
**Why first:** Affects all pages, isolated change, no external dependencies

1. Install `next-themes`
2. Create `ThemeProvider` component
3. Update `globals.css` with CSS variables
4. Update `layout.tsx` to wrap with ThemeProvider
5. Create `ThemeToggle` component
6. Add to Header

**Risk:** Low. Isolated change that doesn't break existing functionality.

### Phase 2: Database & Auth Infrastructure (Foundation)
**Why second:** Required before blog can store/retrieve data

1. Set up MongoDB Atlas cluster
2. Install `mongodb` package
3. Create connection singleton (`lib/db/mongodb.ts`)
4. Install `next-auth` (v5 beta)
5. Create `auth.ts` configuration
6. Create `api/auth/[...nextauth]/route.ts`
7. Create `middleware.ts` for route protection
8. Create `SessionProvider` component
9. Update `layout.tsx` to wrap with SessionProvider

**Risk:** Medium. External service dependency. Auth.js v5 still in beta.

### Phase 3: Blog Routes (Core Feature)
**Why third:** Uses infrastructure from Phase 2

1. Create blog type definitions
2. Create Post model/schema
3. Create API route handlers (CRUD)
4. Create `blog/page.tsx` (listing)
5. Create `blog/[slug]/page.tsx` (detail)
6. Create BlogCard, BlogContent components
7. Test public blog functionality

**Risk:** Medium. First real data-driven feature.

### Phase 4: Blog Admin (Protected Feature)
**Why fourth:** Extends Phase 3 with auth-protected mutations

1. Create admin components (editor, list)
2. Create `blog/new/page.tsx`
3. Create `blog/[slug]/edit/page.tsx`
4. Protect routes with middleware
5. Add auth state to Header (show admin links when logged in)

**Risk:** Low-Medium. Builds on established patterns.

### Phase 5: Projects Showcase (Enhancement)
**Why fifth:** Independent of blog, can proceed in parallel after Phase 1

1. Create project type definitions
2. Create GitHub API helper
3. Create `projects/page.tsx`
4. Create ProjectCard, ProjectGrid components
5. Add Projects link to navigation

**Risk:** Low. GitHub API is well-documented and reliable.

### Phase 6: Navigation Unification (Polish)
**Why last:** Refinement after all routes exist

1. Update Navigation to support page-level nav
2. Add consistent breadcrumbs
3. Update Header for multi-page awareness
4. Ensure smooth transitions between pages

**Risk:** Low. Refinement of existing patterns.

## Architectural Patterns to Follow

### Server Component Default

Keep the existing pattern: **Server Components by default, Client Components when necessary.**

```typescript
// blog/page.tsx (Server Component)
import { getPosts } from "@/lib/db/posts";
import BlogCard from "@/components/blog/BlogCard";

export default async function BlogPage() {
  const posts = await getPosts(); // Server-side data fetching
  return (
    <div>
      {posts.map(post => <BlogCard key={post.slug} post={post} />)}
    </div>
  );
}
```

### Props-Driven Components

Continue the established pattern of passing content as props:

```typescript
// BlogCard receives data as props, not fetching internally
interface BlogCardProps {
  post: BlogPost;
}

const BlogCard: React.FC<BlogCardProps> = ({ post }) => {
  // Render only, no data fetching
};
```

### Reusable Section Pattern

Blog posts can use the existing `Section` component pattern:

```typescript
// BlogContent.tsx
import Section from "@/components/ui/Section";
import { FileText } from "lucide-react";

const BlogContent: React.FC<BlogContentProps> = ({ post }) => {
  return (
    <Section
      id="post-content"
      title={post.title}
      icon={<FileText className="w-6 h-6" />}
    >
      {/* Use a Markdown renderer library like react-markdown for safe rendering */}
      <article className="prose">
        <ReactMarkdown>{post.content}</ReactMarkdown>
      </article>
    </Section>
  );
};
```

### Animation Consistency

Use existing animation utilities:

```typescript
import { sectionAnimation } from "@/utils/animationUtils";

// Apply same animations to blog/project cards
<motion.div
  initial="hidden"
  whileInView="visible"
  variants={sectionAnimation}
>
```

## Anti-Patterns to Avoid

### 1. Client-Side Data Fetching for Blog

**Wrong:**
```typescript
"use client";
export default function BlogPage() {
  const [posts, setPosts] = useState([]);
  useEffect(() => {
    fetch('/api/blog').then(r => r.json()).then(setPosts);
  }, []);
}
```

**Right:** Use Server Components with async/await.

### 2. Mixing Auth in Components

**Wrong:**
```typescript
const BlogCard = ({ post }) => {
  const session = await auth(); // Auth check in every card
  return session?.user?.isAdmin ? <EditButton /> : null;
}
```

**Right:** Handle auth at the page level, pass capabilities as props.

### 3. Direct MongoDB Calls in Components

**Wrong:**
```typescript
import { MongoClient } from 'mongodb';
const BlogPage = async () => {
  const client = new MongoClient(process.env.MONGODB_URI);
  await client.connect();
  // ...
}
```

**Right:** Use a connection singleton and repository pattern.

### 4. Hardcoded Dark Mode Colors

**Wrong:**
```typescript
<div className="bg-white dark:bg-gray-900">
```

**Right:** Use CSS variables for theme-aware colors:
```typescript
<div className="bg-[rgb(var(--background))]">
// Or with Tailwind utility class mapped to variable
<div className="bg-background">
```

### 5. Rendering User-Generated Content Unsafely

**Wrong:**
```typescript
<div dangerouslySetInnerHTML={{ __html: userContent }} />
```

**Right:** Use a safe Markdown renderer or sanitize HTML:
```typescript
import ReactMarkdown from 'react-markdown';
<ReactMarkdown>{post.content}</ReactMarkdown>
// Or sanitize with DOMPurify if HTML is needed
```

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Auth.js v5 breaking changes | Medium | High | Pin to specific beta version, monitor releases |
| MongoDB cold starts on serverless | Medium | Medium | Use connection pooling, consider Vercel Edge |
| Theme flicker on load | Low | Low | Use `next-themes` with suppressHydrationWarning |
| Navigation state confusion | Low | Medium | Clear URL-based state, avoid client routing conflicts |
| Content migration | N/A | N/A | Starting fresh, no legacy content |
| XSS via blog content | Low | High | Use react-markdown or sanitize all user content |

## Dependencies to Add

```json
{
  "dependencies": {
    "next-auth": "5.0.0-beta.25",
    "mongodb": "^6.3.0",
    "next-themes": "^0.4.6",
    "react-markdown": "^9.0.0"
  },
  "devDependencies": {
    "@types/mongodb": "^4.0.7"
  }
}
```

## Environment Variables Required

```env
# MongoDB
MONGODB_URI=mongodb+srv://...

# Auth.js
AUTH_SECRET=generated-secret
AUTH_GITHUB_ID=github-oauth-client-id
AUTH_GITHUB_SECRET=github-oauth-client-secret

# Optional: Admin allow-list
ADMIN_GITHUB_IDS=zachlagden
```

## Sources

- [Next.js Route Handlers Documentation](https://nextjs.org/docs/app/getting-started/route-handlers)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)
- [Tailwind CSS Dark Mode Documentation](https://tailwindcss.com/docs/dark-mode)
- [Things About Web Development - Dark Mode with Tailwind v4](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs)
- [How to Set Up Next.js 15 with NextAuth v5](https://codevoweb.com/how-to-set-up-next-js-15-with-nextauth-v5/)
- [MongoDB Integration with Next.js](https://www.mongodb.com/developer/languages/javascript/nextjs-with-mongodb/)
- [Next.js App Router Best Practices](https://medium.com/@livenapps/next-js-15-app-router-a-complete-senior-level-guide-0554a2b820f7)

## Confidence Assessment

| Area | Confidence | Rationale |
|------|------------|-----------|
| File Structure | HIGH | Based on official Next.js App Router documentation |
| Blog Data Flow | HIGH | Standard pattern verified with official docs |
| Auth Integration | MEDIUM | Auth.js v5 still in beta, API may change |
| Theme Implementation | HIGH | Tailwind v4 approach verified with multiple sources |
| Build Order | HIGH | Based on clear dependency analysis |
| MongoDB Integration | MEDIUM | Common pattern, but serverless considerations apply |
