# Phase 1: Dark Mode - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Theme toggle with persistence, system preference detection, no flash. Users can switch between light and dark themes with the preference persisting across sessions. First-time visitors see their system preference. All existing UI elements display correctly in both themes.

**Note:** This phase depends on Phase 0 (UI Foundation) which installs shadcn/ui and configures the theme provider.

</domain>

<decisions>
## Implementation Decisions

### Toggle Design
- Floating button, bottom-left corner
- iOS-style sliding toggle switch with sun/moon inside
- Compact size (~40px)
- Subtle glass effect background (semi-transparent with blur backdrop)
- No border or shadow — glass effect alone
- Always visible (no auto-hide or collapse)
- Smooth slide animation when toggling
- Tooltip on hover: "Switch to dark mode" / "Switch to light mode"

### Color Palette
- Dark mode background: dark gray (#0a0a0a), not true black
- Accent colors: same in both themes (brand consistency)
- Dark mode text: off-white (#e5e5e5) for reduced eye strain
- Cards/sections: elevated surfaces using lighter backgrounds (#1a1a1a on #0a0a0a) for depth

### Transition Behavior
- Quick fade (~150ms) when switching themes
- All elements transition together (no stagger)
- Reduced motion preference: instant switch (no fade)
- Scroll position preserved during theme switch

### Edge Cases
- Images: slightly dimmed (~10-15% brightness reduction) in dark mode
- Shadows: replaced with subtle glow effect in dark mode
- Code blocks: theme-aware syntax highlighting (light theme in light mode, dark in dark mode)
- Form inputs: use shadcn/ui default styling

### Claude's Discretion
- Exact blur amount for glass effect
- Specific glow color/intensity for dark mode shadows
- Code syntax highlighting theme selection
- Loading skeleton appearance during initial theme detection

</decisions>

<specifics>
## Specific Ideas

- Toggle should feel like iOS settings switches — smooth, satisfying slide
- Glass effect similar to macOS menu bar transparency
- The glow replacing shadows should be subtle, not neon

</specifics>

<deferred>
## Deferred Ideas

- **Phase 0: UI Foundation** — Install Radix UI + shadcn/ui, configure theme provider. This should be inserted before Phase 1 as foundation for all milestone work.

</deferred>

---

*Phase: 01-dark-mode*
*Context gathered: 2026-01-21*
