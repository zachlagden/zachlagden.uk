# Project State

## Project Reference

See: .planning/PROJECT.md (updated 2026-01-21)

**Core value:** A professional online presence that authentically represents who you are and what you build, with a blog for sharing technical content.
**Current focus:** Phase 5 Complete - Ready for Phase 6

## Current Position

Phase: 7 of 8 (Projects Showcase)
Plan: 3 of 4 in current phase (07-01, 07-02, 07-03 complete)
Status: In progress
Last activity: 2026-01-24 - Completed 07-02-PLAN.md (Projects UI Components)

Progress: [████████░-] ~85% milestone (28/33 plans complete)

## Performance Metrics

**Velocity:**
- Total plans completed: 28
- Average duration: 5.5 min
- Total execution time: 2.6 hours

**By Phase:**

| Phase | Plans | Total | Avg/Plan |
|-------|-------|-------|----------|
| 01-dark-mode | 4 | 47min | 12min |
| 02-testing-infrastructure | 3 | 11min | 3.7min |
| 03-authentication | 5 | 24min | 4.8min |
| 04-blog-core | 5 | 53min | 10.6min |
| 05-blog-admin | 4 | 19min | 4.8min |
| 06-blog-engagement | 5 | 10min | 2min |
| 07-projects-showcase | 3 | 6min | 2min |

**Recent Trend:**
- Last 5 plans: 06-04 (2min), 06-05 (3min), 07-01 (1min), 07-02 (3min), 07-03 (2min)
- Trend: Consistent fast execution; Phase 7 UI components following blog patterns

*Updated after each plan completion*

## Accumulated Context

### Decisions

Decisions are logged in PROJECT.md Key Decisions table.
Recent decisions affecting current work:

| Decision | Phase | Rationale |
|----------|-------|-----------|
| NuqsAdapter in root layout | 07-02 | Wraps entire app for global nuqs hook availability; enables type-safe URL state anywhere |
| Tech badge max 5 with overflow | 07-02 | Prevents card height inconsistency; shows "+N more" for projects with many technologies |
| Opacity-based tech colors | 07-02 | bg-color/10 pattern works in both themes without separate color definitions |
| nuqs over URLSearchParams | 07-02 | Type-safe array parsing eliminates boilerplate; automatic URL sync and simpler API |
| 10-minute GitHub cache duration | 07-03 | Balances data freshness with rate limit protection; 600-second revalidation prevents excessive API calls |
| Optional GITHUB_TOKEN env var | 07-03 | Works without token (60 req/hour) but recommends setting for 5000 req/hour limit |
| Graceful GitHub failures return null | 07-03 | 404/403/errors return null instead of throwing; prevents UI crashes from missing/private repos |
| Featured boolean vs priority number | 07-01 | Simple boolean for featured flag instead of numeric priority; UI pattern is "featured first, then chronological" |
| Technology filtering via MongoDB $in | 07-01 | Efficient array filtering for technology stack; mirrors tags filtering pattern from posts DAL |
| Simpler Project model than Post | 07-01 | Projects don't need reading time, categories, or previous_slugs; focused on essential display fields |
| Small inline delete button for admins | 06-03 | h-6 w-6 ghost variant minimizes visual clutter while providing admin moderation |
| Avatar fallback to username initial | 06-03 | Shows username initial in colored circle when GitHub avatarUrl is missing |
| Sign-in prompt for unauthenticated users | 06-03 | Shows friendly CTA with MessageSquare icon instead of disabled form |
| date-fns for relative timestamps | 06-03 | formatDistanceToNow for "2 hours ago" style instead of custom date math |
| RelatedPosts returns null when empty | 06-04 | Graceful degradation - section doesn't render if no related posts found |
| CommentSection container pattern | 06-05 | Orchestrates CommentForm and CommentList with shared props; clean separation of concerns |
| Parallel engagement data fetching | 06-05 | Promise.all for comments/reactions/related posts minimizes latency |
| Categories weighted 2x in relevance scoring | 06-04 | Categories are broader topics, so overlap is more significant than tag overlap |
| React 19 useOptimistic for instant feedback | 06-04 | No loading spinner needed; UI updates immediately on click with automatic rollback on error |
| getReactionState handles unauthenticated | 06-02 | Doesn't throw on missing session; returns { liked: false, count } for anonymous users |
| toggleReaction returns full state | 06-02 | Returns { success, liked, count } so client can update UI without refetching |
| createComment uses FormData pattern | 06-02 | Consistent with existing PostForm Server Actions; enables useActionState compatibility |
| toggleUserReaction returns newCount | 06-01 | Enables optimistic UI updates without refetching; instant feedback in client |
| Heart-only reaction type for v1 | 06-01 | Simplify initial implementation; can extend later with more reaction types |
| Oldest-first comment sorting | 06-01 | Natural reading order for conversations; users expect chronological flow |
| Referenced comments collection | 06-01 | Avoid MongoDB 16MB document limit on popular posts; enables unbounded growth |
| getPostBySlugForEdit ignores published filter | 05-04 | Admin can edit draft posts; separate function from public getPostBySlug |
| AlertDialog for delete confirmation | 05-04 | Destructive actions require explicit confirmation to prevent accidents |
| Admin controls via optional props | 05-04 | PostHeader accepts isAdmin/postId props; keeps component reusable |
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

Last session: 2026-01-24T01:44:46Z
Stopped at: Completed 07-02-PLAN.md (Projects UI Components)
Resume file: None
Next: 07-04-PLAN.md (Projects Page)
