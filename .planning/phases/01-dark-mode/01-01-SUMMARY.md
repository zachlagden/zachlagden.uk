---
phase: 01-dark-mode
plan: 01
subsystem: ui
tags: [shadcn-ui, next-themes, tailwind-css, dark-mode, radix-ui]

# Dependency graph
requires:
  - phase: existing-foundation
    provides: Next.js 15 with App Router, Tailwind CSS 4, TypeScript setup
provides:
  - shadcn/ui component system initialized (New York style, Neutral colors)
  - next-themes 0.4.6 for theme management with localStorage persistence
  - ThemeProvider wrapping application with system preference detection
  - Dark mode CSS variables (#0a0a0a background, #e5e5e5 text, #1a1a1a cards)
  - Theme transitions (150ms) with reduced motion support
  - cn() utility for class merging (clsx + tailwind-merge)
affects: [01-02-toggle-component, all-future-ui-components]

# Tech tracking
tech-stack:
  added:
    - shadcn/ui (component system)
    - next-themes 0.4.6 (theme management)
    - clsx (class name utility)
    - tailwind-merge (Tailwind class merging)
  patterns:
    - CSS variables for theme colors using oklch color space
    - ThemeProvider pattern for client-side theme management
    - suppressHydrationWarning on html tag for FOUC prevention
    - cn() utility for conditional class names

key-files:
  created:
    - components.json (shadcn/ui configuration)
    - src/lib/utils.ts (cn utility)
    - src/components/providers/theme-provider.tsx (next-themes wrapper)
  modified:
    - src/app/globals.css (theme CSS variables, transitions, dark mode styles)
    - src/app/layout.tsx (ThemeProvider integration, suppressHydrationWarning)
    - package.json (added next-themes, clsx, tailwind-merge)

key-decisions:
  - "Used shadcn/ui New York style with Neutral base color for consistency"
  - "Configured defaultTheme='system' to respect OS preference on first visit"
  - "Set disableTransitionOnChange=false to allow 150ms theme fade transitions"
  - "User-specified dark colors: #0a0a0a background (not pure black), #e5e5e5 text (off-white)"
  - "Added theme transitions with prefers-reduced-motion support (instant switch when reduced motion preferred)"
  - "Replaced shadows with subtle glow in dark mode (5% white, 20px blur)"
  - "Applied 15% brightness reduction to images in dark mode to reduce eye strain"

patterns-established:
  - "Theme-aware styling: bg-white dark:bg-[#0a0a0a] pattern for custom colors"
  - "CSS variable structure: :root for light, .dark for dark theme overrides"
  - "Transition respecting reduced motion: @media (prefers-reduced-motion: no-preference)"
  - "ThemeProvider wraps SmoothScrollProvider to ensure theme context available throughout app"

# Metrics
duration: 12min
completed: 2026-01-21
---

# Phase 01 Plan 01: Theme Infrastructure Summary

**shadcn/ui + next-themes foundation with system preference detection, FOUC-free theme switching, and user-specified dark gray color palette**

## Performance

- **Duration:** 12 minutes
- **Started:** 2026-01-21T04:29:52Z
- **Completed:** 2026-01-21T04:42:16Z
- **Tasks:** 3
- **Files modified:** 5

## Accomplishments

- shadcn/ui component system initialized with New York style and Neutral base color
- next-themes installed and configured for theme management with localStorage persistence
- ThemeProvider wrapping entire application with system preference detection enabled
- Dark mode CSS variables configured with user-specified colors (#0a0a0a, #e5e5e5, #1a1a1a)
- Theme transitions (150ms) with prefers-reduced-motion support implemented
- FOUC prevention via suppressHydrationWarning attribute on html tag
- Dark mode enhancements: glow effect replacing shadows, image brightness reduction, updated scrollbar

## Task Commits

Each task was committed atomically:

1. **Task 1: Initialize shadcn/ui and install next-themes** - `eecbeb4` (chore)
2. **Task 2: Configure CSS variables for dark theme colors** - `9d74c08` (feat)
3. **Task 3: Create ThemeProvider and update layout** - `df843f9` (feat)

## Files Created/Modified

**Created:**
- `components.json` - shadcn/ui configuration (New York style, Neutral base, CSS variables enabled)
- `src/lib/utils.ts` - cn() utility function combining clsx and tailwind-merge
- `src/components/providers/theme-provider.tsx` - next-themes wrapper component for client-side theme management

**Modified:**
- `src/app/globals.css` - Added CSS variables for light/dark themes, theme transitions, dark mode enhancements (glow, image filters, scrollbar)
- `src/app/layout.tsx` - Added ThemeProvider wrapper, suppressHydrationWarning attribute, theme-aware body background
- `package.json` - Added next-themes 0.4.6, clsx, tailwind-merge dependencies

## Decisions Made

1. **shadcn/ui New York style with Neutral base color** - Rationale: Cleaner, more minimal aesthetic matching user's design preferences. Neutral provides good foundation for custom dark mode colors.

2. **defaultTheme="system" with enableSystem** - Rationale: Respects user's OS preference on first visit (THEME-03 requirement), syncs with prefers-color-scheme changes automatically.

3. **disableTransitionOnChange={false}** - Rationale: User wants 150ms fade transitions when switching themes. Standard shadcn examples disable transitions, but user specifically requested smooth fade.

4. **User-specified dark mode colors** - Rationale:
   - Background: #0a0a0a (dark gray, not pure black #000000) - reduces eye strain, modern aesthetic
   - Text: #e5e5e5 (off-white, not pure white) - softer contrast for comfortable reading
   - Cards: #1a1a1a - provides depth on dark background while maintaining readability

5. **Theme transitions with reduced motion support** - Rationale: 150ms transition for smooth UX, but instant (0.01ms) when prefers-reduced-motion is enabled for accessibility compliance (WCAG 2.1).

6. **Glow effect replacing shadows in dark mode** - Rationale: Shadows don't work on dark backgrounds. Subtle 5% white glow with 20px blur provides depth without being neon-like.

7. **Image brightness reduction (15%) in dark mode** - Rationale: Images designed for light backgrounds appear too harsh on dark backgrounds. 15% brightness reduction + 15% contrast increase balances visibility and comfort.

## Deviations from Plan

None - plan executed exactly as written. All tasks completed according to specifications in 01-01-PLAN.md.

## Issues Encountered

None - initialization, configuration, and integration completed without problems. Build succeeded on all attempts.

## User Setup Required

None - no external service configuration required. Theme system is fully self-contained within the Next.js application.

## Next Phase Readiness

**Ready for next phase (01-02: Toggle Component):**
- ✅ ThemeProvider context available throughout application
- ✅ Theme state management working (system preference detection, localStorage persistence)
- ✅ Dark mode CSS variables defined and ready for component consumption
- ✅ cn() utility available for component styling
- ✅ FOUC prevention working (suppressHydrationWarning in place)

**No blockers.** Theme infrastructure is complete and ready for toggle component implementation.

**Notes for 01-02:**
- useTheme() hook from next-themes available for theme state access
- Theme can be switched via setTheme("light" | "dark" | "system")
- Mounted state check needed in toggle component to prevent hydration mismatch
- dark: prefix available in all components for theme-aware styling

---
*Phase: 01-dark-mode*
*Completed: 2026-01-21*
