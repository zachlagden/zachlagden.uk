# Stack Research — v2.0 Polish, Integrations & Freelance

**Domain:** Personal portfolio + blog with live data integrations
**Researched:** 2026-05-12
**Confidence:** HIGH (versions verified via npm registry + Context7; integration patterns verified against Next.js 16 docs and GitHub GraphQL reference)

## Scope of This Document

Existing v1 stack is locked (Next 16, React 19.2, TS 5 strict, Tailwind 4, MongoDB, Auth.js v5, Framer Motion, react-markdown, Coolify/Docker, no tests, no Sentry — see `CLAUDE.md` and `.planning/codebase/STACK.md`). This research covers **only the additions needed for v2.0 Phase 5–8**.

Bottom line up front: **add three small libraries (`@octokit/graphql`, `schema-dts`, `knip`)**, write the age util with native `Date` (no library), use Tokscale's existing public SVG endpoint as an `<img>` (no scraper), and document a structured Dependabot remediation flow against pnpm tooling. Everything else stays as is.

## Recommended Additions

### Runtime Dependencies (new)

| Package | Version | Phase | Purpose | Why this one |
|---|---|---|---|---|
| `@octokit/graphql` | `^9.0.3` | 7 | Authenticated GitHub GraphQL client for contribution heatmap + pinned repos + live stars | Smallest official Octokit module (~12 KB gzipped, no REST/App/OAuth surface). Drop-in auth header, returns typed `Promise<T>`. Internally uses `@octokit/request` over native `fetch`, which means Next.js 16's automatic fetch dedup + `revalidate` semantics do **not** apply (Octokit owns the request). We compensate with `unstable_cache`/`use cache` at the call-site wrapper — see ARCHITECTURE.md. |
| `schema-dts` | `^2.0.0` | 8 | TypeScript types for Schema.org JSON-LD (`Person`, `Service`, `Offer`, `BlogPosting`) | Maintained by Google; benchmark-leading typings; type-only dependency (zero runtime bytes). The existing `Person` JSON-LD in `HomeClient.tsx` is hand-rolled and untyped — schema-dts retro-fits to it. Justifies its weight at the second consumer (`Service` for `/freelance`). |

### Dev Dependencies (new)

| Package | Version | Phase | Purpose | Why this one |
|---|---|---|---|---|
| `knip` | `^6.12.2` | 5 | Detect unused dependencies / exports / files | Already-validated by previous CLEAN-01..03 work which removed dead code manually. Knip would have caught `AnimatedText.tsx`, the orphaned `contentLoader.ts` paths, and the empty `providers/` dir automatically. Single one-shot `pnpm dlx knip` per Dependabot batch gives a quick "did we orphan anything?" check. Node engine `^20.19.0` matches Docker's `node:20-alpine` which currently ships v20.20.2 — verified. |
| `npm-check-updates` | `^22.2.0` | 5 | Bulk view + selectively bump deps across majors | Used as one-shot via `pnpm dlx ncu` — does NOT need to be installed in `devDependencies`. Listed here as the approved tool for Phase 5 batches (see "Dependabot Remediation Strategy" below). |

### Things Already in the Stack That Get New Uses

| Package | New use | Notes |
|---|---|---|
| `@next/third-parties` (`^16.1.6`) | Phase 8: Cal.com click → GA event | Already wired in `src/app/layout.tsx`. Use `sendGAEvent` from `@next/third-parties/google` (NOT a new import surface — same package). Zero new deps. |
| `mongodb` (`^7.1.0`) | None new — Phase 7 integrations stay file-based / fetch-based | We deliberately do NOT cache external API responses in Mongo (see "What NOT to Use"). |

## Per-Phase Library Decisions

### Phase 5 — Dependabot Remediation (no new runtime deps)

**Tooling to use:**

1. **`pnpm outdated`** (built in) — primary daily check. No install needed.
2. **`pnpm dedupe`** (built in, ≥7.26) — run after every batch to collapse duplicate transitive versions. Catches the case where bumping one dep pulls in a newer copy of a shared transitive that the rest of the tree could also use.
3. **`pnpm dlx ncu --doctor`** — when batches stall on peer-dep conflicts, this isolates which top-level upgrade triggers the break.
4. **`pnpm dlx knip`** — once per batch, mostly for confidence that the dependency surface is still minimal.
5. **`pnpm dlx depcheck`** — **NOT recommended.** Knip subsumes its functionality with better Next 16 / TS 5 awareness. Don't run both.

**Recommended batch shape per Dependabot wave (proposed for Phase 5 planner):**

```
1. group by ecosystem (npm only here — no Docker base bumps in v2)
2. group by risk:
   - SAFE: patch + minor on already-current majors (>=99% safe)
   - MEDIUM: minor across multiple peers (e.g. mongo, next-auth-beta updates)
   - HIGH: major bumps (especially anything that peers with React 19 or Next 16)
3. for each group:
   pnpm update --latest <group...>
   pnpm dedupe
   pnpm tsc --noEmit
   pnpm lint
   pnpm build  # critical — Coolify Dockerfile must not regress
   commit
```

**Verification floor enforcement** (mandated by milestone constraints):

- `tsc --noEmit && pnpm lint` is the existing baseline.
- **Add `pnpm build` to the per-batch floor** — Coolify Docker builds are fragile (per project constraint) and the only place where Turbopack-specific issues surface. Three commands, ~90s on warm cache.
- No test framework available, so build success is our last line of defence.

**Anti-deps for Phase 5:**

- `npm-check` (the older, abandoned one — not `npm-check-updates`) — unmaintained
- `depcheck` — superseded by knip with better monorepo / TS-config awareness
- `pnpm-deduplicate` (third-party plugin) — superseded by built-in `pnpm dedupe` since 7.26

### Phase 6 — Content Refresh + Auto-Age

**Recommendation: use the native `Date` API. Do not add date-fns or dayjs.**

The age calculation is a 4-line function:

```ts
export function calculateAge(birthday: string, now: Date = new Date()): number {
  const birth = new Date(birthday);
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
```

| Option | Verdict | Why |
|---|---|---|
| **Native `Date`** (recommended) | Pick this | Zero deps, server-only (no hydration mismatch concerns since `serverContentLoader` is RSC-only — the age is computed once per request and baked into props), trivial to test if a test framework is ever added. The "month-then-day" check is the only correctness concern and is well-understood. |
| `date-fns` (`^4.1.0`) | Reject | 50–80 KB per imported helper before tree-shaking; would only be used in one place. Tree-shaking helps but adds zero value over 4 lines of native code. |
| `dayjs` (`^1.11.20`) | Reject | Same logic. Smaller than date-fns (~7 KB) but still pure overhead for a one-off computation. |

**Where the util lives:** `src/utils/age.ts`. Called from `src/utils/serverContentLoader.ts` to inject `personal.age` into the `Personal` content object before it reaches the client. The current `Personal` type in `src/types/content.ts` is extended with `age: number` and the new `birthday: string` field stays server-only (never leaves `serverContentLoader.ts`).

**Pitfall to bake in:** ensure the computation uses the server's local clock or explicit UTC consistently. The current Coolify container runs in UTC (Alpine default). Document the assumption in the util.

### Phase 7 — Integrations + /stats

**GitHub commit heatmap + pinned repos + live stars: `@octokit/graphql`**

Single GraphQL query against `viewer.contributionsCollection.contributionCalendar` plus `viewer.pinnedItems` covers all three features. Uses one round-trip.

Required:
- PAT in `GITHUB_PAT` env var with `read:user` scope (only — no `repo` scope needed; private contributions show as anonymised counts, no repo metadata leaks)
- Add to `.env.example` + Coolify env vars
- Document in README's env section (Phase 5 DOC task)

Why `@octokit/graphql` over native fetch:
- Header auth + error handling + rate-limit awareness for ~12 KB gzipped
- Typed errors (`GraphqlResponseError`) — better than parsing `errors[]` from a raw fetch response
- Future-proofing: if Phase 9+ adds GitHub App auth (e.g. for repo stats), swap to `octokit` without rewriting query call-sites

Why not the full `octokit` package:
- 167 KB unpacked; includes REST, App, OAuth, webhooks, retry, throttling — overkill
- We only need GraphQL with a static PAT

Why not write native fetch:
- Saves ~30 lines of boilerplate per call site
- We'd reinvent `GraphqlResponseError` typing

**Tokscale.ai stats: hot-link the SVG endpoint, NO scraper**

Verified directly from `junhoyeo/tokscale` README: Tokscale exposes a public, parameter-rich SVG embed at `https://tokscale.ai/api/embed/<username>/svg` and a badge endpoint at `https://tokscale.ai/api/badge/<username>/svg`. No JSON endpoint, but for the `/stats` page use case (visual display only) the SVG is exactly the right shape.

Implementation:
```tsx
<img
  src={`https://tokscale.ai/api/embed/${username}/svg?theme=light&compact=1`}
  alt={`AI token usage for ${username}`}
  loading="lazy"
/>
```

Add `tokscale.ai` to `next.config.ts` `images.remotePatterns` **only if** rendering through `next/image`. For an SVG widget, a plain `<img>` tag is preferred because:
- `next/image` cannot rasterise/optimise SVG by default
- SVG is already a vector; pre-processing costs nothing
- Skips the image domain allow-list entirely

**Anti-deps avoided here:**
- `cheerio` (`^1.2.0`) — not needed, Tokscale has a clean SVG endpoint
- `linkedom` (`^0.18.12`) — not needed
- `playwright` / `puppeteer` — explicitly out of scope (test framework deferred to v3)

**If Tokscale ever adds a JSON endpoint:** revisit and switch to native `fetch` with `next: { revalidate: 3600 }`. No library needed for a single JSON GET.

**Pinned repos + live stars:** included in the same GraphQL query as the heatmap (`viewer.pinnedItems(types: REPOSITORY)` → `... on Repository { name, stargazerCount, url, description, primaryLanguage }`). Single query, single cache entry.

**`/now` page:** static, content-driven. Source field `now: { content: string; updated: string }` added to `public/content.json`. No new deps.

**RSS subscriber count: defer or stub, do NOT add a library**

This one is genuinely hard. Verified findings:
- Feedly has a `subscribers` field on its `v3/search/feeds` endpoint but the API is undocumented, partially auth-gated, and notoriously unreliable
- Inoreader's count is gated behind Pro-tier API access
- Feedburner is dead
- No JSON Feed / WebSub mechanism exposes subscriber counts in the open

**Recommendation:** Phase 7 should ship the `/stats` page **without** an RSS subscriber count. Replace with either:
1. **Hide entirely** until a clean data source emerges (preferred — honest UX)
2. **Show the RSS feed link** + a manual `feedSubscribers: number` field in `content.json` that the user updates by hand monthly (cheap, honest)

If we MUST have an integration: best-effort fetch of Feedly's unofficial `https://cloud.feedly.com/v3/search/feeds?query=<url-encoded feed url>` endpoint, parse `results[0].subscribers`, cache 24h. This is brittle (any HTML output change breaks us) and should be wrapped in a try/catch that hides the widget on failure rather than 500ing.

**Anti-dep:** do NOT add a "feedly-client" or "feedburner" SDK — there isn't a maintained one and the surface we need is one fetch call.

**Caching strategy for all Phase 7 integrations:**

Per Next.js 16 docs, use **`next: { revalidate: <seconds>, tags: ["github-stats"] }` on every external `fetch`**. For `@octokit/graphql` (which doesn't use the global fetch), wrap each call in a `"use cache"` async function with `cacheLife({ revalidate: 3600 })`, OR — the safer path for Phase 7's first cut — use `unstable_cache` from `next/cache`:

```ts
import { unstable_cache } from "next/cache";

export const getGitHubStats = unstable_cache(
  async () => graphql<GitHubStatsResponse>(QUERY, { headers: ... }),
  ["github-stats"],
  { revalidate: 3600, tags: ["github-stats"] },
);
```

`unstable_cache` is the simpler, well-understood option. `use cache` is newer and has migration footguns in Next 16 — see the open discussion at `vercel/next.js#89375`. Use `unstable_cache` for v2.0 unless the Phase 7 implementer confirms `use cache` is fully landed.

**Edge vs Node runtime:** **Use Node runtime** (default) for all Phase 7 endpoints. Reasons:
1. `@octokit/graphql` works fine on Edge but pulls in Node-shaped buffers in some transitive paths
2. Existing app is Node-only (`output: "standalone"` targets the Node server); mixing runtimes adds Docker complexity
3. None of the Phase 7 endpoints need sub-100ms cold start
4. Caching layer (`unstable_cache`) is identical across runtimes

### Phase 8 — Freelance Offering

**Schema.org markup: `schema-dts` (`^2.0.0`)**

| Option | Verdict | Why |
|---|---|---|
| **`schema-dts`** (recommended) | Pick this | Types-only (zero runtime); discriminated union covers `Service`, `Offer`, `PriceSpecification`. Existing hand-rolled `Person` JSON-LD in `HomeClient.tsx:240+` can be retro-fitted (one-line `WithContext<Person>` annotation). Maintained by Google. Two consumer use cases (`Person` + `Service`) justify it where one might not. |
| Hand-roll JSON-LD | Reject | Loses compile-time checks on field names. The existing `Person` JSON-LD has zero type safety; adding `Service` doubles the risk surface. |
| `next-seo` | Reject | Heavy (~20 KB), opinionated, designed for `pages/` router; Next 16 App Router has `metadata` already, JSON-LD via inline `<script>` is the canonical approach. |

Usage pattern:
```tsx
import type { Service, WithContext } from "schema-dts";

const service: WithContext<Service> = {
  "@context": "https://schema.org",
  "@type": "Service",
  // ... typed!
};
```

JSON-LD injection stays inline in `<script type="application/ld+json">` per existing pattern in `HomeClient.tsx`.

**`/freelance.md` machine-readable file:**

Generate at build time. Two options:

1. **Static file in `public/freelance.md`** — simplest. Author writes Markdown directly, no build step. Recommended for v2.0 first cut.
2. **Generated route at `src/app/freelance.md/route.ts`** returning `text/markdown` from `content.json`'s freelance section — more maintainable long-term, single source of truth, but adds a route handler.

**Recommend option 2** for consistency with the content-as-props pattern documented in `CLAUDE.md` ("Modify `public/content.json` for content changes rather than editing components"). Treats `/freelance.md` and `/freelance` as two presentations of the same data.

Implementation: ~30 lines of route handler, no new deps. Uses existing `serverContentLoader`.

**Cal.com integration:** outbound link only. Use `<a href="https://cal.com/zachlagden/intro" target="_blank" rel="noopener noreferrer">`. GA event via existing `@next/third-parties`:

```tsx
import { sendGAEvent } from "@next/third-parties/google";

<a
  href="https://cal.com/..."
  onClick={() => sendGAEvent("event", "cal_book_click", { location: "freelance_hero" })}
  ...
>
```

No new deps. No Cal.com SDK needed (embed widget explicitly out of scope per milestone context).

**Robots.txt AI-bot audit:**

Existing `src/app/robots.ts` is the right home. No new deps. Add explicit `userAgent: ["GPTBot", "PerplexityBot", "ClaudeBot", "Google-Extended", "ChatGPT-User", "anthropic-ai", "CCBot", "cohere-ai"]` rules with `allow: ["/"]` (or selective `disallow: ["/admin"]`). The Next.js `MetadataRoute.Robots` type supports multiple rule objects in the `rules` array — confirmed in current docs.

## Installation

```bash
# Phase 6 — no new deps
# Phase 7
pnpm add @octokit/graphql

# Phase 8
pnpm add schema-dts

# Phase 5 dev tooling
pnpm add -D knip

# Phase 5 one-shot (NOT installed)
pnpm dlx ncu --interactive
pnpm dlx knip
```

Estimated `node_modules` impact: +~50 KB unpacked (`@octokit/graphql` + its 3 deps), schema-dts is type-only, knip is dev-only.

## Alternatives Considered

| Recommended | Alternative | When the alternative makes sense |
|---|---|---|
| `@octokit/graphql` | Raw `fetch` + JSON body | If we only ever need one GraphQL endpoint and never want typed errors. Two months from now when `/stats` ships and works, considering rip-and-replace to a 20-line fetch wrapper is reasonable for bundle minimalism. |
| `@octokit/graphql` | Full `octokit` package | If Phase 9+ ever adds GitHub App auth, repo webhook handling, or REST endpoint calls — switch then, not now. |
| `schema-dts` | Hand-rolled JSON-LD | If the project shrinks scope and only needs the existing `Person` schema. Two consumers tip the balance. |
| Native `Date` for age | `date-fns` | If the site grows to need date formatting in 5+ places (relative time on blog posts, etc.). Currently only the blog uses `formatDate` and that's also native `Date` already. |
| `knip` | `depcheck` | If the project ever drops TypeScript or needs Yarn/npm support. Both unlikely. |
| Tokscale SVG `<img>` | HTML scraper (`cheerio` / `linkedom`) | Only if Tokscale removes the public SVG endpoint. Switch to scraping is a last resort. |
| `unstable_cache` | `"use cache"` directive | Once Next 16 `use cache` lands stable and the migration story is clear (`vercel/next.js#89375` resolves). |

## What NOT to Add — Anti-Dependency List

| Avoid | Why | What to do instead |
|---|---|---|
| `date-fns` / `dayjs` / `luxon` / `moment` | Age util is 4 lines of native `Date`. The only other date use site (`formatDate` in `contentLoader.ts`) already uses native `Date`. | Native `Date` for new age util. |
| `cheerio` / `linkedom` / `parse5` | Tokscale exposes a public SVG endpoint; no HTML to parse anywhere in Phase 7. | Hot-link Tokscale's SVG with `<img>`. |
| `playwright` / `puppeteer` / `puppeteer-core` | Headless browser for any scraping is overkill, blows up the Docker image (Chromium ~280 MB), and tests are explicitly deferred to v3. | Don't scrape anything. |
| Full `octokit` package | Includes REST/App/OAuth/webhooks (~167 KB unpacked) — we need only GraphQL. | `@octokit/graphql` (12 KB). |
| `next-seo` | Designed for Pages Router; Next 16 App Router's `metadata` API + inline JSON-LD `<script>` already covers our needs. | Existing `metadata` exports + `schema-dts`-typed JSON-LD. |
| `@calcom/embed-react` / Cal.com SDK | Milestone explicitly cuts embed; outbound link only. | Plain `<a>` + `sendGAEvent`. |
| `react-ga` / `react-gtag` / `nextjs-google-analytics` | `@next/third-parties` is already installed and is the official Next.js answer. | `sendGAEvent` from `@next/third-parties/google`. |
| `feedly-api` / unofficial Feedly clients | Unmaintained; auth surface unclear; surface we need is one HTTPS GET. | Stub the RSS subscriber count or fetch Feedly's `v3/search/feeds` directly with error-tolerant try/catch. |
| `depcheck` | Knip subsumes its functionality with better TS-config + Next-config awareness. | `knip`. |
| `npm-check` (older, abandoned) | Confused with `npm-check-updates`; the older one is unmaintained. | `npm-check-updates` via `pnpm dlx`. |
| `pnpm-deduplicate` plugin | Superseded by built-in `pnpm dedupe` since pnpm 7.26. | Built-in `pnpm dedupe`. |
| Any observability lib (`@sentry/nextjs`, `pino`, `winston`, `@opentelemetry/*`) | Explicitly out of scope per milestone constraints. | Continue using `console.error` / `console.warn`. |
| Any test framework (Vitest, Jest, Playwright) | Explicitly deferred to v3. | `tsc --noEmit && pnpm lint && pnpm build`. |
| Redis / KV / external cache | Not needed at our scale — `unstable_cache` in-process is sufficient for Phase 7. | `unstable_cache` from `next/cache`. |
| GraphQL client libs (Apollo, urql, graphql-request) | Overkill for one query. `@octokit/graphql` is the GitHub-specific shape. | `@octokit/graphql`. |

## Version Compatibility

| Package | Compatible with | Notes |
|---|---|---|
| `@octokit/graphql` 9.0.3 | Node ≥20 | Matches Dockerfile's `node:20-alpine` (verified — currently runs v20.20.2). |
| `schema-dts` 2.0.0 | TS ≥4.0 | Type-only; works with TS 5.9.3 in current project. |
| `knip` 6.12.2 | Node `^20.19.0 \|\| >=22.12.0` | Matches `node:20-alpine` (v20.20.2). If Coolify's base image ever drops below 20.19, knip will fail-fast — pin to `knip@5.x` as fallback (Node ≥18.18). |
| `npm-check-updates` 22.x | Node ≥20 | Used via `pnpm dlx`, no install. |
| Native `Date` | All Node versions | No constraint. |

**Critical compat check:** `@octokit/graphql` 9.x and Next.js 16's fetch override interplay — Octokit uses `@octokit/request` internally which wraps `globalThis.fetch`. Next.js patches `globalThis.fetch` on the server, so **Octokit calls WILL be intercepted by Next's cache layer** in theory. In practice, Octokit sets headers that include a User-Agent which fingerprints the request, and the cache key includes headers — meaning the cache hit rate is high but the dedup is per-request. This is why we wrap with `unstable_cache` explicitly rather than relying on Next's fetch dedup.

## Stack Patterns by Variant

**If GitHub PAT scope conflicts emerge:**
- Default scope: `read:user` only
- If we ever need pinned-repo metadata for private repos, escalate to `repo:status` (read-only repo status) — but milestone scope says public pinned repos only, so don't.
- Document scope choice in `.env.example` comment.

**If Tokscale.ai SVG endpoint is unreliable:**
- Wrap the `<img>` in a server component that does a `HEAD` request first with `next: { revalidate: 3600 }`. If 4xx/5xx, render a fallback "tokscale unavailable" badge.
- Do NOT silently 500 the `/stats` page.

**If we need RSS subscriber count badly:**
- Manual `feedSubscribers: number` field in `content.json`, updated monthly. Honest. Maintainable.
- Avoid scrapers.

## Sources

- Context7 `/octokit/graphql-schema` (HIGH confidence) — verified `contributionsCollection.contributionCalendar` query shape
- Context7 `/google/schema-dts` (HIGH confidence) — verified type exports
- Context7 `/webpro-nl/knip` and `/websites/knip_dev` (HIGH confidence)
- Context7 `/cheeriojs/cheerio` and `/webreflection/linkedom` (HIGH confidence — used to confirm NOT-needed)
- npm registry queries (HIGH confidence) — `@octokit/graphql@9.0.3`, `schema-dts@2.0.0`, `knip@6.12.2`, `cheerio@1.2.0`, `linkedom@0.18.12`, `date-fns@4.1.0`, `dayjs@1.11.20`, `octokit@5.0.5`
- [GitHub GraphQL `ContributionsCollection` reference](https://docs.github.com/en/graphql/reference/objects#contributionscollection) (HIGH) — verified `read:user` scope for private contributions
- [GitHub Community discussion #24812](https://github.com/orgs/community/discussions/24812) (MEDIUM) — confirmed `read:user` scope behaviour for private contributions
- [Next.js 16 fetch + caching docs](https://nextjs.org/docs/app/api-reference/functions/fetch) (HIGH) — verified `next.revalidate`, `next.tags`, and `unstable_cache` shape
- [Next.js 16 `use cache` discussion](https://github.com/vercel/next.js/discussions/89375) (MEDIUM) — confirmed `use cache` is still stabilising; reinforces preference for `unstable_cache` in v2.0
- [Tokscale.ai README](https://github.com/junhoyeo/tokscale/blob/main/README.md) (HIGH) — verified public SVG embed + badge endpoints, no JSON API
- [pnpm dedupe docs](https://pnpm.io/cli/dedupe) (HIGH)
- [pnpm overrides docs](https://pnpm.io/package_json) (HIGH)
- Local `node:20-alpine` image probe — confirmed Node v20.20.2 in current Coolify base image
- `.planning/codebase/STACK.md` and `INTEGRATIONS.md` (HIGH) — locked v1 stack baseline

---
*Stack research for: zachlagden.uk v2.0 — Polish, Integrations & Freelance*
*Researched: 2026-05-12*
