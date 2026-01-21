# Phase 4: Blog Core - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can browse and read published blog posts with full SEO support. This includes: blog listing page, individual post pages, categories, tags, search, and SEO (meta tags, OG images, structured data, RSS feed). Creating/editing posts and engagement features (comments, reactions) are separate phases.

</domain>

<decisions>
## Implementation Decisions

### Post listing layout
- Card grid layout (2-3 columns responsive)
- Full preview cards: featured image, title, excerpt (2-3 lines), date, reading time, category badge
- Featured images are required for all posts
- Default sort: newest first, with sort function and search available

### Post reading experience
- Technical/clean typography: sans-serif body, clear hierarchy, optimized for code-heavy posts
- GitHub-style code blocks: light/dark adaptive, syntax highlighting, familiar appearance
- Table of contents: sticky sidebar that scrolls with reader, highlights current section
- Medium content width: allows for larger inline images while maintaining readability

### Search & filtering
- Instant search: results filter as user types, no submit required
- Horizontal pills/chips for category and tag filtering above the post grid
- Multiple filters can be selected
- Shareable URLs: /blog?category=react&q=hooks — filters persist in URL
- Empty state: friendly message with category suggestions ("No posts found. Try these categories...")

### Content structure
- Categories + tags system: categories for broad topics, tags for specifics
- Multiple categories allowed per post
- Initial categories: Tutorials, Projects, Deep Dives, Quick Tips
- All filtering on /blog page via query params (no dedicated /blog/category/x routes)

### Claude's Discretion
- Exact card spacing and grid gap values
- Specific syntax highlighting library choice
- TOC generation threshold (minimum headings before showing)
- Search debounce timing
- Tag display limits per post card
- RSS feed format details
- OG image generation approach

</decisions>

<specifics>
## Specific Ideas

- GitHub-style code blocks feel familiar to the developer audience
- Sticky TOC similar to documentation sites (MDN, React docs)
- Technical categories align with the developer-focused content: Tutorials, Projects, Deep Dives, Quick Tips

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 04-blog-core*
*Context gathered: 2026-01-21*
