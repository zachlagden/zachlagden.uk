---
phase: 04-blog-core
plan: 02
subsystem: api
tags: [mongodb, mdx, syntax-highlighting, full-text-search, rehype]

# Dependency graph
requires:
  - phase: 04-01
    provides: "Post model, MongoDB indexes, MDX pipeline configuration"
provides:
  - "Blog data access layer (getPublishedPosts, getPostBySlug, searchPosts)"
  - "Full-text search with category/tag filtering and relevance ranking"
  - "GitHub-style syntax highlighting for code blocks"
  - "Previous slug redirect support for URL changes"
affects: [04-03, 04-04, 04-05]

# Tech tracking
tech-stack:
  added: []
  patterns: ["SerializedPost pattern for API responses", "Filter interfaces for type-safe MongoDB queries", "MDX component override pattern"]

key-files:
  created:
    - src/lib/blog/posts.ts
    - src/lib/blog/search.ts
    - src/components/syntax/CodeBlock.tsx
  modified:
    - src/app/mdx-components.tsx
    - src/app/globals.css

key-decisions:
  - "SerializedPost type for API responses (converts ObjectId/Date to strings)"
  - "Custom syntax highlighting CSS instead of external highlight.js themes"
  - "GitHub color scheme for syntax highlighting (light/dark adaptive)"

patterns-established:
  - "serializePost() helper for consistent API responses"
  - "Filter interfaces instead of 'any' types for MongoDB queries"
  - "CodeBlock component with copy-to-clipboard and language badge"

# Metrics
duration: 8min
completed: 2026-01-21
---

# Phase 04-02: Blog Data Layer & Code Highlighting Summary

**MongoDB data access layer with full-text search, GitHub-style syntax highlighting for MDX code blocks, and type-safe API response serialization**

## Performance

- **Duration:** 8 min
- **Started:** 2026-01-21T21:53:24Z
- **Completed:** 2026-01-21T22:01:30Z
- **Tasks:** 2
- **Files modified:** 5

## Accomplishments
- Blog post CRUD functions (list with filters, single by slug, previous slug redirects)
- Full-text search with relevance ranking and category/tag filtering
- Syntax-highlighted code blocks with GitHub aesthetic
- Copy button and language badges for code snippets
- Type-safe MongoDB queries with Filter interfaces

## Task Commits

Each task was committed atomically:

1. **Task 1: Create blog data access functions** - `cf5a319` (feat)
   - ESLint type fixes: `c8873c1` (fix)
2. **Task 2: Create syntax highlighting components** - `05ea31e` (feat)

**Plan metadata:** (to be committed)

## Files Created/Modified
- `src/lib/blog/posts.ts` - Blog post fetching (list, single, by slug, by previous slug), category/tag enumeration, reading time calculation
- `src/lib/blog/search.ts` - Full-text search with MongoDB text index, relevance scoring, category/tag filtering
- `src/components/syntax/CodeBlock.tsx` - GitHub-style code block with syntax highlighting, copy button, language badge
- `src/app/mdx-components.tsx` - MDX component overrides mapping pre/code to CodeBlock and inline code styling
- `src/app/globals.css` - Custom syntax highlighting CSS with GitHub light/dark color schemes

## Decisions Made

**1. SerializedPost type for API responses**
- Converts ObjectId to string, Date objects to ISO strings
- Ensures Next.js API routes can serialize responses without errors
- Pattern: serializePost() helper called by all data access functions

**2. Custom syntax highlighting CSS instead of external themes**
- Initial attempt to import highlight.js/styles failed (package not installed)
- Created custom GitHub-inspired color scheme directly in globals.css
- Provides light/dark adaptive styling matching site's aesthetic
- Eliminates external dependency while maintaining GitHub look

**3. Filter interfaces for type-safe MongoDB queries**
- Replaced `any` types with proper TypeScript interfaces
- Filter interface defines all possible query fields
- Improves type safety and IDE autocomplete

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Resolved ESLint type errors in data layer**
- **Found during:** Task 2 (Build verification)
- **Issue:** ESLint rejected `any` types in posts.ts and search.ts (from Task 1)
- **Fix:** Created Filter and SortCriteria interfaces for type-safe MongoDB queries
- **Files modified:** src/lib/blog/posts.ts, src/lib/blog/search.ts
- **Verification:** `npx tsc --noEmit` passes, ESLint no longer reports errors
- **Committed in:** c8873c1 (fix commit between tasks)

**2. [Rule 3 - Blocking] Changed CSS import approach for syntax highlighting**
- **Found during:** Task 2 (Build attempt)
- **Issue:** `@import "highlight.js/styles/github.css"` failed - highlight.js not installed as direct dependency
- **Fix:** Created custom GitHub-inspired syntax highlighting CSS in globals.css instead of importing external theme
- **Files modified:** src/app/globals.css
- **Verification:** Build compiles successfully, syntax highlighting classes ready for rehype-highlight
- **Committed in:** 05ea31e (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (2 blocking issues)
**Impact on plan:** Both fixes necessary to unblock build/compilation. Custom CSS approach actually better - eliminates external dependency and provides exact GitHub aesthetic matching site design.

## Issues Encountered

**MongoDB URI build error (expected)**
- Build fails during static generation phase without MONGODB_URI environment variable
- This is intentional per Phase 3 decision: "Defer MongoDB URI validation to runtime"
- Compilation and linting succeed (verified with `npx tsc --noEmit`)
- Runtime connection will work in development/production with proper env vars

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

**Ready for blog page components:**
- Data layer provides all necessary functions for post listing and single post pages
- MDX rendering configured with syntax highlighting
- Search functionality ready for integration

**No blockers.**

---
*Phase: 04-blog-core*
*Completed: 2026-01-21*
