# Phase 7: Projects Showcase - Research

**Researched:** 2026-01-24
**Domain:** Portfolio projects showcase with filtering and GitHub API integration
**Confidence:** HIGH

## Summary

Phase 7 involves creating a projects showcase page at `/projects` with technology-based filtering and optional GitHub repository statistics. The research examined Next.js 15 patterns for filtering, GitHub REST API integration, data storage approaches, and UX best practices for portfolio project displays.

**Key findings:**
- **Data storage**: The project already uses MongoDB for blog posts with a proven data access pattern. Projects should follow the same architecture (MongoDB with DAL pattern) for consistency rather than JSON files, enabling future features like admin CRUD, analytics, and dynamic sorting.
- **Filtering pattern**: The existing blog filtering pattern (URL search params with Server Components) should be reused. `nuqs` library is recommended for type-safe URL state management instead of manual URLSearchParams handling.
- **GitHub stats**: GitHub REST API provides repository stats (stars, forks, commits) with 5,000 req/hour for authenticated users. Use conditional requests with ETags and server-side caching (revalidate every 5-10 minutes) to avoid rate limits.
- **UI components**: shadcn/ui badge component exists and should be installed for technology stack display. The blog's CategoryPills component provides a proven filtering UI pattern to adapt.

**Primary recommendation:** Store projects in MongoDB following the blog's DAL pattern, use nuqs for URL filtering state, fetch GitHub stats server-side with Next.js cache revalidation, and adapt existing blog filtering UI components for consistency.

## Standard Stack

The established libraries/tools for this domain:

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| Next.js | 15.3.8 | Framework | Already used; Server Components ideal for data fetching with filtering |
| MongoDB | 7.0.0 | Database | Already integrated; proven pattern for blog posts |
| nuqs | 2.8.6+ | URL state management | Type-safe alternative to manual URLSearchParams; recommended by Next.js community |
| Octokit | 4.x | GitHub API client | Official GitHub SDK; handles auth, rate limits, typing |
| shadcn/ui Badge | latest | UI component | Design system already in use; badge component for tech stack |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| Zod | 4.3.6 | Schema validation | Already used for blog validation; validate project data |
| class-variance-authority | 0.7.1 | Variant utilities | Already installed; badge variants for tech stack colors |
| date-fns | 4.1.0 | Date formatting | Already used; format project dates |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| MongoDB | JSON files in public/projects.json | JSON simpler for static data but doesn't scale; can't add admin UI, search, or analytics later without migration |
| nuqs | Manual URLSearchParams | Manual approach works but lacks type safety, more boilerplate, and harder to test |
| Octokit | Direct fetch to GitHub API | Possible but Octokit handles auth, rate limits, retries, and provides TypeScript types |
| Server-side GitHub fetching | Client-side with SWR/TanStack Query | Client-side exposes tokens, counts against rate limit per user, slower initial render |

**Installation:**
```bash
pnpm install nuqs octokit
pnpm dlx shadcn@latest add badge
```

## Architecture Patterns

### Recommended Project Structure
```
src/
├── app/
│   └── projects/
│       ├── page.tsx                    # Server Component with filtering
│       ├── loading.tsx                 # Loading skeleton
│       └── layout.tsx                  # Optional projects layout
├── components/
│   └── projects/
│       ├── ProjectCard.tsx             # Individual project display
│       ├── TechnologyFilters.tsx       # Filter UI (adapt from CategoryPills)
│       ├── TechnologyBadge.tsx         # Tech stack badge component
│       ├── GitHubStats.tsx             # Stats display (optional)
│       └── EmptyState.tsx              # No results message
├── lib/
│   ├── projects/
│   │   ├── projects.ts                 # DAL: get, filter, getUniqueTechs
│   │   ├── github.ts                   # GitHub API integration
│   │   └── validation.ts               # Zod schemas (if admin UI later)
│   └── db.ts                           # Already exists
└── models/
    └── Project.ts                      # TypeScript interfaces
```

### Pattern 1: Server Component with URL Filtering
**What:** Server Component reads search params, fetches filtered data, passes to client components
**When to use:** List pages with filtering (blog, projects, any catalog)
**Example:**
```typescript
// Source: Existing blog/page.tsx + Next.js 15 docs
// app/projects/page.tsx
interface ProjectsPageProps {
  searchParams: Promise<{
    tech?: string;  // Comma-separated tech filter
    q?: string;     // Search query (future)
  }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const technologies = params.tech?.split(",").filter(Boolean) || [];

  // Server-side data fetching
  const [projects, allTechnologies] = await Promise.all([
    getProjects({ technologies }),
    getAllTechnologies(),
  ]);

  return (
    <div>
      <TechnologyFilters technologies={allTechnologies} />
      {projects.map(project => <ProjectCard key={project._id} project={project} />)}
    </div>
  );
}
```

### Pattern 2: MongoDB Data Access Layer
**What:** Abstract MongoDB operations behind clean functions
**When to use:** All database interactions (already used for blog)
**Example:**
```typescript
// Source: Existing blog/posts.ts pattern
// lib/projects/projects.ts
import clientPromise from '@/lib/db'

export async function getProjects(options?: {
  technologies?: string[];
  limit?: number;
}) {
  const client = await clientPromise;
  const db = client.db('zachlagden-uk');
  const collection = db.collection('projects');

  const filter: any = { published: true };

  if (options?.technologies?.length) {
    filter.technologies = { $in: options.technologies };
  }

  return collection
    .find(filter)
    .sort({ featured: -1, createdAt: -1 })
    .limit(options?.limit ?? 50)
    .toArray();
}

export async function getAllTechnologies(): Promise<string[]> {
  const client = await clientPromise;
  const db = client.db('zachlagden-uk');
  const collection = db.collection('projects');

  const technologies = await collection.distinct('technologies', { published: true });
  return technologies.sort();
}
```

### Pattern 3: Type-Safe URL Filtering with nuqs
**What:** Use nuqs hooks instead of manual URLSearchParams for type safety
**When to use:** Client components that modify URL filters
**Example:**
```typescript
// Source: https://nuqs.dev/ official docs
"use client";

import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';

export function TechnologyFilters({ technologies }: { technologies: string[] }) {
  const [selectedTech, setSelectedTech] = useQueryState(
    'tech',
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const toggleTech = (tech: string) => {
    setSelectedTech(current =>
      current.includes(tech)
        ? current.filter(t => t !== tech)
        : [...current, tech]
    );
  };

  return technologies.map(tech => (
    <button
      key={tech}
      onClick={() => toggleTech(tech)}
      aria-pressed={selectedTech.includes(tech)}
    >
      {tech}
    </button>
  ));
}
```

### Pattern 4: GitHub Stats with Server-Side Caching
**What:** Fetch GitHub stats in Server Component with Next.js cache revalidation
**When to use:** Displaying live external API data that doesn't change frequently
**Example:**
```typescript
// Source: GitHub REST API docs + Next.js caching docs
// lib/projects/github.ts
import { Octokit } from 'octokit';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN, // Server-side only
});

export async function getRepoStats(owner: string, repo: string) {
  const { data } = await octokit.rest.repos.get({
    owner,
    repo,
  });

  return {
    stars: data.stargazers_count,
    forks: data.forks_count,
    updatedAt: data.pushed_at,
  };
}

// In Server Component:
const stats = await getRepoStats('zachlagden', 'my-project');
// Next.js automatically caches fetch requests; for non-fetch:
// Use unstable_cache or revalidatePath in Server Actions
```

### Pattern 5: Badge Component with Tech-Specific Colors
**What:** Use shadcn/ui Badge with color mapping for technologies
**When to use:** Displaying technology stack visually
**Example:**
```typescript
// Source: shadcn/ui badge docs + shields.io color patterns
// components/projects/TechnologyBadge.tsx
import { Badge } from '@/components/ui/badge';

const TECH_COLORS: Record<string, string> = {
  'TypeScript': 'bg-blue-500 text-white',
  'React': 'bg-cyan-400 text-black',
  'Next.js': 'bg-black text-white',
  'MongoDB': 'bg-green-600 text-white',
  // etc.
};

export function TechnologyBadge({ tech }: { tech: string }) {
  const colorClass = TECH_COLORS[tech] || 'bg-neutral-200 text-neutral-900';

  return (
    <Badge className={colorClass} variant="secondary">
      {tech}
    </Badge>
  );
}
```

### Anti-Patterns to Avoid
- **Client-side data fetching for initial render:** Slower, worse SEO, more complex. Use Server Components for initial data.
- **Exposing GitHub tokens to client:** Security risk. Always fetch GitHub stats server-side.
- **Manual URLSearchParams manipulation:** Error-prone, verbose. Use nuqs for type safety.
- **Storing projects in JSON when MongoDB exists:** Forces future migration when adding admin UI or dynamic features.
- **Polling GitHub API without caching:** Quickly hits rate limits. Use Next.js cache with 5-10 minute revalidation.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| URL search param state management | Custom useState + useEffect + URLSearchParams parsing | nuqs library | Type safety, server/client sync, less boilerplate, proper history handling |
| GitHub API integration | Direct fetch with manual auth | Octokit SDK | Handles auth, retries, rate limits, TypeScript types, conditional requests |
| Technology badge colors | Inline color logic | shadcn/ui Badge + CVA variants | Consistent design system, accessibility, theme support |
| Filter URL building | String concatenation for query params | nuqs setters or URLSearchParams API | Proper encoding, array handling, edge cases |
| GitHub rate limit handling | setTimeout retry loops | Octokit's built-in retry + Next.js cache | Respects headers, exponential backoff, server-side caching reduces requests |

**Key insight:** Filtering, URL state, and external API integration have sharp edges (encoding, types, rate limits, caching). Proven libraries handle these better than custom code, and they're already used elsewhere in this codebase (Zod for validation, MongoDB driver with DAL pattern).

## Common Pitfalls

### Pitfall 1: Client Component Wrapping Server Component
**What goes wrong:** Next.js error - "You're importing a Server Component into a Client Component"
**Why it happens:** Using nuqs's NuqsAdapter incorrectly or marking page.tsx as "use client"
**How to avoid:** Keep page.tsx as Server Component. Only mark filter UI components as client. Wrap layout.tsx with NuqsAdapter, not individual pages.
**Warning signs:** Build errors mentioning Server Component imports, searchParams not working

### Pitfall 2: GitHub Rate Limit Exhaustion
**What goes wrong:** API returns 403 after 60 requests (unauthenticated) or hitting limit with no caching
**Why it happens:** Fetching GitHub stats on every request without caching, or client-side fetching
**How to avoid:**
- Always use authenticated requests (5,000/hour vs 60/hour)
- Implement server-side caching with revalidation: `fetch(url, { next: { revalidate: 600 } })`
- Use conditional requests with ETags for 304 Not Modified responses (don't count against limit)
- Check `x-ratelimit-remaining` header
**Warning signs:** 403 responses, `x-ratelimit-remaining: 0` header

### Pitfall 3: JSON File Storage Decision Regret
**What goes wrong:** Storing projects in `public/projects.json` seems simple but requires migration later
**Why it happens:** "Projects are static" assumption breaks when you want admin UI, search, or sorting
**How to avoid:** Use MongoDB from the start since it's already integrated. Migration effort > initial setup.
**Warning signs:** Thinking "I'll migrate later", needing to add manual editing workflow

### Pitfall 4: Poor Filter UX - Too Many Projects Hidden
**What goes wrong:** User clicks one filter, sees empty state, gives up
**Why it happens:** No indication of how many projects match each technology
**How to avoid:** Show project counts next to each technology badge: "React (5)", disable filters with 0 results, or show "No results" with clear filter removal
**Warning signs:** High bounce rate on projects page, users not engaging with filters

### Pitfall 5: Inconsistent Data Model with Blog
**What goes wrong:** Projects use different patterns than blog (different field names, structure)
**Why it happens:** Not reviewing existing patterns before designing schema
**How to avoid:** Mirror blog's Post interface structure: `_id`, `slug`, `published`, `createdAt`, `updatedAt`, array fields for categories/tags, SerializedProject type
**Warning signs:** Copy-pasting blog code doesn't work, duplicate validation logic

### Pitfall 6: Forgetting Suspense Boundaries
**What goes wrong:** Entire page blocks while fetching data, poor UX
**Why it happens:** searchParams usage requires Suspense boundary per Next.js 15
**How to avoid:** Wrap components using searchParams in Suspense with loading fallback
**Warning signs:** Console warning about missing Suspense, slow page transitions

### Pitfall 7: Badge Accessibility Issues
**What goes wrong:** Filter badges not keyboard accessible or missing ARIA attributes
**Why it happens:** Using div instead of button, forgetting aria-pressed
**How to avoid:** Use button elements for interactive badges, add `aria-pressed={isActive}` for toggles
**Warning signs:** Tab key doesn't focus badges, screen reader doesn't announce state

## Code Examples

Verified patterns from official sources:

### MongoDB Project Model
```typescript
// Source: Existing Post.ts pattern
// models/Project.ts
import { ObjectId } from "mongodb";

export interface Project {
  _id: ObjectId;
  slug: string;
  title: string;
  description: string;
  longDescription?: string; // Optional detailed case study
  technologies: string[]; // ["React", "Next.js", "MongoDB"]
  demoUrl?: string | null;
  sourceUrl?: string | null;
  githubRepo?: string | null; // "owner/repo" format for stats
  featuredImage: string;
  published: boolean;
  featured: boolean; // Pin to top
  createdAt: Date;
  updatedAt: Date;
}

export interface SerializedProject
  extends Omit<Project, "_id" | "createdAt" | "updatedAt"> {
  _id: string;
  createdAt: string;
  updatedAt: string;
}
```

### nuqs Setup in Layout
```typescript
// Source: https://nuqs.dev/docs/integrations/next-js-app-router
// app/layout.tsx
import { NuqsAdapter } from 'nuqs/adapters/next/app'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <NuqsAdapter>{children}</NuqsAdapter>
      </body>
    </html>
  )
}
```

### Server Component with Filtering
```typescript
// Source: Next.js 15 docs + existing blog/page.tsx
// app/projects/page.tsx
import { Suspense } from 'react';
import { getProjects, getAllTechnologies } from '@/lib/projects/projects';
import { TechnologyFilters } from '@/components/projects/TechnologyFilters';

export const dynamic = 'force-dynamic';

interface ProjectsPageProps {
  searchParams: Promise<{ tech?: string }>;
}

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const params = await searchParams;
  const technologies = params.tech?.split(",").filter(Boolean) || [];

  const [projects, allTechnologies] = await Promise.all([
    getProjects({ technologies }),
    getAllTechnologies(),
  ]);

  return (
    <div className="container mx-auto py-8">
      <h1>Projects</h1>

      <Suspense fallback={<div>Loading filters...</div>}>
        <TechnologyFilters technologies={allTechnologies} />
      </Suspense>

      <div className="grid gap-6">
        {projects.map(project => (
          <ProjectCard key={project._id} project={project} />
        ))}
      </div>
    </div>
  );
}
```

### GitHub Stats Fetching with Caching
```typescript
// Source: GitHub REST API docs + Next.js caching docs
// lib/projects/github.ts
import { Octokit } from 'octokit';
import { unstable_cache } from 'next/cache';

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

async function fetchRepoStatsUncached(owner: string, repo: string) {
  try {
    const { data } = await octokit.rest.repos.get({ owner, repo });

    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      lastUpdate: data.pushed_at,
    };
  } catch (error) {
    console.error(`Failed to fetch stats for ${owner}/${repo}:`, error);
    return null; // Graceful degradation
  }
}

// Cache for 10 minutes
export const getRepoStats = unstable_cache(
  fetchRepoStatsUncached,
  ['github-repo-stats'],
  { revalidate: 600, tags: ['github-stats'] }
);
```

### Technology Filter Component
```typescript
// Source: Existing CategoryPills.tsx + nuqs docs
// components/projects/TechnologyFilters.tsx
"use client";

import { parseAsArrayOf, parseAsString, useQueryState } from 'nuqs';
import { Badge } from '@/components/ui/badge';

interface TechnologyFiltersProps {
  technologies: string[];
}

export function TechnologyFilters({ technologies }: TechnologyFiltersProps) {
  const [selectedTech, setSelectedTech] = useQueryState(
    'tech',
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const toggleTech = (tech: string) => {
    setSelectedTech(current =>
      current.includes(tech)
        ? current.filter(t => t !== tech)
        : [...current, tech]
    );
  };

  const clearFilters = () => setSelectedTech([]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {technologies.map(tech => {
          const isActive = selectedTech.includes(tech);
          return (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                isActive
                  ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-black'
                  : 'bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
              }`}
              aria-pressed={isActive}
            >
              {tech}
            </button>
          );
        })}
      </div>

      {selectedTech.length > 0 && (
        <button onClick={clearFilters} className="text-sm text-neutral-600">
          Clear filters
        </button>
      )}
    </div>
  );
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| Client-side filtering with useState | Server Component with URL params + nuqs | Next.js 13+ (App Router) | Better SEO, shareable URLs, simpler state management |
| Manual URLSearchParams parsing | nuqs library | 2024-2025 adoption | Type safety, less boilerplate, better DX |
| fetch with manual cache | Next.js built-in caching with revalidate | Next.js 13+ | Simpler caching, automatic deduplication |
| @octokit/rest | octokit (unified package) | 2023 | Single import for all GitHub API needs |
| JSON file storage | Database for dynamic content | Always preferred for dynamic sites | Enables admin UI, search, analytics |

**Deprecated/outdated:**
- Manual `router.push` with query string building: nuqs handles this declaratively
- `getServerSideProps` / `getStaticProps`: Replaced by Server Components and fetch in Next.js 13+
- Client-side only filtering: Loses SEO, shareable URLs, and browser back/forward

## Open Questions

Things that couldn't be fully resolved:

1. **Project CRUD admin UI scope**
   - What we know: Blog has admin UI for posts; projects could follow same pattern
   - What's unclear: Is admin UI for projects in Phase 7 scope or future phase?
   - Recommendation: Plan data model for future admin (use MongoDB, Zod validation) but defer UI to later phase. Focus on display and filtering for Phase 7.

2. **GitHub stats display strategy**
   - What we know: Stats are "optional" per requirements; can fetch with Octokit
   - What's unclear: Show for all projects with repos? Only featured? User toggle?
   - Recommendation: Display stats automatically for projects with `githubRepo` field set. Make it opt-in per project in the data model (not a global setting).

3. **Badge vs. custom design for tech stack**
   - What we know: shadcn/ui Badge component exists
   - What's unclear: Use Badge or custom styled pills like blog tags?
   - Recommendation: Install Badge component for consistency with design system, but check if CategoryPills pattern (existing blog component) already matches design needs. Reuse what fits the design.

4. **MongoDB collection indexing**
   - What we know: Blog likely has indexes on slug, published, etc.
   - What's unclear: Best indexes for projects filtering by technologies array
   - Recommendation: Create compound index on `{ published: 1, technologies: 1, featured: -1 }` for filter queries. Add separate index on `{ slug: 1 }` for single project lookups.

## Sources

### Primary (HIGH confidence)
- Next.js 15 App Router Documentation - [Server Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- Next.js 15 Data Fetching - [Server Actions and Mutations](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)
- Next.js 15 Caching - [Getting Started: Caching and Revalidating](https://nextjs.org/docs/app/getting-started/caching-and-revalidating)
- GitHub REST API - [Repositories endpoint](https://docs.github.com/en/rest/repos/repos)
- GitHub REST API - [Rate limits](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api)
- nuqs Documentation - [Official site](https://nuqs.dev/)
- shadcn/ui Badge - [Component docs](https://ui.shadcn.com/docs/components/badge)
- Existing codebase patterns:
  - `/src/app/blog/page.tsx` - Server Component filtering pattern
  - `/src/lib/blog/posts.ts` - DAL pattern with MongoDB
  - `/src/models/Post.ts` - Data model structure
  - `/src/components/blog/CategoryPills.tsx` - URL filter UI pattern

### Secondary (MEDIUM confidence)
- [next15-filterlist GitHub example](https://github.com/aurorascharff/next15-filterlist) - Filtering patterns in Next.js 15
- [Next.js 15 Server Actions: Complete Guide (2026)](https://medium.com/@saad.minhas.codes/next-js-15-server-actions-complete-guide-with-real-examples-2026-6320fbfa01c3)
- [Managing search parameters in Next.js with nuqs](https://blog.logrocket.com/managing-search-parameters-next-js-nuqs/)
- [Best Practices for Handling GitHub API Rate Limits](https://github.com/orgs/community/discussions/151675)
- [A Developer's Guide: Managing Rate Limits for the GitHub API](https://www.lunar.dev/post/a-developers-guide-managing-rate-limits-for-the-github-api)
- [How to Design Portfolio Homepages That Land You Job in 2026](https://uxplaybook.org/articles/6-ux-portfolio-homepage-mistakes-2026)
- [Shields.io Static Badges](https://shields.io/docs/static-badges) - Badge customization

### Tertiary (LOW confidence)
- Various Medium articles on Next.js 2026 best practices - General patterns verified against official docs
- Portfolio UX articles - General principles applied to specific context

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - All libraries already in project or official recommendations with verification
- Architecture: HIGH - Patterns verified in existing codebase (blog) and official Next.js docs
- Pitfalls: MEDIUM to HIGH - Rate limiting and caching from GitHub official docs (HIGH); UX pitfalls from general portfolio research (MEDIUM)
- GitHub API integration: HIGH - Official GitHub REST API documentation and Octokit official SDK
- nuqs usage: HIGH - Official nuqs documentation with Next.js App Router integration guide

**Research date:** 2026-01-24
**Valid until:** Approximately 60 days (Next.js and GitHub API are stable; nuqs is actively maintained)

**Notes:**
- Phase 7 has no CONTEXT.md, so no user decisions constrain research scope
- Existing blog implementation provides proven patterns to replicate
- MongoDB already integrated; extending with projects collection is low risk
- GitHub OAuth already configured for Auth.js; can reuse token or create separate PAT
- nuqs adoption recommended over manual URLSearchParams based on community best practices
