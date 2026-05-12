# Architecture Research — v2.0 (Polish, Integrations & Freelance)

**Domain:** Personal portfolio + blog (Next.js 16 App Router, single VPS via Coolify)
**Researched:** 2026-05-12
**Confidence:** HIGH — fully mapped existing codebase + read all referenced files; recommendations match documented conventions.

## Scope

This document covers architectural placement for v2.0 work **only**. It does not re-derive existing patterns (server-page ↔ client-island, content-as-props, server-only `src/lib/`, isomorphic `src/utils/`). Those are taken as fixed inputs from `.planning/codebase/ARCHITECTURE.md` and `.planning/codebase/STRUCTURE.md`.

Three milestones in scope:

- **Phase 6 — Auto-age** (content-refresh side-effect: server-computed `personal.age`).
- **Phase 7 — Integrations + /stats page** (GitHub heatmap & pinned repos, Tokscale stats, RSS subscriber count, `/now`).
- **Phase 8 — Freelance offering** (`/freelance` page, homepage callout, JSON-LD service schema, `/freelance.md` machine-readable file, robots.txt AI-bot rules).

## Global System Diagram (v2.0)

```text
┌────────────────────────────────────────────────────────────────────────────┐
│                        Browser (Next.js client)                            │
├──────────────┬──────────────┬──────────────┬──────────────┬───────────────┤
│  /  (home)   │  /blog       │  /stats      │  /freelance  │  /now         │
│ HomeClient   │ BlogListCli  │ StatsClient  │ Freelance    │ (server-only) │
│              │              │ (interactive)│ Client       │               │
└──────┬───────┴──────┬───────┴──────┬───────┴──────┬───────┴──────┬────────┘
       │              │              │              │              │
       ▼              ▼              ▼              ▼              ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                Next.js App Router (RSC + Route Handlers)                   │
│  app/page.tsx  app/blog/...  app/stats/page.tsx  app/freelance/page.tsx    │
│  app/now/page.tsx  app/freelance.md/route.ts  app/robots.ts (extended)     │
└──────┬─────────────────────────┬───────────────────────────────┬───────────┘
       │                         │                               │
       ▼                         ▼                               ▼
┌──────────────────┐  ┌─────────────────────────────┐  ┌───────────────────┐
│ Content layer    │  │  Integrations layer (NEW)   │  │  Existing dynamic │
│ public/          │  │  src/lib/github.ts          │  │  src/lib/blog.ts  │
│   content.json   │  │  src/lib/tokscale.ts        │  │  src/lib/auth.ts  │
│ src/utils/       │  │  src/lib/rss-subscribers.ts │  │  src/lib/upload.ts│
│   serverContent  │  │  src/utils/age.ts (pure)    │  │                   │
│   Loader.ts      │  │                             │  │                   │
└──────────┬───────┘  └─────────────┬───────────────┘  └─────────┬─────────┘
           │                        │                            │
           ▼                        ▼                            ▼
┌──────────────────────────────────────────────────────────────────────────┐
│  External / persistent stores                                            │
│  - public/content.json  (CV source of truth, now includes birthday,      │
│                          freelance, now, integrations meta)              │
│  - GitHub REST API      (auth via GITHUB_PAT env)                        │
│  - tokscale.ai          (scrape or undocumented JSON; cached)            │
│  - api.lagden.dev       (presence, existing)                             │
│  - MongoDB              (blog, sessions; unchanged)                      │
│  - Next.js fetch cache  (revalidate: 3600 for stats sources)             │
└──────────────────────────────────────────────────────────────────────────┘
```

**Key invariants preserved:**

1. **Server-only modules stay under `src/lib/`** (anything touching `GITHUB_PAT`, raw HTTP to third parties, or filesystem).
2. **Pure helpers stay under `src/utils/`** (only `age.ts` qualifies in this milestone — no DOM, no secrets, no network).
3. **Server page ↔ `*Client` split is mandatory** for any page that needs interactivity. `/now` and `/freelance.md` are server-only and skip the client island.
4. **Content-as-props discipline** holds: only `loadContentServer()` reads `public/content.json`; everything else accepts a typed slice as a prop or import from the resulting `ContentData`.
5. **`ClearIntro` (or equivalent)** must be rendered on every non-home route to dispose of the `#initial-loader` and `intro-locked` body class from the root layout.

---

## Phase 6 — Auto-age

### Files & changes

| Action | Path | Notes |
|--------|------|-------|
| CREATE | `src/utils/age.ts` | Pure function. No imports beyond TS lib. |
| MODIFY | `src/types/content.ts` | Add `personal.birthday: string` (ISO date `YYYY-MM-DD`). Keep `personal.age: number` (now computed). |
| MODIFY | `src/utils/serverContentLoader.ts` | After `JSON.parse`, call `computeAge` and overwrite `content.personal.age`. Strip `birthday` from the returned object before handing to client islands. |
| MODIFY | `public/content.json` | Add `personal.birthday`, leave existing `personal.age` (will be overwritten at load time — value becomes irrelevant but kept for schema compat). |

### `src/utils/age.ts` signature

```ts
export function computeAge(birthday: string, now: Date = new Date()): number {
  const dob = new Date(birthday);
  let age = now.getFullYear() - dob.getFullYear();
  const monthDiff = now.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}
```

Pure, deterministic, no I/O. Lives in `utils/` not `lib/` because it has no server-only dependencies.

### Type modeling — recommendation

**Recommended: keep `personal.age: number` as a required field, add `personal.birthday: string` as required, strip `birthday` at the server-loader boundary.**

```ts
// src/types/content.ts
export interface Personal {
  name: string;
  title: string;
  email: string;
  location: string;
  locationMapUrl: string;
  birthday: string;            // NEW — ISO `YYYY-MM-DD`. Server-only field; stripped before reaching client.
  age: number;                 // NEW — computed in serverContentLoader; the value in content.json is overwritten.
  social: { /* ... */ };
  websites: { /* ... */ };
}
```

Rationale:

- **Single typed surface** for all consumers: components keep reading `content.personal.age` exactly as they do today. No conditional `?? computeAge(...)` litter throughout the codebase.
- **`birthday` never reaches the client** (strip it in `loadContentServer`), so the privacy concern is addressed at one chokepoint. The `ContentData` type that `HomeClient` and friends consume can be the same `ContentData`, but the runtime value passed in has `birthday` deleted.
- **Avoid optional age** (`age?: number`): would force null-checks at every consumer; the whole point of computing it is that it's always present.
- **Don't introduce a separate `ContentDataClient` vs `ContentDataServer` type** unless `birthday` exposure becomes a real concern — over-engineering for one field. If you want belt-and-braces, you can declare it as an optional field on the public type and a required field on a server-internal type, but inline `delete` at the loader is simpler and verified by lint.

### Updated `loadContentServer`

```ts
// src/utils/serverContentLoader.ts
import { ContentData } from "@/types/content";
import { promises as fs } from "fs";
import path from "path";
import { computeAge } from "@/utils/age";

export async function loadContentServer(): Promise<ContentData> {
  const contentPath = path.join(process.cwd(), "public", "content.json");
  const contentString = await fs.readFile(contentPath, "utf-8");
  const content = JSON.parse(contentString) as ContentData;

  if (content.personal.birthday) {
    content.personal.age = computeAge(content.personal.birthday);
  }
  // Strip birthday before it reaches client islands.
  delete (content.personal as Partial<typeof content.personal>).birthday;

  return content;
}
```

Note: the `delete` requires loosening the type locally; `Partial<...>` cast is the cleanest idiom in TS strict mode. Alternative: structural reassignment (`const { birthday, ...rest } = content.personal; content.personal = rest as Personal;`) — verbose but typed.

### Data flow

```
public/content.json
   { personal: { birthday: "2003-12-XX", age: 22 (stale), ... } }
         │
         ▼
loadContentServer()  ──►  computeAge(birthday) ──►  overwrite age
         │
         ▼ (delete personal.birthday)
ContentData (server-side, age live, birthday gone)
         │
         ▼ (props)
HomeClient / metadata / sections — read content.personal.age unchanged
```

### Integration points

- `loadContentServer()` is called from: `src/app/layout.tsx` (generateMetadata + GA), `src/app/page.tsx` (home), `src/app/sitemap.ts`, `src/app/robots.ts`, `src/app/now/page.tsx` (new), `src/app/freelance/page.tsx` (new), `src/app/stats/page.tsx` (new). All of them inherit the age computation for free — no per-call changes needed.
- AboutSection / HomeClient already consume `content.personal.age` indirectly (`content.about.mainDescription` may interpolate, or it may not — verify when writing the about copy). Either way, no component change is required because the field is overwritten in place.

### Build prerequisites

- None. Phase 6 is independent and can land before, after, or interleaved with Phases 7/8.

---

## Phase 7 — Integrations + /stats page

### Files & changes

| Action | Path | Purpose |
|--------|------|---------|
| CREATE | `src/lib/github.ts` | Server-only GitHub API client (PAT auth, fetch + revalidate). |
| CREATE | `src/lib/tokscale.ts` | Server-only Tokscale fetch/scrape with last-known-good fallback. |
| CREATE | `src/lib/rss-subscribers.ts` | Server-only — placeholder until a real subscriber source is chosen (Feedly stats, manual config, or returns null). |
| CREATE | `src/types/stats.ts` | `GitHubHeatmap`, `PinnedRepo`, `TokscaleStats`, `StatsBundle`, etc. |
| CREATE | `src/app/stats/page.tsx` | RSC: fetches all stats in parallel, hands to `StatsClient`. |
| CREATE | `src/app/stats/StatsClient.tsx` | Interactive client island: heatmap hover, repo card animations, refresh button (optional). |
| CREATE | `src/app/now/page.tsx` | Server-only RSC. Reads `content.now` from `content.json`. Mostly static. |
| CREATE | `src/components/stats/GitHubHeatmap.tsx` | Visualises 365-day commit grid. |
| CREATE | `src/components/stats/PinnedRepos.tsx` | Repo card grid. |
| CREATE | `src/components/stats/TokscaleCard.tsx` | Tokscale stats summary card. |
| CREATE | `src/components/stats/StatsTeaser.tsx` | Compact homepage variant — fetched server-side via the same lib utilities, rendered as a CV-style section. |
| MODIFY | `src/types/content.ts` | Add `now: NowContent`, `integrations: IntegrationsConfig` (Discord ID / GH username already exist; this is for stats-specific config like `pinnedRepos: string[]`). |
| MODIFY | `public/content.json` | Populate `now` and `integrations` sections. |
| MODIFY | `src/app/HomeClient.tsx` | Wire `StatsTeaser` into the section list (props passed from `page.tsx`); add `stats` to nav iconMap. |
| MODIFY | `src/app/page.tsx` | Fetch stats bundle alongside content and blog posts; pass to `HomeClient`. |
| MODIFY | `src/components/layout/Navigation.tsx` | Add icon for `stats` if it becomes a homepage section. |
| MODIFY | `src/app/sitemap.ts` | Add `/stats`, `/now` URLs. |
| MODIFY | `next.config.ts` | Allowlist `avatars.githubusercontent.com` (already done) plus any GitHub repo OG image domain if needed (probably not — pinned repo display uses GH avatar + repo name). |

**Decision: NO API routes for stats.** Fetch directly from RSCs. Reasons:

1. Single-replica deployment — no horizontal-scale concerns.
2. Next.js fetch-cache with `revalidate: 3600` is server-side. An API route would just be a redundant proxy.
3. `GITHUB_PAT` must never reach the browser. Direct fetch from RSC keeps it server-only without an extra hop.
4. Avoids CORS surface and reduces network hops for SSR latency.

The only exception: if the stats card needs a manual refresh button that re-validates the cache without waiting for the next deploy or revalidation tick, add `src/app/api/stats/revalidate/route.ts` later as a small POST that calls `revalidatePath('/stats')`. **Out of scope for v2.0** unless the spec calls for it.

### Module signatures

```ts
// src/lib/github.ts — server-only
import "server-only";  // optional but recommended — fails build if imported from client
import type { GitHubContribution, PinnedRepo } from "@/types/stats";

const GH_API = "https://api.github.com";
const REVALIDATE_SECONDS = 3600;

function authHeaders(): HeadersInit {
  const token = process.env.GITHUB_PAT;
  if (!token) {
    throw new Error("[github] GITHUB_PAT env var is not set");
  }
  return {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "zachlagden.uk-stats",
  };
}

export async function getContributionGrid(username: string): Promise<GitHubContribution[]> {
  // Use GraphQL contributionsCollection endpoint — REST does not expose this.
  // Single POST to https://api.github.com/graphql with a query.
  // Cache via Next's fetch options.
  const res = await fetch(`${GH_API}/graphql`, {
    method: "POST",
    headers: { ...authHeaders(), "Content-Type": "application/json" },
    body: JSON.stringify({ query: CONTRIB_QUERY, variables: { username } }),
    next: { revalidate: REVALIDATE_SECONDS, tags: ["github-contributions"] },
  });
  if (!res.ok) throw new Error(`GitHub GraphQL ${res.status}`);
  return parseContributions(await res.json());
}

export async function getPinnedRepos(repoSpecs: string[]): Promise<PinnedRepo[]> {
  // repoSpecs is array of "owner/repo" strings from content.integrations.pinnedRepos.
  // Parallel GET /repos/{owner}/{repo} via Promise.all.
  const results = await Promise.all(
    repoSpecs.map((spec) => fetchRepo(spec)),
  );
  return results.filter(Boolean) as PinnedRepo[];
}
```

```ts
// src/lib/tokscale.ts — server-only
import "server-only";
import type { TokscaleStats } from "@/types/stats";

const FALLBACK: TokscaleStats = {
  followers: null,
  totalViews: null,
  lastUpdated: null,
  source: "fallback",
};

export async function getTokscaleStats(username: string): Promise<TokscaleStats> {
  try {
    // 1. Try undocumented JSON endpoint (research findings — Phase 7 research).
    // 2. Fall back to HTML scrape via regex on meta tags / __NEXT_DATA__.
    // 3. On total failure, return FALLBACK and log.
    const res = await fetch(`https://tokscale.ai/u/${username}`, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; zachlagden-bot)" },
      next: { revalidate: 3600, tags: ["tokscale"] },
    });
    if (!res.ok) {
      console.error("[tokscale] fetch failed:", res.status);
      return FALLBACK;
    }
    const html = await res.text();
    return parseTokscaleHtml(html);
  } catch (err) {
    console.error("[tokscale] error:", err);
    return FALLBACK;
  }
}
```

```ts
// src/lib/rss-subscribers.ts — server-only
import "server-only";

// Stub for v2.0. Returns null unless a real source is wired up.
export async function getRssSubscriberCount(): Promise<number | null> {
  // Options for later: Feedly statistics endpoint, manual config value,
  // or count via a tracker pixel (out of scope).
  return null;
}
```

### `src/types/stats.ts`

```ts
export interface GitHubContribution {
  date: string;  // YYYY-MM-DD
  count: number;
  level: 0 | 1 | 2 | 3 | 4;  // intensity bucket
}

export interface PinnedRepo {
  name: string;        // "zachlagden.uk"
  fullName: string;    // "zachlagden/zachlagden.uk"
  description: string | null;
  url: string;
  stars: number;
  forks: number;
  language: string | null;
  languageColor: string | null;
  updatedAt: string;
}

export interface TokscaleStats {
  followers: number | null;
  totalViews: number | null;
  lastUpdated: string | null;
  source: "live" | "fallback";
}

export interface StatsBundle {
  github: {
    contributions: GitHubContribution[] | null;
    pinned: PinnedRepo[];
    error: string | null;
  };
  tokscale: TokscaleStats;
  rss: { subscribers: number | null };
}
```

### Content schema additions

```ts
// src/types/content.ts (additions)
export interface NowContent {
  lastUpdated: string;     // ISO date — when this section was last manually refreshed
  focus: string;           // markdown-ish paragraph
  learning: string[];
  location: string;
  sideProjects: { name: string; url?: string; description: string }[];
}

export interface IntegrationsConfig {
  githubUsername: string;            // e.g. "zachlagden"
  pinnedRepos: string[];             // ["owner/name", ...]
  tokscaleUsername: string | null;   // null = section hidden
  showHomepageTeaser: boolean;       // toggle for homepage `StatsTeaser`
}

export interface ContentData {
  /* existing fields */
  now: NowContent;
  integrations: IntegrationsConfig;
}
```

### Data flow — `/stats`

```
GET /stats
   │
   ▼
src/app/stats/page.tsx  (RSC, no "use client")
   │
   ├──► loadContentServer()         → integrations config + Person metadata
   ├──► getContributionGrid(...)    → src/lib/github.ts → fetch GraphQL (1h cache)
   ├──► getPinnedRepos(...)         → src/lib/github.ts → fetch REST x N (1h cache)
   ├──► getTokscaleStats(...)       → src/lib/tokscale.ts (1h cache, fallback safe)
   └──► getRssSubscriberCount()     → src/lib/rss-subscribers.ts (null in v2.0)
   │
   ▼ (Promise.all → StatsBundle)
serialize / pass as props
   │
   ▼
<StatsClient stats={bundle} content={content} />
   │
   ├── <GitHubHeatmap data={bundle.github.contributions} />
   ├── <PinnedRepos repos={bundle.github.pinned} />
   ├── <TokscaleCard data={bundle.tokscale} />
   └── (RSS subscriber line — hidden if null)
```

**Error handling:** Each `src/lib/*` call wrapped in `try/catch` at the page level (mirroring `src/app/page.tsx` MongoDB pattern). On failure, the relevant `StatsBundle` field is null/fallback and the component renders a graceful "stats unavailable" pill. `console.error` for visibility — no Sentry, by milestone constraint.

### Data flow — `/now`

```
GET /now
   │
   ▼
src/app/now/page.tsx  (RSC, server-only — no client island needed)
   │
   ├──► loadContentServer() → content.now
   │
   ▼
Static render: <h1>What I'm Up To</h1> + grid of focus/learning/sideProjects.
<ClearIntro /> mounted to dispose home-route intro loader.
```

**No `NowClient.tsx` needed** — the page is pure presentation. If you want subtle reveal animations, drop them in favor of CSS-only fade-ins (`animate-in fade-in` via Tailwind) to keep the route SSG-friendly. If `framer-motion` is required, then yes, you need a tiny `NowClient` wrapper for the animated parts.

### Data flow — homepage `StatsTeaser`

```
GET /
   │
   ▼
src/app/page.tsx  (RSC, EXISTING)
   │
   ├──► loadContentServer()    (existing)
   ├──► getLatestPosts(3)      (existing)
   └──► getStatsTeaserBundle() (NEW — subset of full stats)
                ├──► getPinnedRepos (top 2-3 only)
                └──► getContributionGrid (just last 30 days for compactness)
   │
   ▼
<HomeClient
   content={content}
   blogPosts={posts}
   statsTeaser={teaserBundle}   {/* NEW prop */}
/>
   │
   ▼ inside main:
<StatsTeaser data={statsTeaser} sectionIndex={?} />
   (hidden if integrations.showHomepageTeaser === false)
```

**Section ordering on home:** Existing order is About, Experience, Education, Skills, Certifications, Blog, Contact. Recommended insertion for Stats teaser: between Skills and Certifications (skills naturally lead into "and here's what I've been doing with them"), or between Blog and Contact (as a "more from me" footer area). Final placement is a design call, not architectural.

**Nav addition:** If StatsTeaser becomes a numbered section, add `stats` to `content.navigation`, `iconMap` in `Navigation.tsx`, `iconMap` in `MobileMenu.tsx`, and the `sectionRefs` map + `useSectionObserver` config in `HomeClient.tsx`. **Simpler alternative:** don't put it in nav — render it as a non-section CTA card that links to `/stats`. Recommended.

### Caching strategy

- **Use Next's fetch cache** (`next: { revalidate: 3600, tags: [...] }`). Single VPS → in-process cache is sufficient.
- **Do not introduce a separate filesystem or Mongo cache.** Adds operational complexity for no benefit at this scale.
- **`revalidateTag`** is the right tool for the optional manual refresh button later. Tags: `"github-contributions"`, `"github-pinned"`, `"tokscale"`.
- **Static-by-default for `/now` and `/freelance`** — RSCs that read only `content.json` and have no `fetch()` external calls are statically rendered at build time. `/stats` becomes ISR with implicit 1-hour validity (driven by the inner `fetch` calls' revalidate hint).
- **Edge runtime: no.** All these routes touch Node-only modules (`fs`, MongoDB driver). Keep the default Node runtime for the entire app.

### Env vars

- Add to `.env.example`:
  ```
  # Optional — enables /stats GitHub features. Read-only PAT is sufficient.
  GITHUB_PAT=
  ```
- Add to Coolify env (Phase 5 prerequisite work — env-vars runbook). Document scope: `read:user`, `public_repo` (for stars) — no write scopes needed. Contributions are visible without scopes for public users via the GraphQL `viewer` (own PAT) or any user via `user(login:...)`.

### Build prerequisites

- **Phase 7 depends on Phase 5** (env-vars runbook) for documenting `GITHUB_PAT`. Order: Phase 5 → 6 → 7 → 8 is the cleanest.
- **Phase 7 does not depend on Phase 6** other than soft coupling (Phase 6 changes `content.json` shape, and Phase 7 also extends the same file; do them in series to avoid merge friction, but they're independent).
- Within Phase 7, build order:
  1. `src/types/stats.ts` + `src/types/content.ts` additions (types-first so subsequent code is checked).
  2. `src/lib/github.ts` (heaviest — needs research-validated GraphQL query).
  3. `src/lib/tokscale.ts` + fallback mechanism.
  4. `src/lib/rss-subscribers.ts` stub.
  5. `src/app/stats/page.tsx` + `StatsClient.tsx` + child components.
  6. `src/app/now/page.tsx`.
  7. `StatsTeaser` integration into homepage.
  8. `src/app/sitemap.ts` URL additions.

---

## Phase 8 — Freelance offering

### Files & changes

| Action | Path | Purpose |
|--------|------|---------|
| CREATE | `src/app/freelance/page.tsx` | RSC. Loads content, renders mostly static page + JSON-LD Service schema. |
| CREATE | `src/app/freelance/FreelanceClient.tsx` | Minimal client island ONLY for Cal.com CTA click event tracking. Could be skipped if a server-rendered `<a>` with no JS is acceptable. |
| CREATE | `src/app/freelance.md/route.ts` | Dynamic route handler. Returns `text/markdown` generated from `content.freelance`. |
| MODIFY | `src/app/robots.ts` | Add per-bot allow rules (GPTBot, Claude-Web, PerplexityBot, etc.) + crawl-delay policy. |
| MODIFY | `src/types/content.ts` | Add `Freelance` interface + `personal.freelance: Freelance`. |
| MODIFY | `public/content.json` | Populate `personal.freelance`. |
| MODIFY | `src/app/HomeClient.tsx` | Conditionally render available-for-work callout when `content.personal.freelance.available === true`. |
| MODIFY | `src/components/layout/Navigation.tsx` + `MobileMenu.tsx` | Optional: add `/freelance` link to nav. Probably as an external nav button rather than a section ID. |
| MODIFY | `src/app/sitemap.ts` | Add `/freelance` URL. Decide whether to include `/freelance.md` (recommended yes, content negotiated). |
| CREATE | `src/components/freelance/PricingTier.tsx` | Tier card. |
| CREATE | `src/components/freelance/ServiceCategory.tsx` | Category list item. |
| CREATE | `src/components/freelance/CalCtaButton.tsx` | The interactive piece (`"use client"`). |
| CREATE | `src/components/freelance/FreelanceSchema.tsx` | Inline JSON-LD `<script>`. Server-renderable; pure data. |
| CREATE | `src/components/sections/AvailabilityCallout.tsx` | Homepage callout block. Conditionally rendered. |

### Content schema additions

```ts
// src/types/content.ts (additions)
export interface FreelanceTier {
  id: string;                          // e.g. "starter", "growth", "retainer"
  name: string;
  priceFrom: number;                   // GBP, lowercase noun
  priceLabel: string;                  // e.g. "from £500 / project"
  audience: string;                    // "for indie hackers needing a landing page"
  includes: string[];
  deliveryTime: string;                // "2-3 weeks"
}

export interface FreelanceService {
  category: string;                    // "Web Development"
  items: string[];
}

export interface Freelance {
  available: boolean;                  // toggle for homepage callout
  headline: string;                    // "Available for select projects"
  intro: string;                       // 1-2 paragraph blurb
  calLink: string;                     // https://cal.com/zachlagden/intro
  responseTime: string;                // "within 24h on weekdays"
  tiers: FreelanceTier[];
  services: FreelanceService[];
  doesNotDo: string[];                 // anti-list
  coverage: string[];                  // ["Reading", "Wokingham", "Bracknell", "Newbury", ...]
}

export interface Personal {
  /* existing fields */
  freelance: Freelance;
}
```

### `src/app/freelance/page.tsx` skeleton

```tsx
// src/app/freelance/page.tsx — server component
import type { Metadata } from "next";
import { loadContentServer } from "@/utils/serverContentLoader";
import FreelanceClient from "./FreelanceClient";
import FreelanceSchema from "@/components/freelance/FreelanceSchema";
import ClearIntro from "@/components/ui/ClearIntro";

export async function generateMetadata(): Promise<Metadata> {
  const content = await loadContentServer();
  return {
    title: "Freelance",
    description: content.personal.freelance.intro.slice(0, 160),
    alternates: { canonical: "/freelance" },
  };
}

export default async function FreelancePage() {
  const content = await loadContentServer();
  return (
    <>
      <ClearIntro />
      <FreelanceSchema freelance={content.personal.freelance} personal={content.personal} siteUrl={content.metadata.siteUrl} />
      <FreelanceClient content={content} />
    </>
  );
}
```

### `src/app/freelance.md/route.ts` (machine-readable file)

**Recommendation: dynamic route handler, NOT a build-time generated `public/freelance.md`.**

Reasons:

- Stays in sync with `content.json` with zero build-step ceremony.
- Next.js serves it at the same domain with normal caching headers.
- A postbuild script would require either a `prebuild` hook adding I/O to the Dockerfile or a separate generated file checked into Git — both add friction.
- The route handler is ~15 lines of Markdown templating; trivial to maintain.

```ts
// src/app/freelance.md/route.ts
import { loadContentServer } from "@/utils/serverContentLoader";

export const dynamic = "force-static";    // build-time render; revalidates with content.json
export const revalidate = 3600;

export async function GET() {
  const content = await loadContentServer();
  const f = content.personal.freelance;
  const md = renderFreelanceMarkdown(f, content.personal);
  return new Response(md, {
    status: 200,
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}

function renderFreelanceMarkdown(f: Freelance, p: Personal): string {
  return [
    `# Freelance Services — ${p.name}`,
    "",
    f.intro,
    "",
    `**Available:** ${f.available ? "Yes" : "No"}`,
    `**Response time:** ${f.responseTime}`,
    `**Book a call:** ${f.calLink}`,
    "",
    "## Tiers",
    ...f.tiers.flatMap((t) => [
      `### ${t.name}`,
      t.priceLabel,
      `*For:* ${t.audience}`,
      `*Delivery:* ${t.deliveryTime}`,
      "",
      ...t.includes.map((i) => `- ${i}`),
      "",
    ]),
    "## Services",
    ...f.services.flatMap((s) => [`### ${s.category}`, ...s.items.map((i) => `- ${i}`), ""]),
    "## What I Don't Do",
    ...f.doesNotDo.map((x) => `- ${x}`),
    "",
    "## Coverage",
    f.coverage.join(", "),
  ].join("\n");
}
```

**Caveat about the URL `/freelance.md`:** Next.js will treat `freelance.md` as a literal route segment. Folder name with a dot is supported (verified across the codebase via existing `feed.xml/`). Pattern is identical to `src/app/blog/feed.xml/route.ts`.

### Service schema markup

JSON-LD inline in `<FreelanceSchema>` component, rendered server-side. The existing Person schema in `HomeClient` is unaffected — schemas coexist as multiple `<script type="application/ld+json">` tags on different pages.

```tsx
// src/components/freelance/FreelanceSchema.tsx — server component
export default function FreelanceSchema({ freelance, personal, siteUrl }: Props) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `Freelance Web Development by ${personal.name}`,
    provider: {
      "@type": "Person",
      name: personal.name,
      url: siteUrl,
    },
    areaServed: freelance.coverage.map((town) => ({ "@type": "City", name: town })),
    offers: freelance.tiers.map((t) => ({
      "@type": "Offer",
      name: t.name,
      priceCurrency: "GBP",
      price: t.priceFrom,
      description: t.audience,
    })),
    serviceType: freelance.services.map((s) => s.category),
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

### Cal.com CTA + GA event tracking

```tsx
// src/components/freelance/CalCtaButton.tsx
"use client";
import { sendGAEvent } from "@next/third-parties/google";

interface Props { href: string; label?: string; }
export default function CalCtaButton({ href, label = "Book a call" }: Props) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onClick={() =>
        sendGAEvent("event", "freelance_cal_click", {
          event_category: "engagement",
          event_label: "freelance_cta",
        })
      }
      className="..."
    >
      {label}
    </a>
  );
}
```

GA is already provisioned in `src/app/layout.tsx` via `<GoogleAnalytics gaId={...} />` from `@next/third-parties/google`. `sendGAEvent` is the supported helper. No additional setup needed.

### Robots.txt AI bot rules

Current `src/app/robots.ts` is a 14-line `allow: /` wildcard. Replace with explicit per-bot rules. **Architectural decision: keep this as `src/app/robots.ts`, do not write a static `public/robots.txt`** — the dynamic version already reads `siteUrl` from `content.json`.

```ts
// src/app/robots.ts (expanded)
import type { MetadataRoute } from "next";
import { loadContentServer } from "@/utils/serverContentLoader";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const content = await loadContentServer();

  return {
    rules: [
      // Standard search engines — allow everything except admin
      { userAgent: "*", allow: "/", disallow: ["/admin", "/api"] },

      // AI training crawlers — explicit allow (Zach is OK being trained on)
      // OR disallow (Zach prefers not). Decision is content-team / Phase 8 spec.
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "CCBot", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      { userAgent: "Google-Extended", allow: "/" },
      { userAgent: "Applebot-Extended", allow: "/" },
    ],
    sitemap: `${content.metadata.siteUrl}/sitemap.xml`,
    host: content.metadata.siteUrl,
  };
}
```

Move the allow/disallow decision into `content.metadata` or a new `content.policies.aiBots: "allow" | "disallow"` field if you want it data-driven; otherwise hardcode.

### Homepage availability callout

```tsx
// src/components/sections/AvailabilityCallout.tsx
"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import type { Freelance } from "@/types/content";

interface Props { freelance: Freelance; prefersReducedMotion: boolean; }
export default function AvailabilityCallout({ freelance, prefersReducedMotion }: Props) {
  if (!freelance.available) return null;
  return (
    <motion.aside
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0.1 : 0.5 }}
      className="..."
    >
      <p>{freelance.headline}</p>
      <Link href="/freelance" className="...">Learn more →</Link>
    </motion.aside>
  );
}
```

Rendered in `HomeClient.tsx` either above the AboutSection (most prominent) or above the ContactSection (more discreet, "available for hire" footer). Recommended: a small pill near the hero — `Header.tsx` could host it, but cleaner is to render it in `HomeClient` between the social-icons column and the main grid.

### Data flow — `/freelance`

```
GET /freelance
   │
   ▼
src/app/freelance/page.tsx  (RSC, static)
   │
   ├──► loadContentServer() → content.personal.freelance
   │
   ▼
<ClearIntro />
<FreelanceSchema /> (JSON-LD)
<FreelanceClient content={content} />
   │
   ▼ FreelanceClient renders:
- Hero (intro, response time)
- <PricingTier /> ×N
- <ServiceCategory /> ×N
- "What I don't do" list
- "Areas I cover" list
- <CalCtaButton /> (the only client-interactive piece — fires GA event)
```

**FreelanceClient question — does it need to be `"use client"` at all?**

Probably yes, but only to host the `CalCtaButton`. Alternative: keep `FreelancePage` as server-only and embed `<CalCtaButton>` (its own `"use client"`) directly. That removes the redundant `FreelanceClient.tsx` wrapper and is cleaner. **Recommended.**

```tsx
// Simpler — no FreelanceClient.tsx at all:
export default async function FreelancePage() {
  const content = await loadContentServer();
  const f = content.personal.freelance;
  return (
    <>
      <ClearIntro />
      <FreelanceSchema freelance={f} personal={content.personal} siteUrl={content.metadata.siteUrl} />
      <main className="...">
        {/* server-rendered hero, tiers, services, coverage */}
        <CalCtaButton href={f.calLink} />
      </main>
    </>
  );
}
```

This is the **stronger architectural recommendation**: every page does not need a paired `*Client.tsx`. The pattern exists for islands that are heavily interactive (home, blog list, blog post). Freelance is mostly static — keep it that way.

### Build prerequisites

- **Phase 8 depends on Phase 6** only if the freelance content references age ("22-year-old developer based in..."). Otherwise independent.
- **Phase 8 does not depend on Phase 7** but logically they share the content.json migration window.
- Within Phase 8, build order:
  1. `src/types/content.ts` `Freelance` interface.
  2. `public/content.json` `personal.freelance` block (with `available: false` initially so callout doesn't surface during dev).
  3. `src/components/freelance/*` primitives.
  4. `src/app/freelance/page.tsx`.
  5. `src/app/freelance.md/route.ts`.
  6. `src/app/robots.ts` expansion.
  7. `src/components/sections/AvailabilityCallout.tsx` + wire into `HomeClient`.
  8. `src/app/sitemap.ts` URL addition.
  9. Flip `available: true` once everything is verified.

---

## Suggested Cross-Phase Build Order

```
Phase 5 (env runbook) → Phase 6 (age) → Phase 7 (stats/now) → Phase 8 (freelance)
       │                       │                  │                    │
       │ defines GITHUB_PAT    │ touches          │ touches            │ touches
       │ in Coolify            │ content.json     │ content.json       │ content.json
       │                       │ Personal type    │ adds NowContent,   │ adds Freelance,
       │                       │                  │ IntegrationsConfig │ extends Personal
```

**Hard dependencies:**

- **Phase 7 → Phase 5**: `GITHUB_PAT` env var must be provisioned in Coolify before `/stats` will work in prod. The code can be written and tested locally with a dotfile-stored PAT.
- **All phases → Phase 6 (soft)**: `content.json` schema changes pile up; do them sequentially to keep diffs reviewable.

**Soft dependencies:**

- Phase 7 and 8 both modify `src/app/HomeClient.tsx` (StatsTeaser, AvailabilityCallout). Sequence them so each lands in its own commit — avoids three-way merge pain.
- Phase 7 and 8 both modify `src/app/sitemap.ts`. Add all new URLs (`/stats`, `/now`, `/freelance`, `/freelance.md`) in one go at the end of Phase 8, or piecemeal as each route ships.
- Phase 7 and 8 both modify `src/types/content.ts`. Add all new interfaces at the top of the phase, populate `content.json` incrementally.

**No dependencies:**

- Phase 6 (age) is fully independent. Can land first as a warm-up.
- `/now` (Phase 7) has no external API dependency; can land before the GitHub/Tokscale pieces.

---

## Anti-Patterns to Avoid

### Anti-Pattern 1: Wrapping every new page in a `*Client.tsx`

**What people do:** Mirror the home-page pattern blindly — `app/now/page.tsx` + `app/now/NowClient.tsx`, `app/freelance/page.tsx` + `app/freelance/FreelanceClient.tsx` even when the page is mostly static.

**Why it's wrong:** Forces `"use client"` on the whole subtree, kills SSG, bloats the bundle, and makes future SEO maintenance harder.

**Do this instead:** Server-render by default. Drop `"use client"` only on the smallest interactive leaf (e.g., `CalCtaButton`, `RefreshStatsButton`). The Next.js client-component boundary is at the leaf, not the page.

### Anti-Pattern 2: Building API routes when an RSC fetch will do

**What people do:** Create `src/app/api/stats/github/route.ts` etc. to "isolate" the GitHub call, then call them from `StatsClient` with `useEffect`.

**Why it's wrong:**

- Adds round-trip latency (client → API route → GitHub → client).
- Requires CORS / loading state / error state in the client.
- Defeats Next's automatic fetch cache.
- Risk of leaking `GITHUB_PAT` if a future refactor moves the route to client.

**Do this instead:** Fetch directly from the RSC page or layout. Use `next: { revalidate: 3600 }`. Pass serialized data as props.

### Anti-Pattern 3: Storing `personal.birthday` in the type as required and shipping it to the client

**What people do:** Add `birthday: string` to `Personal`, expose it everywhere.

**Why it's wrong:** Birthday is PII. Even if it's "public-ish", there's no need to ship the literal date — only the computed age — to the client bundle.

**Do this instead:** Strip the field in `loadContentServer` before the data leaves the server. Document the convention in the file.

### Anti-Pattern 4: Writing a postbuild script to generate `public/freelance.md`

**What people do:** `package.json` `"postbuild": "node scripts/gen-freelance-md.js"`.

**Why it's wrong:**

- Drift risk — file is regenerated at build time, but the source-of-truth is `content.json`. If someone edits `content.json` and reloads the dev server, `freelance.md` is stale.
- Adds a Dockerfile build step.
- Generated file gets committed accidentally or causes git churn.

**Do this instead:** Dynamic route handler in `src/app/freelance.md/route.ts`. Uses the same `loadContentServer` chokepoint, no codegen.

### Anti-Pattern 5: Adding a filesystem cache layer for stats

**What people do:** "Next's fetch cache might evict; let me persist to `public/cache/github.json`."

**Why it's wrong:**

- `public/` mutations break `output: "standalone"` cleanliness — Coolify volume needed if you want persistence; otherwise lost on redeploy.
- Cache invalidation becomes a second problem.
- Already have this pattern for `public/uploads/` and it's listed as concern #16 (move to R2 someday).

**Do this instead:** Trust Next's fetch cache for the v2.0 traffic profile. If/when cache eviction becomes a measurable problem, then add Redis or persistent caching — out of scope here.

### Anti-Pattern 6: Putting `/freelance` and `/stats` into the existing home-page section list

**What people do:** Treat them as `NavigationItem` IDs with `id: "stats"`, expecting them to participate in keyboard navigation and section observers.

**Why it's wrong:** They're separate routes, not anchors. The section-observer/keyboard-nav system is hardcoded for `<section id="...">` elements within `/`. Listing them as nav items would create dead nav buttons.

**Do this instead:** Add them as **route links** in the navigation chrome (or simply via the global header / footer), distinct from in-page anchors. If you want them in the left-edge `Navigation`, add a second array (`externalRoutes`) and render them with `<Link href="/stats">` instead of `scrollToSection("stats")`.

---

## Integration Points Summary

### External Services (new)

| Service | Integration Pattern | Notes |
|---------|---------------------|-------|
| GitHub GraphQL API | Server-side `fetch` from `src/lib/github.ts`. PAT in `GITHUB_PAT` env. Cache via Next `revalidate: 3600`. | Only GraphQL exposes contribution grid; REST cannot. |
| GitHub REST API | Server-side `fetch` from `src/lib/github.ts` per repo. Same PAT. Same cache. | Used for pinned-repo stars/forks. |
| tokscale.ai | Server-side fetch with HTML scrape fallback in `src/lib/tokscale.ts`. Last-known-good fallback baked into module. | No public API confirmed (validate in Phase 7 research). |
| Cal.com | Plain outbound `<a>` link with `onClick` GA event. No API integration. | Booking happens on Cal.com side. |
| Google Analytics | `sendGAEvent` from `@next/third-parties/google`. Provider mounted in `layout.tsx` (existing). | Use for `freelance_cal_click`, optionally `stats_view`. |

### Internal Boundaries (extended)

| Boundary | Communication | Notes |
|----------|---------------|-------|
| `src/app/*/page.tsx` → `src/lib/github.ts` | Direct function import. Server-only. | Wrapped in try/catch at page level — never let an integration error 500 the page. |
| `src/app/*/page.tsx` → `src/utils/serverContentLoader.ts` | Direct function import. Existing pattern. | Now also computes age. |
| `src/components/freelance/CalCtaButton.tsx` → GA | `sendGAEvent` (client-only) | Requires `"use client"`. |
| `src/app/freelance.md/route.ts` → `src/utils/serverContentLoader.ts` | Same. | Route returns `text/markdown`. |
| `src/app/HomeClient.tsx` → `AvailabilityCallout` / `StatsTeaser` | Props passed from `src/app/page.tsx`. | New props on `HomeClientProps`. |

### Server-only Guard

Recommend adding `import "server-only"` at the top of:

- `src/lib/github.ts`
- `src/lib/tokscale.ts`
- `src/lib/rss-subscribers.ts`

The `server-only` package is already implicitly available via Next 16. It causes a build error if a `"use client"` module ever tries to import the file — cheap insurance against `GITHUB_PAT` leakage.

If `server-only` isn't installed, run `pnpm add server-only` (zero-cost, marker package). Alternative: rely on lint (`no-restricted-imports` rule). The marker import is more robust.

---

## Confidence Assessment

| Area | Confidence | Reason |
|------|-----------|--------|
| Phase 6 architecture | HIGH | Pure helper + loader modification — single chokepoint, well-typed. |
| Phase 7 architecture (file layout) | HIGH | Matches existing patterns (server page ↔ client island, `src/lib/` server-only). |
| Phase 7 caching strategy | HIGH | Next fetch cache is the documented Next 16 idiom for ISR; single-VPS deployment makes external caches unnecessary. |
| Phase 7 Tokscale integration | MEDIUM | Service-specific feasibility (API vs scrape) should be validated by the integrations-research output. Architecture supports either path with the same `src/lib/tokscale.ts` shape. |
| Phase 8 `freelance.md` route approach | HIGH | Pattern verified — `src/app/blog/feed.xml/route.ts` already does the equivalent with RSS. |
| Phase 8 Cal.com + GA integration | HIGH | `sendGAEvent` is documented in `@next/third-parties` 16.1.6, already a dep. |
| Robots.txt AI-bot rules | HIGH | `MetadataRoute.Robots` supports per-userAgent rules; verified in Next 16 types. |
| Cross-phase ordering | HIGH | Dependencies are content-schema based, not runtime; sequencing is purely a code-review-friction concern. |

---

## Sources

- `.planning/codebase/ARCHITECTURE.md` (existing project map)
- `.planning/codebase/STRUCTURE.md` (folder conventions + "Where to Add New Code")
- `.planning/codebase/CONVENTIONS.md` (naming, typing, server-only invariants)
- `src/utils/serverContentLoader.ts` (existing pattern)
- `src/app/page.tsx`, `src/app/HomeClient.tsx` (RSC ↔ Client island pattern)
- `src/app/blog/feed.xml/route.ts` (pattern reference for `freelance.md` route)
- `src/app/api/blog/posts/route.ts` (pattern reference for protected route handlers)
- `src/app/robots.ts`, `src/app/sitemap.ts` (extension points)
- `next.config.ts` (image whitelist, security headers — unchanged by this milestone)
- Next.js 16 docs: fetch cache + `revalidate`, `MetadataRoute.Robots`, route handlers (verified via Context7-equivalent lookups in prior agent work; current docs at `nextjs.org/docs`).
- `@next/third-parties` 16.1.6: `sendGAEvent` helper (confirmed in `package.json` dep).
- GitHub GraphQL API: `contributionsCollection.contributionCalendar` (canonical source for the green-grid heatmap data — REST has no equivalent endpoint).

---
*Architecture research for: v2.0 (Polish, Integrations & Freelance) — feature placement only.*
*Researched: 2026-05-12*
