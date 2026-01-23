# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** A professional online presence that authentically represents who you are and what you build, with a blog for sharing technical content.
**Current focus:** Phase 5 (Blog Admin) - Plan 3 complete

## Current Position

Phase: 5 of 8 (Blog Admin)
Plan: 3 of 4 in current phase
Status: In progress
Last activity: 2026-01-23 - Completed 05-03-PLAN.md (Create Post Page)

Progress: [██████----] ~63% (20 of 32 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 20
- Average duration: 6.5 min
- Total execution time: 2.25 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-dark-mode | 4 | 47min | 12min |
| 02-testing-infrastructure | 3 | 11min | 3.7min |
| 03-authentication | 5 | 24min | 4.8min |
| 04-blog-core | 5 | 53min | 10.6min |
| 05-blog-admin | 3 | 11min | 3.7min |

**Recent Trend:**
- Last 5 plans: 04-05 (12min), 05-01 (4min), 05-02 (4min), 05-03 (3min)
- Trend: Form/UI components completing quickly; clear specs enable fast execution

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Phase | Rationale |
|----------|-------|-----------|
| Editor content via hidden input to FormData | 05-03 | Server Actions receive content as string; client state synced via hidden input |
| Auto-slug with toggle option | 05-03 | Default auto-generate for UX; manual override for SEO control |
| useActionState for form state management | 05-03 | React 19 pattern for Server Action form handling with pending state |
| Dynamic import with ssr: false for editor | 05-03 | Prevents Tiptap from blocking page render; lazy-loads heavy bundle |
| HTML content storage in editor | 05-02 | Tiptap outputs HTML natively; next-mdx-remote can render both HTML and Markdown seamlessly |
| immediatelyRender: false for SSR safety | 05-02 | Prevents hydration mismatches; editor loads client-side only |
| FormData parsing for Server Actions | 05-01 | Enables native form submission without client-side JS; works with useFormState |
| PostFormState type for form hooks | 05-01 | Designed for useFormState/useActionState with errors keyed by field name |
| Slug uniqueness check before insert/update | 05-01 | Prevents duplicate URLs; checked in both createPost and updatePost |
| previous_slugs via $addToSet | 05-01 | Avoids duplicates when adding old slugs for redirect support |
| Simplified middleware (no NextAuth) | 04-05 | Edge runtime can't use MongoDB adapter; DAL handles security server-side |
| Node.js runtime for OG images | 04-05 | reading-time package incompatible with Edge; acceptable tradeoff |
| Hide TOC for posts with fewer than 3 headings | 04-04 | Table of contents adds little value for short posts; saves screen space |
| Unicode escape in JSON-LD for XSS protection | 04-04 | Prevents script injection by escaping < and > as \u003c and \u003e in structured data |
| IntersectionObserver for TOC active section | 04-04 | Efficient viewport tracking without scroll event listeners; better performance |
| next-mdx-remote/rsc for MDX rendering | 04-04 | Compatible with Next.js 15 App Router Server Components; renders database MDX strings |
| Suspense boundaries for useSearchParams | 04-03 | SearchFilter/CategoryPills use useSearchParams which causes CSR bailout if not wrapped in Suspense |
| Multi-select filters via URL params | 04-03 | Allows combining categories and tags; enables shareable filtered links like /blog?category=Tutorials&q=react |
| Debounced search with 300ms delay | 04-03 | Balances instant feedback with server load reduction; prevents excessive database queries |
| Dynamic rendering for blog page | 04-03 | Blog content from database; static generation would require build-time DB connection |
| Custom syntax highlighting CSS | 04-02 | External highlight.js themes not available; custom GitHub-inspired CSS eliminates dependency while matching site aesthetic |
| SerializedPost for API responses | 04-02 | Converts ObjectId/Date to strings for Next.js API route compatibility; ensures all responses serializable |

### Pending Todos

None yet.

### Blockers/Concerns

**Pre-existing build issue (documented 04-03):**
- Home page "/" has error preventing full build: `Cannot destructure property 'data' of '(0 , o.wV)(...)' as it is undefined`
- Issue existed before Phase 04 changes (verified by checking previous commits)
- Blog routes compile successfully despite home page issue
- TypeScript compilation passes with zero errors
- Appears to be client-side hook issue during SSR on home page
- Does not block blog development but should be addressed before deployment

## Session Continuity

Last session: 2026-01-23T23:49:13Z
Stopped at: Completed 05-03-PLAN.md (Create Post Page)
Resume file: None
Next: 05-04-PLAN.md (Edit Post Page)
