# Stack Research

**Research Date:** 2026-01-21
**Focus:** Blog (MongoDB, GitHub OAuth, rich editor, comments/reactions), Projects Showcase (GitHub API), Dark Mode, Testing
**Confidence:** HIGH (verified with official documentation)

## Existing Stack (Validated - DO NOT CHANGE)

| Technology | Version | Status |
|------------|---------|--------|
| Next.js | 15.3.8 | Keep |
| React | 19.1.4 | Keep |
| TypeScript | 5.8.3 | Keep |
| Tailwind CSS | 4.1.10 | Keep |
| Framer Motion | 12.23.26 | Keep |
| Lenis | 1.3.16 | Keep |
| Sentry | 10.31.0 | Keep |
| lucide-react | 0.561.0 | Keep |

---

## Recommended Additions

### Authentication

- **next-auth@beta** (Auth.js v5) - GitHub OAuth authentication for blog admin
  - **Why:** Official Next.js authentication solution, v5 is the current recommended version for Next.js 15 App Router. Automatic environment variable inference (AUTH_GITHUB_ID, AUTH_GITHUB_SECRET). Built-in session management, middleware support, and route protection.
  - **Integration:** Works natively with App Router. Uses `auth()` function in Server Components, `useSession()` in Client Components. Middleware-based route protection.
  - **Source:** [Auth.js Official Installation Guide](https://authjs.dev/getting-started/installation)

### Database

- **mongodb** ^6.x - Official MongoDB Node.js driver
  - **Why:** Direct driver offers full control, lighter than Mongoose for a simple blog schema. Auth.js MongoDB adapter requires this package. MongoDB Atlas free tier is sufficient for portfolio blog.
  - **Integration:** Create `lib/mongodb.ts` for connection singleton. Use in Server Components and API routes. Works with serverComponentsExternalPackages config.
  - **Source:** [Auth.js MongoDB Adapter](https://authjs.dev/getting-started/adapters/mongodb)

- **@auth/mongodb-adapter** - Auth.js adapter for MongoDB session storage
  - **Why:** Required for persisting Auth.js sessions and accounts in MongoDB. Handles user creation on first OAuth login automatically.
  - **Integration:** Pass connected MongoClient to adapter in auth config. Shares connection pool with blog data queries.
  - **Source:** [Auth.js MongoDB Adapter](https://authjs.dev/getting-started/adapters/mongodb)

### Rich Text Editor

- **@tiptap/react** ^3.x - Headless rich text editor framework
  - **Why:** Most flexible modern editor. Headless architecture = complete UI control with Tailwind. Used by Linear, Superhuman, Notion-like experiences. Modular extension system.
  - **Integration:** Client Component only. Combine with Tailwind for toolbar styling. Store content as JSON (not HTML) in MongoDB for structured data.
  - **Source:** [Tiptap React Installation](https://tiptap.dev/docs/editor/getting-started/install/react)

- **@tiptap/pm** - ProseMirror dependencies
  - **Why:** Required peer dependency for Tiptap. Provides core editing engine.
  - **Integration:** Installed alongside @tiptap/react, no direct usage needed.

- **@tiptap/starter-kit** - Common extensions bundle
  - **Why:** Includes bold, italic, headings, lists, code blocks. Covers 90% of blog editing needs. Can add individual extensions later.
  - **Integration:** Pass to useEditor hook. Extend with @tiptap/extension-link, @tiptap/extension-image as needed.

### GitHub Integration (Projects Showcase)

- **@octokit/rest** ^22.x - Official GitHub REST API client
  - **Why:** Official GitHub SDK, fully typed, handles rate limiting and pagination. Fetch repos, languages, stars, descriptions for showcase.
  - **Integration:** Server-side only (API routes or Server Components). Use personal access token for higher rate limits. Cache responses with Next.js fetch cache.
  - **Source:** [Octokit REST.js v22](https://octokit.github.io/rest.js/v22/)

### Dark Mode

- **next-themes** ^0.4.x - Theme management for Next.js
  - **Why:** Zero-flash theme switching. Syncs across tabs. Respects system preference. Works with Tailwind CSS class strategy. 6.2k GitHub stars, battle-tested.
  - **Integration:** Wrap app in ThemeProvider. Add `suppressHydrationWarning` to `<html>`. Use @custom-variant in Tailwind 4 CSS.
  - **Source:** [next-themes GitHub](https://github.com/pacocoursey/next-themes)

### Testing

- **vitest** ^3.x - Modern test runner
  - **Why:** 4x faster than Jest. Native ESM/TypeScript support. Compatible with existing Jest patterns. Official Next.js documentation recommends. Works with Turbopack.
  - **Integration:** Create vitest.config.mts in root. Add test script to package.json. Use jsdom environment for component tests.
  - **Source:** [Next.js Vitest Guide](https://nextjs.org/docs/app/guides/testing/vitest)

- **@vitejs/plugin-react** - React plugin for Vitest
  - **Why:** Required for JSX transformation in tests. Provides Fast Refresh support.
  - **Integration:** Add to vitest.config.mts plugins array.

- **@testing-library/react** - Component testing utilities
  - **Why:** Industry standard for React testing. render(), screen, user events. Works identically to Jest usage.
  - **Integration:** Import render, screen in test files. Combine with Vitest assertions.

- **@testing-library/dom** - DOM testing utilities
  - **Why:** Peer dependency for @testing-library/react.
  - **Integration:** Installed automatically, used internally.

- **@testing-library/jest-dom** - Extended DOM matchers
  - **Why:** Provides toBeInTheDocument(), toHaveTextContent(), etc. Vitest-compatible via /vitest import.
  - **Integration:** Import in vitest.setup.ts: `import "@testing-library/jest-dom/vitest"`. Add setupFiles to vitest config.
  - **Source:** [jest-dom with Vitest](https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest)

- **jsdom** - DOM implementation for Node.js
  - **Why:** Required test environment for React components. Set as test.environment in vitest config.
  - **Integration:** Set `environment: 'jsdom'` in vitest.config.mts.

- **vite-tsconfig-paths** - TypeScript path resolution
  - **Why:** Resolves @/* path aliases in tests. Matches tsconfig.json paths configuration.
  - **Integration:** Add to vitest.config.mts plugins array.

- **@playwright/test** ^1.50.x - E2E testing framework
  - **Why:** Required for testing async Server Components (Vitest limitation). Cross-browser testing. Visual regression. Network mocking.
  - **Integration:** Run `npm init playwright` for setup. Add webServer config for dev server. Separate from unit tests.
  - **Source:** [Next.js Playwright Guide](https://nextjs.org/docs/pages/guides/testing/playwright)

---

## Integration Notes

### Authentication + Database Flow

```
GitHub OAuth -> Auth.js -> MongoDB Adapter -> User stored in MongoDB
                      |
                      v
              Session created -> Available in Server Components via auth()
```

### Tailwind CSS 4 Dark Mode Setup

Tailwind 4 removed `tailwind.config.js`. Dark mode requires CSS-based configuration:

```css
/* globals.css */
@import "tailwindcss";
@custom-variant dark (&:is(.dark *));

:root {
  --color-background: #ffffff;
  --color-foreground: #0a0a0a;
}

.dark {
  --color-background: #0a0a0a;
  --color-foreground: #ffffff;
}
```

next-themes ThemeProvider with `attribute="class"` triggers the `.dark` class on `<html>`.

### MongoDB Connection Pattern

```typescript
// lib/mongodb.ts
import { MongoClient } from "mongodb";

const uri = process.env.MONGODB_URI!;
const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  // Preserve client across hot reloads
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };
  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
```

### Testing Architecture

| Test Type | Tool | What to Test |
|-----------|------|--------------|
| Unit | Vitest + RTL | Utility functions, pure components |
| Integration | Vitest + RTL | Component interactions, form submissions |
| E2E | Playwright | Auth flows, full page interactions, async Server Components |

**Note:** Vitest does not support async Server Components. Use Playwright for those.

### Tiptap Editor Storage

Store editor content as JSON, not HTML:

```typescript
// MongoDB document structure
interface BlogPost {
  _id: ObjectId;
  title: string;
  slug: string;
  content: JSONContent; // Tiptap JSON format
  excerpt: string;
  publishedAt: Date | null;
  authorId: ObjectId;
  reactions: {
    [emoji: string]: number;
  };
}
```

---

## Not Recommended

- **Mongoose** - ORM overhead unnecessary for simple blog schema. Direct MongoDB driver is lighter and sufficient. Auth.js adapter uses mongodb driver directly.

- **Prisma** - Excellent ORM but adds build step complexity. MongoDB driver is simpler for this use case. Would require schema generation.

- **Draft.js** - Facebook's editor is legacy, complex, poorly maintained. Tiptap is the modern choice.

- **Quill** - Less flexible than Tiptap, harder to customize styling. Tiptap's headless approach fits Tailwind better.

- **Jest** - Slower than Vitest, requires more configuration for ESM/TypeScript. Next.js docs now recommend Vitest.

- **Cypress** - Heavier than Playwright, slower execution. Playwright is lighter and faster for Next.js E2E.

- **styled-components/Emotion** - Already using Tailwind CSS 4. Adding CSS-in-JS would complicate styling strategy.

- **Clerk/Supabase Auth** - Vendor lock-in, costs at scale. Auth.js is free, open-source, and sufficient for single-admin blog.

- **Disqus/Commento** - Third-party comment systems add tracking, blocked by ad blockers, limited customization. Custom MongoDB comments are lightweight and privacy-respecting.

---

## Configuration Requirements

### Environment Variables

```bash
# .env.local

# MongoDB
MONGODB_URI=mongodb+srv://...

# Auth.js
AUTH_SECRET=  # Generate with: npx auth secret
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# GitHub API (for projects showcase)
GITHUB_TOKEN=  # Personal access token with public_repo scope
```

### next.config.ts Updates

```typescript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["mongodb"],
  },
};
```

### Package Installation

```bash
# Authentication
pnpm add next-auth@beta @auth/mongodb-adapter mongodb

# Rich Text Editor
pnpm add @tiptap/react @tiptap/pm @tiptap/starter-kit

# Additional Tiptap extensions (optional, add as needed)
pnpm add @tiptap/extension-link @tiptap/extension-image @tiptap/extension-code-block-lowlight

# GitHub API
pnpm add @octokit/rest

# Dark Mode
pnpm add next-themes

# Testing (dev dependencies)
pnpm add -D vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom @testing-library/jest-dom vite-tsconfig-paths @playwright/test
```

---

## Sources

### Authentication
- [Auth.js Installation Guide](https://authjs.dev/getting-started/installation)
- [Auth.js Next.js Reference](https://authjs.dev/reference/nextjs)
- [Auth.js MongoDB Adapter](https://authjs.dev/getting-started/adapters/mongodb)
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5)

### Database
- [Mongoose with Next.js](https://mongoosejs.com/docs/nextjs.html)
- [Connecting MongoDB to Next.js 15](https://qasim.au/connecting-mongodb-to-a-nextjs-15-application)

### Rich Text Editor
- [Tiptap React Installation](https://tiptap.dev/docs/editor/getting-started/install/react)
- [Tiptap Getting Started](https://tiptap.dev/docs/editor/getting-started/overview)

### GitHub API
- [Octokit REST.js v22](https://octokit.github.io/rest.js/v22/)
- [Octokit GitHub Repository](https://github.com/octokit/rest.js)

### Dark Mode
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [next-themes GitHub](https://github.com/pacocoursey/next-themes)
- [Dark Mode with Tailwind v4 and Next.js](https://www.thingsaboutweb.dev/en/posts/dark-mode-with-tailwind-v4-nextjs)
- [Theme Colors with Tailwind CSS v4.0 and Next Themes](https://medium.com/@kevstrosky/theme-colors-with-tailwind-css-v4-0-and-next-themes-dark-light-custom-mode-36dca1e20419)

### Testing
- [Next.js Vitest Guide](https://nextjs.org/docs/app/guides/testing/vitest)
- [Next.js Playwright Guide](https://nextjs.org/docs/pages/guides/testing/playwright)
- [Vitest vs Jest Comparison](https://medium.com/@ruverd/jest-vs-vitest-which-test-runner-should-you-use-in-2025-5c85e4f2bda9)
- [Setting up Vitest for Next.js 15](https://www.wisp.blog/blog/setting-up-vitest-for-nextjs-15)
- [jest-dom with Vitest](https://markus.oberlehner.net/blog/using-testing-library-jest-dom-with-vitest)
