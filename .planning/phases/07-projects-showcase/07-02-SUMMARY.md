---
phase: 07-projects-showcase
plan: 02
subsystem: ui
tags: [react, nuqs, framer-motion, components, projects]

# Dependency graph
requires:
  - phase: 07-01
    provides: Project data model and SerializedProject type
  - phase: 04-blog-core
    provides: PostCard and CategoryPills component patterns
provides:
  - TechnologyBadge component with color-coded tech styling
  - TechnologyFilters component with nuqs URL state management
  - ProjectCard component with GitHub stats support
  - EmptyState component for filtered and empty states
affects: [07-03-projects-page, ui]

# Tech tracking
tech-stack:
  added:
    - nuqs (type-safe URL state management)
  patterns:
    - "Technology-specific color mapping for badges"
    - "nuqs for URL-based multi-select filtering"
    - "Optional GitHub stats display in project cards"

key-files:
  created:
    - src/components/projects/TechnologyBadge.tsx
    - src/components/projects/TechnologyFilters.tsx
    - src/components/projects/ProjectCard.tsx
    - src/components/projects/EmptyState.tsx
  modified:
    - src/app/layout.tsx

key-decisions:
  - "nuqs over manual URLSearchParams for type safety and simpler API"
  - "Technology colors based on opacity (bg-color/10) for theme compatibility"
  - "Max 5 technology badges shown with +N more overflow indicator"
  - "NuqsAdapter wraps entire app in layout.tsx for global availability"

patterns-established:
  - "TechnologyBadge color mapping follows brand colors for common technologies"
  - "ProjectCard mirrors PostCard structure with featured badge pattern"
  - "EmptyState handles both filtered results and no content scenarios"

# Metrics
duration: 3min
completed: 2026-01-24
---

# Phase 07 Plan 02: Projects UI Components Summary

**Reusable project components with nuqs-powered technology filtering, GitHub stats support, and color-coded technology badges**

## Performance

- **Duration:** 3 min
- **Started:** 2026-01-24T01:41:46Z
- **Completed:** 2026-01-24T01:44:46Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments
- Created TechnologyBadge with color mapping for 15+ common technologies
- Implemented TechnologyFilters with type-safe URL state via nuqs
- Built ProjectCard with featured badge, GitHub stats, and external links
- Added EmptyState for both filtered and empty project scenarios

## Task Commits

Each task was committed atomically:

1. **Task 1: Install nuqs and Create Component Directory** - `eacffd1` (chore)
2. **Task 2: Create TechnologyBadge Component** - `3c0dd19` (feat)
3. **Task 3: Create TechnologyFilters, ProjectCard, and EmptyState** - `38194f8` (feat)

## Files Created/Modified
- `src/components/projects/TechnologyBadge.tsx` - Technology badge with color-coded styling for common languages/frameworks/tools
- `src/components/projects/TechnologyFilters.tsx` - Multi-select technology filter with nuqs URL state persistence
- `src/components/projects/ProjectCard.tsx` - Project card with featured image, tech badges (max 5), optional GitHub stats, and demo/source links
- `src/components/projects/EmptyState.tsx` - Empty state for no projects or no matching filters
- `src/app/layout.tsx` - Added NuqsAdapter wrapper for global nuqs availability

## Decisions Made
- **nuqs for URL state:** Chose nuqs over manual URLSearchParams for type-safe, simpler API. Eliminates boilerplate for parsing arrays and provides automatic URL sync.
- **Opacity-based tech colors:** Used bg-color/10 and bg-color/20 opacity pattern for technology badges to ensure they work in both light and dark modes without separate color definitions.
- **Tech badge overflow:** Show maximum 5 technology badges with "+N more" indicator to prevent card height inconsistency in grid layouts.
- **NuqsAdapter in root layout:** Wrapped entire app with NuqsAdapter to enable nuqs hooks anywhere in the component tree without per-page configuration.

## Deviations from Plan

None - plan executed exactly as written.

## Issues Encountered

None - straightforward component adaptation from existing blog patterns.

## User Setup Required

None - no external service configuration required.

## Next Phase Readiness

Ready for Phase 07 Plan 03 (Projects Page):
- All UI components available for page integration
- TechnologyFilters ready to consume getAllTechnologies() result
- ProjectCard ready to display projects with optional GitHub stats
- EmptyState handles all edge cases

No blockers. Components follow established patterns and have full dark mode support.

---
*Phase: 07-projects-showcase*
*Completed: 2026-01-24*
