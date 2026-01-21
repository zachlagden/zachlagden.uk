# Features Research

**Research Date:** 2026-01-21
**Focus:** Blog, Projects Showcase, Dark Mode for developer portfolio
**Target Audience:** Potential employers, clients, collaborators, fellow developers
**Overall Confidence:** HIGH (multiple authoritative sources cross-referenced)

---

## Blog Features

### Table Stakes

Features users expect from any developer blog. Missing these makes the blog feel incomplete or amateur.

| Feature | Description | Complexity | Depends On |
|---------|-------------|------------|------------|
| **Post listing page** | Chronological list of all posts with title, date, excerpt | Low | Content structure |
| **Individual post pages** | Full post content with proper typography | Low | MDX setup |
| **Estimated reading time** | Display "X min read" based on ~200-250 words/minute | Low | Content processing |
| **Publication date** | Clear date when post was published | Low | Frontmatter |
| **Markdown/MDX support** | Write content in Markdown with JSX component embedding | Medium | Build pipeline |
| **Code syntax highlighting** | Properly highlighted code blocks for technical content | Medium | MDX plugins |
| **Responsive design** | Readable on all devices, especially mobile | Low | Existing Tailwind setup |
| **SEO metadata** | Title, description, Open Graph images per post | Medium | Next.js metadata API |
| **Navigation back to main site** | Clear way to return to portfolio sections | Low | Existing navigation |

### Differentiators

Features that elevate the blog beyond basic functionality. Not expected, but valued.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Categories/Tags** | Filter posts by topic (React, Python, Business, etc.) | Medium | Good for technical architect showing breadth |
| **Table of contents** | Auto-generated from headings for longer posts | Medium | Improves UX for technical articles |
| **Dynamic OG images** | Auto-generated social preview images per post | Medium | Next.js has built-in support |
| **RSS feed** | Allow readers to subscribe via feed readers | Low | Standard for developer blogs |
| **Search functionality** | Find posts by keyword | Medium | Consider static search like Fuse.js |
| **Series/Collections** | Group related posts into multi-part series | Medium | Good for tutorials |
| **Digital garden approach** | Show post status (seedling, growing, evergreen) | Low | Differentiates from traditional blogs |
| **"Last updated" date** | Show when content was refreshed, not just published | Low | Signals maintained content |
| **Copy code button** | One-click copy for code blocks | Low | Expected by developers, easy to implement |
| **Related posts** | Suggest similar content at end of posts | Medium | Increases engagement |

### Anti-Features

Features to deliberately NOT build. Common mistakes or over-engineering.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Comments system (initially)** | Maintenance burden, spam, moderation overhead | Add later if needed; use Twitter/GitHub discussions for engagement |
| **Newsletter signup (at launch)** | Requires email infrastructure, GDPR compliance, ongoing commitment | Start blog first, add newsletter when you have consistent content |
| **View counters** | Vanity metric, requires analytics integration, can look bad if low | Focus on quality content; use private analytics |
| **Like/clap buttons** | Requires backend, low-value engagement metric | Let content quality speak for itself |
| **Complex CMS** | Overkill for personal blog, adds maintenance | Use MDX files in repo; content lives with code |
| **Disqus or heavy comment widgets** | Slow (1MB+ JS), privacy issues, ads | If comments needed later: Giscus (GitHub-based) or Remark42 |
| **AI-generated content** | Undermines authenticity for a personal portfolio | Write genuine content that showcases your thinking |
| **Too many categories** | Fragments content, most will be empty | Start with 3-4 broad categories max |

---

## Projects Showcase Features

### Table Stakes

Features users expect from a developer projects showcase. Missing these = missed opportunities.

| Feature | Description | Complexity | Depends On |
|---------|-------------|------------|------------|
| **Project listing page** | Grid/list of all projects with thumbnails | Low | Content structure |
| **Individual project pages** | Detailed view of each project | Medium | Routing setup |
| **Project title & description** | Clear what the project is and does | Low | Content |
| **Live demo link** | "View Live" button prominently placed | Low | Deployed projects |
| **Source code link** | "View Code" button to GitHub repo | Low | Public repos |
| **Technology stack display** | Show what technologies were used | Low | Project metadata |
| **Project thumbnail/screenshot** | Visual preview of the project | Low | Image assets |
| **Featured projects** | Highlight 2-4 best projects on homepage | Low | Content curation |

### Differentiators

Features that make the showcase stand out from typical portfolio project lists.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Case study format** | Problem, approach, solution, outcome narrative | Medium | Shows problem-solving, not just coding |
| **Technology stack badges** | Visual badges (React, Next.js, Python, etc.) | Low | Quick scanning, professional appearance |
| **Filter by technology** | Filter projects by stack (e.g., show only React projects) | Medium | Good for showing breadth/depth |
| **Project status indicator** | Active, Maintained, Archived, etc. | Low | Shows honesty about project states |
| **Role description** | Your specific role if team project | Low | Important for larger projects |
| **Metrics/outcomes** | Results achieved (users, performance gains, etc.) | Low | Demonstrates impact |
| **Challenge highlights** | What was technically interesting/difficult | Low | Shows depth of thinking |
| **Timeline indicator** | How long project took, when built | Low | Context for complexity |
| **Client testimonials** | Quotes from clients (for client work) | Low | Social proof |
| **Open source contributions** | Link to your contributions on other projects | Medium | Shows community involvement |

### Anti-Features

Features to deliberately NOT build. Over-engineering or negative signals.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Too many projects** | Quantity over quality; buries best work | Showcase 4-8 best projects; "View all" link if more |
| **Incomplete projects** | Shows lack of follow-through | Only show shipped/substantial projects |
| **Tutorial projects** | Generic "todo app" signals junior level | Show unique projects that solve real problems |
| **Projects without live demos** | Missed opportunity to prove it works | Deploy even simple projects; screenshots as fallback |
| **Broken demo links** | Worse than no link at all | Regular link checking; graceful handling of dead links |
| **Walls of text** | Nobody reads long project descriptions | Lead with visuals, keep descriptions concise |
| **No GitHub links** | Missed opportunity to show code quality | Make repos public where possible |
| **Client work without permission** | Legal/ethical issues | Get permission or anonymize; show patterns not details |

---

## Dark Mode Features

### Table Stakes

Features users expect from any dark mode implementation in 2026. 82.7% of users use dark mode.

| Feature | Description | Complexity | Depends On |
|---------|-------------|------------|------------|
| **Toggle button** | Clear, accessible way to switch themes | Low | UI component |
| **System preference detection** | Default to OS preference via `prefers-color-scheme` | Low | CSS/JS |
| **Preference persistence** | Remember user's choice across sessions | Low | localStorage/cookies |
| **No flash on load** | Correct theme applied before first paint | Medium | Script injection or cookies |
| **Proper contrast ratios** | 4.5:1 for text, 3:1 for large text (WCAG AA) | Medium | Color palette design |
| **Dark gray, not pure black** | #121212 or similar; pure black causes eye strain | Low | Color palette |
| **Off-white text, not pure white** | Reduce contrast strain on dark backgrounds | Low | Color palette |

### Differentiators

Features that make dark mode implementation exceptional.

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **Smooth transition** | Gentle fade between themes, not jarring switch | Low | CSS transitions |
| **Icon that reflects state** | Sun/moon icon showing current or target state | Low | Better UX clarity |
| **Layered darkness** | Different shades for depth hierarchy (surface-0, surface-1, surface-2) | Medium | More polished appearance |
| **Code block themes** | Syntax highlighting adapts to light/dark | Medium | Requires theme-aware highlighter |
| **Image handling** | Proper image treatment (slight dim, themed borders) | Medium | Prevents blown-out images |
| **Keyboard shortcut** | Toggle with keyboard (e.g., Cmd+Shift+D) | Low | Power user feature |
| **Scheduled switching** | Auto-switch based on time of day | Medium | Nice touch, optional |
| **Accent color consistency** | Brand colors work in both modes | Medium | Requires careful palette design |

### Anti-Features

Features to deliberately NOT build. Common mistakes in dark mode implementation.

| Anti-Feature | Why Avoid | What to Do Instead |
|--------------|-----------|-------------------|
| **Pure black background (#000)** | Eye strain, halation effect, OLED concerns overblown | Use dark gray (#121212, #1a1a1a, etc.) |
| **Pure white text (#fff)** | Too much contrast on dark background | Use off-white (#e0e0e0, #f0f0f0) |
| **Auto-inverting images** | Makes photos look terrible | Design dark surfaces intentionally |
| **No system preference sync** | Ignores user's established preference | Always check `prefers-color-scheme` first |
| **Flash of wrong theme** | Jarring user experience, looks buggy | Use blocking script or cookies for SSR |
| **Forget to update favicon** | Light favicon invisible on dark browser chrome | Provide both or use adaptive favicon |
| **Single toggle position** | Hard to find in header vs settings | Header toggle is standard; be predictable |
| **Complex multi-theme system** | Over-engineering for a portfolio | Light and dark are sufficient |

---

## Feature Dependencies

Understanding what depends on what for implementation ordering.

```
Blog Features:
  MDX Setup
    ├── Post listing page
    ├── Individual post pages
    ├── Code syntax highlighting
    ├── Table of contents (parses headings)
    └── Categories/Tags (from frontmatter)

  Content Processing
    ├── Estimated reading time
    ├── Publication date
    └── Last updated date

  Next.js Metadata API (existing)
    ├── SEO metadata per post
    ├── Dynamic OG images
    └── RSS feed generation

Projects Showcase:
  Content Structure (new or extend content.json)
    ├── Project listing page
    ├── Individual project pages
    └── Featured projects (subset)

  Technology Stack Definition
    ├── Technology badges
    └── Filter by technology

  Existing Navigation
    └── Integration with site navigation

Dark Mode:
  CSS Variables Setup
    ├── All color references
    ├── Code block themes
    └── Image handling

  Theme Provider
    ├── Toggle button
    ├── System preference detection
    ├── Preference persistence
    └── No flash on load (requires script injection)

  Existing Tailwind Setup
    └── Dark mode class strategy configuration
```

### Implementation Order Recommendation

Based on dependencies:

1. **Dark Mode First** - Affects all UI, easier to implement before adding new content types
2. **Projects Showcase Second** - Simpler content model, leverages existing patterns
3. **Blog Third** - Most complex (MDX pipeline), benefits from dark mode and established patterns

---

## MVP vs Post-MVP Feature Matrix

### MVP (First Milestone)

**Blog:**
- Post listing page
- Individual post pages (MDX)
- Estimated reading time
- Publication date
- Code syntax highlighting
- SEO metadata
- 1-3 categories

**Projects:**
- Project listing page
- Individual project pages
- Live demo + source links
- Technology stack display
- Featured projects (2-4)
- Technology badges

**Dark Mode:**
- Toggle button in header
- System preference detection
- localStorage persistence
- No flash on load
- Proper contrast (dark gray + off-white)

### Post-MVP (Future Enhancements)

**Blog:**
- Table of contents
- Dynamic OG images
- RSS feed
- Search
- Series/collections
- Related posts

**Projects:**
- Filter by technology
- Case study format for select projects
- Metrics/outcomes
- Client testimonials

**Dark Mode:**
- Keyboard shortcut
- Scheduled switching
- Adaptive favicon

---

## Sources

### Blog Features
- [Josh W. Comeau - How I Built my Blog using MDX](https://www.joshwcomeau.com/blog/how-i-built-my-blog/)
- [Next.js MDX Guide](https://nextjs.org/docs/app/guides/mdx)
- [BrainStation - How to Build a Web Developer Portfolio](https://brainstation.io/career-guides/how-to-build-a-web-developer-portfolio)
- [DEV Community - The Anthology of a Creative Developer](https://dev.to/nk2552003/the-anthology-of-a-creative-developer-a-2026-portfolio-56jp)
- [Maggie Appleton - Digital Garden History](https://maggieappleton.com/garden-history)

### Projects Showcase
- [Frontend Mentor - Full-Stack Project Ideas](https://www.frontendmentor.io/articles/full-stack-project-ideas)
- [UXFol.io - UX Case Study Template](https://blog.uxfol.io/ux-case-study-template/)
- [Elementor - Best Web Developer Portfolio Examples](https://elementor.com/blog/best-web-developer-portfolio-examples/)
- [GitHub - Markdown Badges](https://github.com/Ileriayo/markdown-badges)

### Dark Mode
- [Tech-RZ - Dark Mode Design Best Practices in 2026](https://www.tech-rz.com/blog/dark-mode-design-best-practices-in-2026/)
- [NateBal - Best Practices for Dark Mode](https://natebal.com/best-practices-for-dark-mode/)
- [Design Studio UIUX - Dark Mode UI Best Practices](https://www.designstudiouiux.com/blog/dark-mode-ui-design-best-practices/)
- [GitHub - next-themes](https://github.com/pacocoursey/next-themes)
- [Digital Silk - Dark Mode Design Guide](https://www.digitalsilk.com/digital-trends/dark-mode-design-guide/)

### Comment Systems (for future reference)
- [Deployn - Self-Hosted Comment Systems](https://deployn.de/en/blog/self-hosted-comment-systems/)
- [Arek Nawo - Disqus Alternatives](https://areknawo.com/top-6-disqus-alternatives-for-technical-blogging/)
