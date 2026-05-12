# Pitfalls Research — v2.0 Polish, Integrations & Freelance

**Domain:** Brownfield Next.js portfolio adding dep hardening, content auto-age, external API integrations, and a freelance offering
**Researched:** 2026-05-12
**Confidence:** HIGH for codebase-specific pitfalls (grounded in `.planning/codebase/CONCERNS.md`, current `next.config.ts`, and `package.json`); MEDIUM for external-API-shape pitfalls (Tokscale + GitHub responses verified by docs, but exact response shapes can drift)

This document is **scoped to v2.0 only** — it ignores generic web-dev advice and concentrates on failure modes that would actually fire in this codebase given v1's existing seams (`intro-locked`, `content.json` content-as-props, Coolify single-VPS deployment, no observability, no tests). Each pitfall is owned by exactly one phase, with explicit "verify before Phase X starts" gates where cross-phase coupling matters.

---

## Critical Pitfalls

### Pitfall 1: Mass dependency bump silently breaks Framer Motion in `Header` intro state machine

**What goes wrong:**
A Dependabot PR bumps `framer-motion` from `12.23.x` to e.g. `12.34.x` (current resolved) or a future `12.40.x`. `tsc --noEmit` passes. `pnpm lint` passes. Production build "succeeds" — but at runtime the cinematic intro animation either flickers, leaks `intro-locked` (the body stays `overflow: hidden`), or skips phases entirely. STAB-03 / STAB-04 fixes (font-ready timeout + rAF cancel guard from Phase 1) are subtly invalidated because Framer Motion changed how it cancels in-flight animations on unmount.

**Why it happens:**
- Framer Motion 12.x is technically in the "stable" channel but ships behaviour-changing patches inside minor versions (the `motion/react` reorganisation, easing function tweaks, `useReducedMotion` semantics).
- This codebase concentrates non-trivial animation logic in **one** file (`src/components/layout/Header.tsx`, ~300 lines, five-phase FSM) that recent commits churned heavily (35c2ba7, 38b2634, 6edb503).
- There is **no test framework**. The only verification floor is `tsc --noEmit` + `pnpm lint`. Neither catches motion-runtime regressions.
- "Reduced motion" branch hides regressions in CI/dev if the reviewer has it enabled.

**How to avoid:**
- Phase 5 must bump `framer-motion` **on its own commit** (not bundled with other deps) and require a manual smoke test of the home `/` route in three states: (a) cold load with `prefers-reduced-motion: no-preference`, (b) cold load with reduced motion, (c) navigation back from `/blog` to `/` (intro should skip, body must not be locked).
- Add a post-bump checklist to the Phase 5 plan: "Open `/` in incognito, watch the intro complete, confirm body class transitions from `intro-locked` to no class, scroll the page".
- Pin Framer Motion with `~12.23.x` (tilde, patch-only) until v2.0 ships, then re-evaluate the minor bump in a v2.1 follow-up.
- Pin `react`/`react-dom` to exact `19.2.4` (no caret) — Framer Motion 12 + React 19.2 is a known-good combo; React 19.3 may introduce subtle reconciler changes that affect the intro's effect ordering.

**Warning signs:**
- Body has `class="intro-locked"` on routes other than `/` after a bump.
- `document.fonts.ready` never resolves and the intro stays in `"loading"` phase (the STAB-03 timeout fallback would fire after 5s — if it doesn't, the timeout logic itself broke).
- Console error: "Cannot update a component while rendering a different component" (regression of BlogEditor render-loop class of bugs).
- Visual flicker on the dual-measurement read in `Header.tsx:177-186`.

**Phase to address:** **Phase 5** — explicit bump-then-smoke-test sub-step. Phase 5 owns this because if it slips through, Phase 7 (which adds animated `/stats` charts and new `motion.*` usages) will inherit an unstable foundation.

---

### Pitfall 2: `next-auth@5.0.0-beta.30` is pinned at an exact beta — Dependabot will propose beta-to-beta upgrades that change OAuth callback contract

**What goes wrong:**
`package.json` declares `"next-auth": "5.0.0-beta.30"` (no caret, exact pin). Dependabot keeps proposing `5.0.0-beta.31`, `…-beta.35`, eventually `5.0.0` release. Auth.js v5 is **explicitly documented as making breaking changes between betas**. A bump can:
- Change the JWT callback signature → `token.isAdmin` is no longer populated → `requireAdmin()` returns 401 for the legitimate admin.
- Move the GitHub provider import path → build fails after deploy (works locally because tsc fell back to a relative resolution).
- Change session strategy defaults → cookies stored in MongoDB silently expire.

This breaks the admin UI (`/admin/blog`) — the only authenticated surface — and the failure is invisible until someone actually tries to log in. With no observability (Sentry removed), a 4xx from `/api/auth/[...nextauth]` will only show up in Coolify container logs.

**Why it happens:**
- The library is a beta and the team prioritises shape changes over backwards-compatibility.
- The codebase has zero tests covering the auth flow.
- The admin user (Zach) is the only person who would notice the regression, and may not log in for weeks.

**How to avoid:**
- Phase 5 must treat `next-auth` as a **manual-bump-only** dep: configure `.github/dependabot.yml` to `ignore: { dependency-name: "next-auth" }` for any 5.0.0-beta range.
- When bumping is genuinely needed (e.g. an actual CVE fixed), bump in isolation, then run the manual flow: sign out → sign in via GitHub → load `/admin/blog` → verify `session.user.isAdmin === true` in the browser console via `useSession()`.
- Add a Phase 5 deliverable: a 6-line **AUTH-SMOKE-TEST.md** in `.planning/runbooks/` documenting that flow so future contributors (or future-Zach) don't have to rediscover it.
- Consider whether v2.0 should pin to the **stable `5.0.0` release** if it lands before Phase 8 ships. The exposure is low (single admin user, no public auth surface) but the beta-on-prod story is uncomfortable.

**Warning signs:**
- `/api/auth/callback/github` returns 302 to `/auth/signin?error=...` in Coolify logs.
- `session.user.isAdmin` is `undefined` in the JWT callback.
- `@auth/mongodb-adapter` throws a "no such collection" or "schema mismatch" on first sign-in after bump (the adapter version must move in lockstep).
- New TypeScript errors in `src/types/next-auth.d.ts` module augmentation.

**Phase to address:** **Phase 5** — must be resolved before Phase 8 ships (Phase 8 adds the `/freelance` page which references the admin/edit flow only indirectly, but a broken auth deploy on v2.0 launch day is unrecoverable without local-dev access).

---

### Pitfall 3: Server-side age computation leaks birthday to the client via JSON-LD or content props

**What goes wrong:**
Phase 6 adds `personal.birthday: "2007-MM-DD"` to `content.json` to enable auto-age. The naive implementation:
1. Stores birthday in `content.json` (committed to git, public repo).
2. Loads `content.json` via `serverContentLoader` on the server.
3. Passes the **whole `personal` object** as props to `HomeClient`.
4. The JSON-LD `Person` schema (`HomeClient.tsx`) serialises whatever's in the prop into a `<script type="application/ld+json">` tag.

Result: the user's full DOB is in the public HTML source on every page. Even worse, the existing `Person` JSON-LD already includes `birthPlace` — adding `birthDate` looks "normal" and reviewers won't flag it. But Schema.org `birthDate` is a *publicly indexed* property. Google scrapes it. Identity-theft data brokers scrape it. There is no way to "take back" a leaked DOB.

A second variant: birthday is leaked through the `/api/health` or other diagnostic endpoint that mirrors `content.json` for debugging.

**Why it happens:**
- The codebase's content-as-props convention encourages passing whole objects down without trimming.
- `Person` JSON-LD already has `birthPlace`; the natural-feeling extension is `birthDate`.
- There is **no Zod/typebox validation gate** between `content.json` and the rendered output.

**How to avoid:**
- Phase 6 must implement age computation in a **server-only utility** (`src/utils/computeAge.ts`) that takes `Date | string` and returns `number`, and is called only in `src/utils/serverContentLoader.ts` (or a sibling).
- That utility **strips `birthday` from the returned content object** and substitutes a computed `age: number`. Clients never see `birthday`.
- The TypeScript type for `Personal` in `src/types/content.ts` must be split: `PersonalRaw` (server-side, includes `birthday`) and `Personal` (client-side, includes `age`, **omits `birthday`**). The `Omit<PersonalRaw, "birthday"> & { age: number }` pattern.
- Phase 6 must add a build-time assertion: after `loadContentServer()`, assert `!("birthday" in result.personal)` and throw if present. This is the cheapest unit-of-protection given there is no test framework.
- Phase 6 must explicitly **not** add `birthDate` to the JSON-LD `Person` schema.
- Audit `/api/health` and any other endpoint that returns config/content to make sure they don't leak the raw content tree.

**Warning signs:**
- `grep -r "birthday" .next/` after a build returns anything in `.next/server` page chunks (acceptable — server-only) but **anywhere in `.next/static/` or in rendered HTML is a leak**.
- Page source for `/` contains a date matching the user's DOB.
- `next/og` image generation pulls in the full `personal` object and the DOB appears in OG metadata.

**Phase to address:** **Phase 6** — owns the type split and the server-only utility. Phase 8 (freelance schema) must verify the Person schema still doesn't include `birthDate` after its Service schema work.

---

### Pitfall 4: Birthday timezone bug — age increments at midnight UTC, not local

**What goes wrong:**
The server computes age. The server runs on a single Coolify VPS (likely UTC, or whatever the Linux host is set to). On the user's actual birthday at 00:00 local time, the page still shows the previous age because UTC is behind. Worse: if the birthday is e.g. January 1 and the server is UTC+0 while a Berkshire visitor browses on December 31 at 23:30 GMT, they see "I'm 18" but a New Zealand visitor at the same wall-clock instant (already January 1 NZDT) also sees "I'm 18". The user's local frame is the canonical one for "what age is Zach **right now**", not the visitor's.

There's a more subtle bug: if birthday is `"2007-12-31"` and the server formats with `new Date("2007-12-31").getFullYear()`, certain timezone offsets cause it to parse as Dec 30 (UTC) → age computation is off by one for half the year.

**Why it happens:**
- JS `Date` parsing of `"YYYY-MM-DD"` is treated as UTC midnight, not local midnight, by spec.
- The "correct" timezone for "my age" is the **subject's** TZ (Zach in Berkshire = Europe/London), not the visitor's, not UTC.
- Daylight saving adds a half-hour fudge once a year if `Date` arithmetic is used.

**How to avoid:**
- Phase 6's `computeAge(birthdayISO: string, today = new Date()): number` must:
  1. Parse the birthday as a `{year, month, day}` triple — never via `new Date(string)`.
  2. Get the current date in `Europe/London` via `Intl.DateTimeFormat("en-GB", { timeZone: "Europe/London", year: "numeric", month: "numeric", day: "numeric" }).formatToParts(today)`.
  3. Compute the difference in years, decrementing if today's month/day is before the birthday's month/day in London time.
- Add a 4-line inline assertion in the utility: hardcoded test cases `computeAge("2007-12-31", new Date("2026-01-01T00:00:00Z")) === 18` and `computeAge("2007-12-31", new Date("2025-12-31T23:30:00Z")) === 17`. Run them as a module-level `if (process.env.NODE_ENV !== "production") { ... }` block (since we have no test framework).
- Document the design decision (London-based, not visitor-based) in a comment.

**Warning signs:**
- A user reports "I checked your site on my birthday morning and it said the wrong age".
- The age changes when the page is loaded from a different timezone.

**Phase to address:** **Phase 6** — owns the utility + assertions.

---

### Pitfall 5: Age stale in static-rendered HTML — `/` is fully cached, doesn't update on the user's birthday

**What goes wrong:**
Next.js 16 with `output: "standalone"` plus server components defaults to **static rendering** when no dynamic API is used. `src/app/page.tsx` calls `loadContentServer()` (a `fs.readFile`) and `getLatestPosts()` — both can be statically generated at build time. After Phase 6 lands, the build at e.g. `2026-05-12` bakes `age: 18` into the HTML. On 2026-12-31 at midnight (Zach's birthday in this hypothetical), nothing happens. The age stays 18 until the next deploy.

This is **arguably the worst possible outcome for an auto-age feature** — it looks broken to anyone who knows the user, and the user has no idea because they're not deploying every day.

**Why it happens:**
- Next.js 16 prefers static generation when possible (CONCERNS.md #2 era was Next 16, and the build was happily statically generating).
- The codebase has no `export const dynamic` or `export const revalidate` declarations on `/`.
- No one is going to remember to redeploy on a specific date.

**How to avoid:**
- Phase 6 must add `export const revalidate = 86400` (24 hours) to `src/app/page.tsx` — and any other route that depends on computed age (likely also `/about` if one exists, and `/freelance` in Phase 8 if it references age).
- **Verification step:** after the change, `pnpm build` output should show `/` rendered as **ISR** (`Revalidate: 1d` in the build summary), not **Static**. This is the Phase 6 acceptance gate.
- Alternative considered and rejected: `dynamic = "force-dynamic"` — too heavy (every request runs RSC). ISR with daily revalidate is the right tradeoff.
- Document: "Age may be up to 24h stale on the user's birthday. Acceptable. Trying to fix the last 24h would require either request-time rendering (slow) or scheduled rebuilds (operationally complex)."

**Warning signs:**
- `pnpm build` summary shows `/` as `○ (Static)` after Phase 6 lands. Should be `◐ (ISR)` or similar.
- Manually visiting `/` 48 hours after deploy still shows a build-time age.

**Phase to address:** **Phase 6** — owns the revalidate decision and verifies it in the build output.

---

### Pitfall 6: Existing `personal.age` references not all swapped — TypeScript schema drift between `content.json` and `types/content.ts`

**What goes wrong:**
The current `content.json` has `mainDescription: "I'm an 18-year-old entrepreneur..."` (line 51) — age is **embedded in a string literal**, not a structured `personal.age` field (confirmed by `grep -n "age"`). When Phase 6 introduces `personal.birthday` + computed `age`, a developer assumes `personal.age` already exists (because the project's design vocabulary mentions it), updates `types/content.ts` to require `age: number`, and then:
- `loadContentServer()` returns data without `age` (because it's not yet computed).
- TypeScript still passes because the type is the wrong shape (annotated as `unknown` initially, or cast).
- Runtime renders `"I'm an undefined-year-old entrepreneur..."` somewhere.

A second variant: the swap is done in `mainDescription` but **not in `metadata.description`** (line 4) which independently embeds "18-year-old". Both must be templated.

**Why it happens:**
- Age is currently a free-form string baked into multiple `content.json` fields, not a typed scalar.
- `types/content.ts` does not currently have an `age` field at all.
- Schema drift between `content.json` and the TS interface is invisible until rendered (no Zod validation in the pipeline).

**How to avoid:**
- Phase 6 must do a **grep-then-fix** pass: `grep -n "18\|18-year-old\|year-old\|years old" public/content.json` to enumerate every string that embeds age, then convert each to a template literal in the component (not in the JSON).
- The pattern: `content.json` declares `personal.birthday`; the `loadContentServer` utility computes `age` and exposes it; components string-interpolate `${age}` at render time, never trusting the source JSON for the age value.
- Add a TypeScript discriminant: `Personal` interface adds `age: number` (required, derived) and explicitly omits `birthday`. The compiler then refuses any component that tries to read `personal.birthday`.
- Phase 6 acceptance: every occurrence of `"18-year-old"` and similar in `content.json` is replaced with a templating placeholder OR the literal is removed and templated in the component.

**Warning signs:**
- `grep -rn "year-old\|years old" public/ src/` returns hardcoded strings after Phase 6 supposedly lands.
- `metadata.description` (used in OG tags) still says "18-year-old" two years from now.

**Phase to address:** **Phase 6** — owns the audit.

---

### Pitfall 7: GitHub PAT over-scoped or under-scoped — `read:user` is sufficient for contributions, but `repo` is **not** required and is a foot-gun

**What goes wrong:**
Phase 7's GitHub commit heatmap pulls private contributions via the GraphQL `contributionsCollection.contributionCalendar`. The developer (mis)reads StackOverflow and grants the PAT `repo` scope (full private repo read/write) when only `read:user` is needed for the contribution graph. Coolify env var `GITHUB_PAT` now has god-mode access to every private repo Zach owns. If `GITHUB_PAT` is logged, leaked via a Sentry breadcrumb (when Sentry comes back), or pasted into a future Claude session, the blast radius is the entire GitHub account, not just contribution counts.

The opposite failure: developer reads the wrong doc and grants only `public_repo` — public contribution graph works but private-repo contributions silently return zero. The heatmap looks "less impressive" than reality and the user doesn't notice for weeks.

**Why it happens:**
- GitHub's PAT scope UI groups things confusingly — `repo` is the most-frequently-clicked checkbox.
- The `read:user` scope is buried under "User permissions" and many tutorials don't mention it.
- Verified fact: contributions to **private** repos are only returned when the token has `read:user` scope (per GitHub Discussions #24812 and GitHub Docs on `contributionsCollection`).
- No scope is required for *public* contributions, but the user expects private contribs to show.

**How to avoid:**
- Phase 7 plan must specify the **exact** scope: classic PAT with `read:user` only (not `repo`, not `read:org`, not `user`).
- Phase 7 must commit a `.planning/runbooks/GITHUB-PAT.md` documenting:
  - Exact scopes (`read:user`).
  - PAT name (e.g. `zachlagden-uk-stats-page`) for identification on GitHub's settings page.
  - Rotation cadence (every 90 days; GitHub fine-grained PATs max at 1 year).
  - Step-by-step rotation: create new PAT → update Coolify env → redeploy → verify `/stats` still renders → delete old PAT on GitHub.
- The env var must be `GITHUB_PAT` (server-only, no `NEXT_PUBLIC_` prefix). Verify by `grep -rn "GITHUB_PAT" src/` — should only appear in `src/lib/` or `src/app/api/`, never in a `"use client"` component.
- Use **fine-grained PAT** (modern alternative) if practical: scope it to "no repository access", grant only `Profile: Read-only`. This is the safest possible token.

**Warning signs:**
- PAT shows `repo` scope on GitHub's "Personal access tokens" page — over-scoped.
- Heatmap shows only public contribs (significantly lower than reality) — under-scoped or wrong scope name.
- `GITHUB_PAT` appears in `console.log` output or browser network requests.

**Phase to address:** **Phase 7** — owns the PAT creation, scope, env wiring, and runbook.

---

### Pitfall 8: `/stats` page uses `Promise.all` → one failed integration kills the whole page

**What goes wrong:**
The `/stats` page fans out to 4 external sources (GitHub GraphQL, Tokscale SVG embed, RSS feed analytics, pinned repos REST API). The naive implementation:

```ts
const [github, tokscale, rss, pinned] = await Promise.all([
  fetchGitHub(), fetchTokscale(), fetchRss(), fetchPinned(),
]);
```

Tokscale rate-limits us at 11pm. The whole `Promise.all` rejects. `/stats` returns a 500. Worse — because there is **no `error.tsx` for the `/stats` route segment**, the error bubbles to the root `error.tsx` (added in Phase 1, STAB-01) which shows a generic error page. The other 3 integrations were fine. The user thinks `/stats` is broken.

This is **the same anti-pattern** as Phase 0's MongoDB-down bug (CONCERNS.md #2) — one slow/failing data source taking down the whole page. The fix is the same shape: per-source try/catch, partial-success rendering.

**Why it happens:**
- `Promise.all` is the autocomplete-default in TypeScript.
- The codebase's existing data-loading shape (`getLatestPosts`, `getAllPublishedSlugs`) uses try/catch per call — Phase 7 might forget to follow that convention because it's a "new feature" mental frame.
- No tests, no fault-injection harness.

**How to avoid:**
- Phase 7 plan **must specify `Promise.allSettled`** for the parallel fetch and a per-source fallback UI component.
- Each integration component (`<GitHubHeatmap />`, `<TokscaleStats />`, `<RssCount />`, `<PinnedRepos />`) must accept `data: T | null` and render a skeleton/placeholder when `null`. Never render a thrown error.
- Add a `/stats/error.tsx` segment-level error boundary as a defence-in-depth (catches whatever slips through).
- Acceptance test (manual, since no test framework): temporarily set Tokscale URL to `https://example.invalid`, redeploy, verify the rest of `/stats` still renders.

**Warning signs:**
- One integration outage = `/stats` returns 500 in Coolify logs.
- Visible "Something went wrong" message on `/stats` for hours during an external outage.

**Phase to address:** **Phase 7** — owns the `Promise.allSettled` pattern and the segment error boundary.

---

### Pitfall 9: GitHub API rate limits hit silently — anon = 60/hr, authenticated = 5000/hr, but `/stats` is RSC and may re-fetch on every request

**What goes wrong:**
Phase 7's `/stats` page does a server-side `fetch(githubGraphQL)` on every request because **Next.js 16 no longer caches `fetch` by default in dynamic contexts** (verified — see sources). At even modest traffic (say 100 visitors/hr from a HN front-page bump), the PAT's 5000/hr budget is shredded in 20 minutes when combined with other GitHub calls (pinned repos REST). After that, GitHub returns 403 with `X-RateLimit-Remaining: 0` and the heatmap silently disappears.

Worse: if a developer accidentally **omits** the PAT (forgot to set the Coolify env var), the calls fall back to unauthenticated. 60/hr is gone in 5 minutes from a single brief traffic spike.

**Why it happens:**
- Next.js 16 changed the caching default (`fetch` is not cached by default in dynamic contexts; opt-in via `next: { revalidate }` or the new `use cache` directive).
- The codebase had no prior pattern for external-API caching — all v1 work was internal (Mongo, content.json).
- `console.error("rate limited")` goes nowhere because there's no observability.

**How to avoid:**
- Phase 7 must explicitly cache every external API call with `next: { revalidate: <seconds>, tags: ["github-stats"] }`. Revalidate budgets:
  - GitHub heatmap: 1 hour (`revalidate: 3600`).
  - Pinned repos with star counts: 1 hour.
  - Tokscale SVG embed: 6 hours (it's an SVG, doesn't need to be live).
  - RSS subscriber count: 24 hours (if even tracked).
- Add a `Cache-Control` response header on `/stats` itself: `public, max-age=300, s-maxage=3600, stale-while-revalidate=86400` so Cloudflare (if in front) absorbs the load.
- Phase 7 must implement an **explicit graceful degradation** for 403/429 responses: log to `console.error` with a structured prefix like `[stats/github] rate-limited, falling back to last-known-good`, render the placeholder.
- Document the rate-limit math: at 1-hour revalidate, `/stats` triggers ≤ 24 GitHub calls/day regardless of traffic. Well under any budget.

**Warning signs:**
- Coolify logs show 403 responses from `api.github.com` during traffic spikes.
- `/stats` heatmap is blank for hours at a time on the live site.
- `pnpm build` output shows `/stats` as `λ (Dynamic)` instead of `ISR` — means the cache directives didn't take.

**Phase to address:** **Phase 7** — owns caching strategy. Verify before Phase 8 starts because Phase 8's `/freelance` page may want to lift the same caching pattern.

---

### Pitfall 10: Tokscale scraping was the wrong choice — they ship a public SVG embed API, scraping is fragile and pointlessly complex

**What goes wrong:**
Phase 7's brief mentioned "Tokscale.ai stats (API research → scrape fallback)" with scraping as the intended path. The developer writes an HTML parser against `tokscale.ai/<username>`, ships it, and three weeks later Tokscale rewrites their frontend (entirely possible — it's a young project on npm 1.2.x). The parser returns gibberish or null. The `/stats` integration breaks. **Worse:** any robust scraper will need to evade their rate limits, possibly violate their Terms of Service, and risks an IP ban on the Coolify VPS that affects unrelated services.

The actual situation (verified via web search): Tokscale ships a documented public SVG embed at `https://tokscale.ai/api/embed/<username>/svg` and a shields-style badge at `https://tokscale.ai/api/badge/<username>/svg` with query params for theme/sort/compact. **There is nothing to scrape.** The "scrape fallback" plan is solving a non-problem.

**Why it happens:**
- The project brief was written before doing the API discovery research.
- Scraping is the "obvious" solution when no JSON API exists, but Tokscale ships SVG (not JSON) — equally fine for an embedded stats display.

**How to avoid:**
- Phase 7 must **drop the scrape plan entirely** and use the SVG embed endpoint. Pseudocode:
  ```tsx
  <object data={`https://tokscale.ai/api/embed/${tokscaleUsername}/svg?theme=light&compact=1`}
          type="image/svg+xml" aria-label="Tokscale AI token usage stats" />
  ```
- If structured data (counts, ranks) is actually needed for the page (e.g. to combine with other stats), check `https://tokscale.ai/api/badge/<username>/svg?metric=rank` — but realistically the SVG-embed-only approach matches the page's purpose.
- Caching: the SVG endpoint counts as `img-src` under our CSP. `next.config.ts` currently allows `img-src 'self' data: https: blob:` — already permissive enough. **No CSP change needed** for Tokscale.
- Fallback: if Tokscale returns 404 or the SVG fails to load, the `<object>` tag will show its children — render a `<span>Tokscale stats unavailable</span>` inside.

**Warning signs:**
- The Phase 7 plan still mentions an HTML parser or `cheerio`/`jsdom`-style dependency.
- A new dependency like `playwright` is being added for "scraping".

**Phase to address:** **Phase 7** — must rewrite the Phase 7 plan's Tokscale strategy before implementation starts. This is a **plan-level** pitfall, not an implementation one.

---

### Pitfall 11: Pinned repos layout assumes exactly 6 — breaks visually with 0/1/3/5

**What goes wrong:**
GitHub's "pinned repositories" feature lets a user pin 0 to 6 repos. The `/stats` page UI is designed around a 2×3 or 3×2 grid (Linear/Vercel aesthetic, per the brief's tone reference). The implementation hardcodes a 6-item layout. If Zach un-pins one to feature a new project, the grid shows 5 items + a glaring empty cell. If pins drop to 3, the grid is half-empty and looks broken on desktop while still looking fine on mobile (where 1-column collapse hides the issue).

**Why it happens:**
- "GitHub gives you 6 pins" is folklore that everyone repeats; nobody plans for 0–5.
- Tailwind's `grid-cols-3` doesn't auto-balance — it just leaves blank cells.
- The dev's GitHub will likely have 6 pins during development, so the bug only manifests for visitors after Zach changes pins.

**How to avoid:**
- Phase 7's pinned repos component must use a **content-aware** layout:
  - 0 pins → render nothing (or a "Featured projects on GitHub" link only).
  - 1–3 pins → 1-column or compact strip.
  - 4–6 pins → 2- or 3-column grid.
- Use Tailwind's `grid-cols-[repeat(auto-fill,minmax(280px,1fr))]` for fluid wrapping, not hardcoded `grid-cols-3`.
- Acceptance test: temporarily mock the GitHub response with 0, 1, 3, 6 pins and screenshot each at desktop + mobile.
- Defensive coding: render a skeleton when `pinnedRepos.length === 0` rather than `null` — null might collapse adjacent margins and shift other stats above it.

**Warning signs:**
- Grid has visible empty cells.
- Mobile and desktop look fine but tablet looks lopsided.

**Phase to address:** **Phase 7**.

---

### Pitfall 12: `/now` page goes stale — visitor sees "last updated 14 months ago" and the site feels abandoned

**What goes wrong:**
The `/now` page is, by convention (nownownow.com), a "what I'm doing this month" page. It's content-managed (likely in `content.json` per the project's pattern). The first cut launches with `lastUpdated: "2026-05-12"`. Six months later, the page still says May 2026. The whole purpose of a `/now` page — signalling currency — is inverted. It actively communicates "this site is abandoned" to anyone who clicks through.

The same failure mode hits the freelance "Available for work" flag: stale = misleading at best, deceptive at worst (Phase 8 covers this for the freelance side; this pitfall is specifically about `/now`).

**Why it happens:**
- No build-time check for staleness.
- The `lastUpdated` field is freeform in `content.json`, easy to forget.

**How to avoid:**
- Phase 7's `/now` page must:
  1. Render `lastUpdated` prominently (top of page).
  2. **If `lastUpdated` is older than 90 days**, hide the link to `/now` from the main nav (computed server-side in `Footer` or `Navigation`) and show a banner on `/now` itself: "This page is overdue for an update — content may be out of date."
  3. **If older than 180 days**, the page returns a `<meta name="robots" content="noindex">` to prevent stale content from being indexed.
- Add a build-time `console.warn` (not error — won't fail the build) emitted by `loadContentServer` if `now.lastUpdated` is > 90 days old. Visible in Coolify deploy logs and reminds the user to update.
- Document the design: "Stale-by-design degradation. We prefer hiding a stale `/now` to lying."

**Warning signs:**
- `/now` page shows a date > 3 months old.
- The "Now" link is in the main nav but the page hasn't been touched in half a year.

**Phase to address:** **Phase 7** — owns the staleness logic.

---

### Pitfall 13: RSS subscriber count — there is no canonical source, showing a fabricated/inflated number is brand suicide

**What goes wrong:**
The brief mentions "RSS subscriber count" as a `/stats` metric. The hard truth: there is **no canonical way to count RSS subscribers** because RSS is a pull protocol — readers fetch the feed, the server has no idea who's reading. The only proxies available are:
- HTTP request count to `/blog/feed.xml` over a window (which counts every fetch, not unique subscribers).
- Cloudflare analytics on the feed path (if Cloudflare is in front of the site).
- Self-host a feed proxy like FeedPress (paid).

The naive implementation either (a) hardcodes a number ("128 RSS subscribers!"), (b) counts raw `feed.xml` GETs (off by 10–100x), or (c) divides raw GETs by an assumed-poll-frequency-per-reader (still wildly inaccurate). All of these are at best misleading and at worst dishonest. For a personal portfolio that lives or dies on credibility (especially the freelance angle in Phase 8), shipping a fake-looking number is worse than not shipping the stat at all.

**Why it happens:**
- The brief asked for the stat without specifying the source.
- "Just count the feed fetches" looks tractable until you think about what a single Feedly subscriber generates in requests/day.

**How to avoid:**
- Phase 7 must either:
  - **Option A (preferred): Drop the RSS subscriber count from `/stats` entirely.** Document the reason in the Phase 7 plan: "Cannot be measured honestly without paid tooling. Won't ship until we have FeedPress or similar."
  - **Option B: Ship total RSS feed *fetches* over the last 30 days, labelled honestly** ("RSS feed: 412 reader pings in the last 30 days"). Requires logging feed requests — possible via Cloudflare analytics if it's in front, otherwise via a request-count counter in MongoDB.
- Whatever ships, the label must **not** say "subscribers" if the underlying number isn't subscribers.

**Warning signs:**
- The number on `/stats` is suspiciously round (50, 100, 500) or hasn't moved in months → it's hardcoded.
- The number is implausibly high (4500 subscribers for a brand-new feed) → it's raw fetches.

**Phase to address:** **Phase 7** — must be resolved at the planning level. The recommended action is to **cut the metric** and document why.

---

### Pitfall 14: Schema markup conflict — adding `Service` schema breaks the existing `Person` schema

**What goes wrong:**
The current `HomeClient.tsx` embeds a JSON-LD `Person` schema. Phase 8 adds a `Service` schema to `/freelance` (and possibly homepage if the "available for work" callout is rich). Common failure modes:

- Two `<script type="application/ld+json">` blocks on `/freelance` each declaring `@context` — duplicates are technically fine but if the developer tries to "merge" them into one `@graph`, the `@id` references between `Person` (provider) and `Service` (provided-by) may not resolve, breaking Google Rich Results.
- `Service.provider` references the `Person` by `@id`, but the `Person` schema on `/freelance` is missing the `@id` field → Google validator throws "missing reference".
- `provider` is **inlined** as a nested `Person` instead of `@id`-referenced → Google reads two Person entities, deduplicates inconsistently.
- `priceRange: "£500–£5000"` doesn't match Schema.org's expected format (`$$` or `£`–`£`).
- `areaServed` is a string array (`["Ascot", "Reading", "Bracknell"]`) when Schema.org expects `Place` objects with `name` properties.

The site still renders. The `Person` rich-card in Google Search results disappears silently. Two months later you notice traffic from "Zach Lagden" searches dropped 30%.

**Why it happens:**
- Schema.org is permissive; the validator is strict.
- The existing `Person` schema was hand-built; adding `Service` is also hand-built; there's no schema-generation library in the stack.
- No automated rich-results check in CI.

**How to avoid:**
- Phase 8 plan must include: **mandatory pass through Google's Rich Results Test** (`https://search.google.com/test/rich-results`) for `/`, `/freelance`, and one blog post URL **after the Service schema lands**, before merging.
- Use the **`@graph` pattern with stable `@id` URIs**:
  ```jsonc
  {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "Person", "@id": "https://cv.zachlagden.uk/#zach", ... },
      { "@type": "Service", "provider": { "@id": "https://cv.zachlagden.uk/#zach" }, ... }
    ]
  }
  ```
- Centralise schema construction in a single utility (`src/utils/jsonLd.ts`) that takes typed input and emits the JSON-LD graph. Both the Person (existing) and the Service (new) live here. Don't write JSON-LD strings inline in two different files.
- `priceRange` should match Schema.org expectation: a single string like `"££"` or `"£500-£5000"` (en-dash optional).
- `areaServed` should be `Place[]`, not `string[]`: `{ "@type": "Place", "name": "Ascot, UK" }`.
- For `provider`'s social profiles, use `sameAs: [github, linkedin, ...]` not separate fields.

**Warning signs:**
- Google Rich Results Test returns warnings or errors on `/freelance` or `/`.
- `View Source` on `/freelance` shows **two** `Person` entities.
- Search Console "Enhancements" tab shows "Service" or "Person" markup with errors.

**Phase to address:** **Phase 8** — owns the JSON-LD refactor + validator gate. Phase 8 must verify Phase 6's birthday-leak fix (Pitfall 3) — neither schema may include `birthDate`.

---

### Pitfall 15: Cal.com URL hardcoded — username changes silently break the only CTA on `/freelance`

**What goes wrong:**
The "Book a call" CTA on `/freelance` points to `https://cal.com/zachlagden/30min`. Zach changes his Cal.com username (rebrand, account migration, whatever). The CTA now points to a 404. Visitors click "Book a call" → land on Cal.com's "user not found" page → bounce. **The single most valuable action on the entire freelance page is broken.** Nobody noticed because nobody tested CTA clicks after the rename.

**Why it happens:**
- URLs hardcoded in JSX feel ephemeral and "fine for now".
- The codebase already has the right pattern (`content.json` is the source of truth for similar links — Formspree ID, Discord ID, social URLs), but Phase 8 is a "new section" and the temptation is to hardcode.
- No link checker in CI.

**How to avoid:**
- Phase 8 must add a `freelance.calBookingUrl` field to `content.json` and read from it everywhere the booking CTA appears.
- Type it: extend `Personal` or add a `Freelance` section in `types/content.ts`.
- The `/freelance.md` machine-readable file (per the brief) must also draw from the same field — single source of truth.
- Verification: `grep -rn "cal.com\|cal\\.com" src/` should return only one file (`src/utils/serverContentLoader.ts` or wherever content flows through).
- Add a **build-time link sanity check** (optional, low-effort): if `freelance.calBookingUrl` is set, attempt a `fetch(url, { method: 'HEAD' })` during build. Log if it 404s.

**Warning signs:**
- `grep "cal.com" src/` returns more than one file.
- The Cal.com URL appears in a `<a href="...">` literal rather than `href={content.freelance.calBookingUrl}`.

**Phase to address:** **Phase 8**.

---

### Pitfall 16: "Available for work" toggle goes stale — false claim on freelance page after Zach gets booked

**What goes wrong:**
`content.json` declares `freelance.available: true`. Zach takes on three projects, becomes fully booked, forgets to flip the flag. New leads keep arriving via the "Book a call" CTA. Zach has to apologise via email and turn them away. Worse — the AI-bot-scrapable `/freelance.md` file (per the brief) also claims availability. Aggregators that index the JSON now advertise Zach as "available" to LLMs, including ones used by potential clients.

**Why it happens:**
- Boolean toggles age silently.
- No reminder mechanism.
- The brief calls out this specific pitfall — but explicitly noting it doesn't make it not happen; it just means we have to design around it.

**How to avoid:**
- Phase 8 must replace the simple `available: true` boolean with a **dated** field:
  ```jsonc
  "freelance": {
    "availability": {
      "status": "available" | "booked" | "limited",
      "asOf": "2026-05-12",
      "nextReviewAt": "2026-06-12"
    }
  }
  ```
- The page renders status using **server-computed age of the assertion**: "Available for work (as of 12 May 2026)". If `Date.now() - asOf > 30 days`, the page renders the status with a confidence-degrading note: "Status last reviewed over a month ago — please confirm before booking" and emits a `console.warn` at build time.
- The `/freelance.md` file is **generated at build time** from `content.json`, never hand-maintained — keeps it in sync automatically.
- Optional: a tiny Coolify cron (out of scope for v2.0; flag for v3) that emails Zach a "review your availability" reminder if `asOf > 30 days`.

**Warning signs:**
- The `as of` date on `/freelance` is more than a month old.
- `/freelance.md` and `/freelance` disagree on availability status.

**Phase to address:** **Phase 8** — owns the dated availability schema. The "warn at build time" check is also Phase 8.

---

### Pitfall 17: GA event firing carries PII — sending email/name in event params is a GDPR violation

**What goes wrong:**
Phase 8 wires GA events for the "Book a call" CTA click. The naive `gtag('event', 'cta_click', { ... })` implementation either:
- Reads `session.user.email` from the NextAuth session (admin only, but the code is reachable to anyone signed in) and includes it as an event param.
- Reads a query string like `?ref=alice@company.com` and forwards it.
- Includes the visitor's local timestamp + IP-derived city, which combined with low-cardinality categorical data (referrer, page path) becomes effectively PII.

This is **explicitly a GA Terms of Service violation** ("You will not send personally identifiable information to Google") and a UK GDPR Article 6 issue if no lawful basis exists for processing.

**Why it happens:**
- `gtag('event', name, params)` accepts arbitrary keys — easy to over-share.
- Developers see "make the event richer" as a goal and don't think about what counts as PII.
- The site is in the EU/UK regulatory regime (Ascot-based; uses British English) — UK GDPR + ICO enforcement is real.

**How to avoid:**
- Phase 8 must establish a hard rule: **GA events are click-only, no payloads beyond the constants `event_category`, `event_label` (page path string only), and `value` (numeric, no identifiers)**.
- Concrete event signature for the freelance CTA: `gtag('event', 'freelance_cta_click', { event_category: 'freelance', event_label: 'book_call' })`. That's the whole payload.
- Lint rule (manual review since adding ESLint plugins is heavy for one rule): grep `gtag\(` after Phase 8 lands and review every call site for PII.
- Verify CSP allows GA — current `next.config.ts` already allows `https://www.googletagmanager.com` and `https://www.google-analytics.com` in `script-src` and `connect-src`. **No CSP change needed.**

**Warning signs:**
- `gtag(` call sites include `email`, `name`, `userId`, `session`, `user` in the params object.
- GA DebugView shows event params with email-shaped strings or names.

**Phase to address:** **Phase 8** — owns the events + the no-PII rule. Document the rule in `.planning/runbooks/`.

---

### Pitfall 18: Robots.txt AI-bot directives use wrong agent names — accidentally blocks Google instead of Anthropic

**What goes wrong:**
The brief calls for an "AI-bot audit" of `robots.txt` for Phase 8. Common errors when extending the current `src/app/robots.ts`:
- Disallow `ClaudeBot` (correct) but also accidentally Disallow `Googlebot` (because the user-agent matcher is greedy or because two rule blocks were merged incorrectly). Result: deindexed from Google for the freelance page that needs SEO most.
- Use `GPTBot` (correct OpenAI training crawler) but spell it `ChatGPT-User` (which is the *user-triggered* fetcher used during ChatGPT browsing) — they have different semantics: blocking `ChatGPT-User` means ChatGPT users **cannot fetch your site when they ask Claude/ChatGPT about it**, which may be the **opposite** of what you want.
- The `robots.txt` file from Next.js `robots()` function uses a structured config — easy to get array vs object syntax wrong and produce malformed output.

There's also the inverse pitfall: the brief might intend "let AI bots in for the `/freelance.md` discovery" but the existing `robots.txt` already blocks them broadly.

**How to avoid:**
- Phase 8 must specify intent explicitly:
  - `Allow` AI crawlers on `/freelance` and `/freelance.md` (the point is AI agents discovering Zach for freelance work).
  - Default policy for `/blog`: probably `Allow` (blogs benefit from being trained on).
  - Default policy for `/admin`, `/api`: `Disallow` (already implied).
- Use the **correct exact user-agent strings**:
  - `GPTBot` — OpenAI training data crawler.
  - `ChatGPT-User` — user-triggered fetcher (consider allowing).
  - `OAI-SearchBot` — OpenAI search index (newer).
  - `ClaudeBot` — Anthropic training crawler.
  - `Claude-Web` — Anthropic user-triggered.
  - `Google-Extended` — Google's training opt-out (different from `Googlebot`).
  - `PerplexityBot` — Perplexity AI.
- After implementation, hit `https://cv.zachlagden.uk/robots.txt` and visually inspect.
- Run `https://www.google.com/webmasters/tools/robots-testing-tool` (in Search Console) to validate against Googlebot.
- Document the decisions in `.planning/runbooks/AI-CRAWLER-POLICY.md` — future-you will not remember why each agent was allowed or blocked.

**Warning signs:**
- `Disallow: /` accidentally appears under the default `User-agent: *` block.
- Both `Googlebot` and `Google-Extended` are blocked.
- Search Console flags "Indexed, though blocked by robots.txt".

**Phase to address:** **Phase 8**.

---

### Pitfall 19: British vs American English drift — `optimise`/`optimize`, `colour`/`color`, `organisation`/`organization`

**What goes wrong:**
The brief specifies British English. Existing `public/content.json` is already a mix (likely already has some `optimise` and some `optimize`). Phase 8's new freelance copy is written under time pressure with autocomplete suggesting US spellings. A few `-ize` slip in. The page reads "British" overall but professional-grade clients (especially Berkshire-local) spot the inconsistency and either dock credibility points or assume the copy is AI-generated/sloppy.

**Why it happens:**
- Most JS toolchain locales default to en-US.
- Code editors with US-English spellcheck don't flag `optimize`.
- Inconsistency is harder to spot than full-on US spelling.

**How to avoid:**
- Phase 8 must add a **manual British English review pass** as a sub-step before merging. Specifically check: `-ise/-ize` endings, `-our/-or` endings (`colour`, `behaviour`, `favourite`), `re/er` endings (`centre`, `centred`), `s/z` in `organisation`, `realise`, `analyse`.
- Add a `.planning/runbooks/COPY-STYLE.md` listing the rule and giving examples.
- Optional: add a Prettier-incompatible step in the lint workflow that greps for common US spellings and warns — overhead is high for one-time copy, so manual review is fine for Phase 8.
- Cross-check `content.json` `metadata.description` and `personal.title` etc. while in there.

**Warning signs:**
- `grep -E "ize\b|ization|optimi[sz]e" public/content.json src/app/freelance/` shows mixed results.
- Reviewer says "this reads American".

**Phase to address:** **Phase 8** — owns the copy review. Phase 6 should also do a sweep when refreshing `content.json` copy.

---

### Pitfall 20: Visible pricing on freelance page misaligned with Berkshire market — anchors too low or too high

**What goes wrong:**
The brief calls for visible pricing tiers. Two opposite failure modes:
- **Too low:** £750 for a "Brochure site" reads as "student rates" to a Berkshire/M4-corridor business. They infer junior skill level, don't book. The freelance page actively undermines positioning.
- **Too high:** £15,000 for the same brochure site reads as agency-tier to a sole-trader. They go elsewhere. Either way, visible pricing is a high-stakes anchoring decision that's hard to A/B test on a personal site (no traffic volume).

The brief acknowledges this as a "visible pricing risk" — the pitfall is to ship pricing tiers without **explicit positioning research** and then attribute the lack of bookings to "the market" rather than the pricing.

**How to avoid:**
- This is **not** a technical pitfall — it's a strategy decision Phase 8 must hold space for. Concretely:
  - Phase 8 plan must include a "pricing sanity check" sub-step: compare to 3 local Berkshire web agencies (publicly visible pricing or asking around) and 3 senior freelancers (UK-wide) at the same skill tier.
  - Document the chosen positioning explicitly in `.planning/runbooks/PRICING-RATIONALE.md`: "Pricing tier X reflects positioning Y; revisit after first 3 bookings."
  - The `freelance.pricing` field in `content.json` should be designed for easy adjustment (single source of truth, no hardcoded numbers in JSX).
- Optional hedge: pricing tier ranges (`"£X – £Y"`) give more flex than fixed prices. Plenty of agencies do this.
- "Starting from £X" is a softer anchor than "£X for Y".

**Warning signs:**
- Engagement on `/freelance` is high (people read the page) but the CTA click rate is near zero — pricing is the friction.
- Bookings come in but consistently at the lowest tier — under-priced.

**Phase to address:** **Phase 8** — owns the pricing strategy gate.

---

### Pitfall 21: "Areas I cover" lists towns outside actual coverage radius — local SEO over-claim damages trust

**What goes wrong:**
The brief mentions a "Berkshire towns" list. The temptation is to include every Berkshire town for SEO surface area: Reading, Wokingham, Newbury, Maidenhead, Slough, Windsor, Ascot, Bracknell, Sandhurst, Crowthorne. Reality: Zach is in Ascot. Reading is ~25 miles, Newbury is ~30 miles. Listing Newbury as "covered" when in practice every meeting requires a 45-minute drive sets up a credibility problem for the first lead from Newbury who asks "are you actually able to come on-site weekly?"

There's also a Schema.org pitfall here (overlapping with Pitfall 14): `areaServed: ["Reading", "Newbury", ...]` claims to Google these are real service areas. If Google's structured-data team or a manual reviewer pings the site for misleading local-business claims, the rich card disappears.

**Why it happens:**
- SEO advice says "list every local term" — applied without judgement.
- The list of Berkshire towns is right there; checking the boxes is easy.

**How to avoid:**
- Phase 8 must enforce a **realistic radius**: limit `areaServed` to towns within (say) 15 miles where on-site work is genuinely viable. Specifically Ascot, Sunninghill, Sunningdale, Bracknell, Windsor, Egham, Virginia Water, Camberley.
- The page can mention "remote work UK-wide" separately — that's honest.
- The brief explicitly cut "programmatic town pages" from scope — good, but the principle extends: don't list towns just to game SEO.
- Document in `.planning/runbooks/SERVICE-AREA.md` the criteria for inclusion in the list.

**Warning signs:**
- The areas list includes towns > 20 miles away.
- Schema.org `areaServed` is a 12+ item array.

**Phase to address:** **Phase 8**.

---

### Pitfall 22: pnpm-lock.yaml conflict during multi-Dependabot-PR merge — silent transitive vulnerability re-introduction

**What goes wrong:**
Phase 5 has 44 Dependabot PRs to resolve. The natural workflow is to batch-merge them. pnpm 10's `pnpm-lock.yaml` (lockfileVersion 9) is **merge-conflict-prone** when two PRs touch overlapping dependency trees. When the conflicts are resolved manually (a developer picks one side or runs `pnpm install` on top of a half-merged lockfile), it's easy to:
- Re-introduce the vulnerable transitive dep that one PR was specifically removing.
- Skip a `pnpm dedupe` pass → multiple copies of the same dep ship in the bundle (Framer Motion is a notorious offender).
- End up with `pnpm-lock.yaml` referencing packages no longer in `package.json` (orphan refs).

The `pnpm audit` check at the end of Phase 5 returns "0 vulnerabilities" because the lockfile was *touched* (audit hashes pass), but the actual transitive vulns are still installed.

**Why it happens:**
- 44 PRs is too many to merge sequentially by hand without auto-resolution.
- pnpm-lock.yaml conflicts look intimidating; developers reach for "delete the lockfile and re-install" which loses pinned versions.

**How to avoid:**
- Phase 5 must follow a **strict merge protocol**:
  1. Group Dependabot PRs by ecosystem area (React/Next, Auth, Markdown, Misc).
  2. Merge **one group at a time**, run `pnpm install` to regenerate the lockfile, run `tsc --noEmit && pnpm lint && pnpm build`, smoke-test the affected surface, commit.
  3. After each group: `pnpm audit --prod --json | jq '.metadata.vulnerabilities'` — must show 0 high, 0 critical. Document the count.
  4. After all groups: `pnpm dedupe && pnpm install` and re-run all checks.
- **Never** delete `pnpm-lock.yaml` and run a fresh `pnpm install` — that defeats the purpose of pinning.
- On conflict: accept neither side. Run `pnpm install --frozen-lockfile=false` after manually picking the higher version in `package.json`, let pnpm regenerate the relevant lockfile section.
- Phase 5 commit message convention: `chore(deps): bump <group> — closes #X, #Y, #Z` with explicit Dependabot PR numbers in the body for traceability.

**Warning signs:**
- `pnpm-lock.yaml` diff after a Dependabot merge is massive (>500 lines) — likely a conflict was force-resolved.
- `pnpm install` after a Dependabot merge outputs warnings about peer-dep mismatches.
- `pnpm why <pkg>` shows multiple versions of a dep that should only have one.

**Phase to address:** **Phase 5** — owns the merge protocol. Phase 7 (which may add new deps) inherits the lockfile discipline; Phase 7 plan must also follow the "one group at a time" rule.

---

### Pitfall 23: `content.json` schema additions across phases create merge conflicts — single-writer discipline broken

**What goes wrong:**
Phase 6 (content refresh + birthday), Phase 7 (`now` page + integration config), and Phase 8 (freelance + availability) each add new fields to `content.json`. If two phases are in flight simultaneously (or revisited out of order), the `content.json` git diffs overlap and `types/content.ts` drifts from the JSON shape. Symptom: `tsc --noEmit` passes locally (because the dev has a synced state) but CI fails because someone's branch has the JSON change without the type change, or vice versa.

A second variant: Phase 8 lands first (out of order), declares `freelance.calBookingUrl` in the type, but Phase 7 was meant to land before and add `now: { lastUpdated, currently, ... }`. The merged content.json now has both, but no phase verified the **combined** shape against the type.

**Why it happens:**
- `content.json` is a single mutable file edited by every content-touching phase.
- Types and JSON aren't co-located — easy to update one without the other.

**How to avoid:**
- The roadmap should explicitly serialise Phases 5 → 6 → 7 → 8. Don't parallelise. Each phase's content.json + type changes land before the next phase opens.
- Each phase's "DoD" includes: "`content.json` matches `types/content.ts`; `tsc --noEmit` passes; `loadContentServer()` returns the new shape without runtime errors."
- Optional: a build-time Zod (or hand-rolled assert) validation of `content.json` against the typed schema in `serverContentLoader`. Adds friction; high payoff for catching drift early.
- The Phase 6, 7, 8 plans each include a "Schema migration" sub-step that explicitly lists the new content.json fields and the corresponding type changes.

**Warning signs:**
- `tsc --noEmit` passes locally but fails in CI after merge.
- `content.json` has a field that doesn't appear in `types/content.ts` (or vice versa).
- Server-rendered pages have `undefined` text appearing where content should be.

**Phase to address:** **Phases 6, 7, 8** all carry this responsibility; the roadmap-level fix is enforcing serial execution.

---

## Technical Debt Patterns

Shortcuts that may be tempting during v2.0 work.

| Shortcut | Immediate Benefit | Long-term Cost | When Acceptable |
|----------|-------------------|----------------|-----------------|
| Skip per-PR smoke test during Dependabot merges (bulk-accept) | Phase 5 ships in hours | One bad bump invisible in 44-PR diff; debugging takes days | **Never** for `framer-motion`, `next-auth`, `next`, `react`. Acceptable for low-risk deps (`@types/*`, `prettier`). |
| Hardcode pricing tier numbers in JSX instead of `content.json` | Phase 8 ships sooner | Re-deploy required for every pricing tweak | Never. Adds 10 minutes to Phase 8; saves hours of redeploys. |
| Scrape Tokscale instead of using SVG embed | "More control" feels right | Breaks on every Tokscale frontend redesign; ToS risk | **Never** — the public embed exists. |
| Skip Rich Results test on Service schema | Phase 8 ships sooner | Person rich card may silently disappear from Google | Never — the test is 30 seconds. |
| Use `Promise.all` instead of `Promise.allSettled` for `/stats` | One fewer mental model | One slow integration kills the page | Never. `allSettled` is the same code-length. |
| Keep `prefer-const` style and pin only major versions (`^`) | Easier `pnpm update` | Beta libraries (next-auth) get force-bumped to breaking versions | Acceptable for non-beta deps. **Never for `next-auth@5.0.0-beta.*` — pin exact.** |
| Use `new Date(birthdayString)` in age computation | One line of code | Timezone bug for half the year | Never. Always parse `YYYY-MM-DD` as a triple. |
| Add age to JSON-LD Person schema | "Google likes structured data" | Permanent birthday leak | Never. Age can be inferred from DOB; we control only DOB and we don't publish it. |
| Make `/stats` page fully static at build time | Fastest possible render | Live data is hours/days stale | Never for the live-data sections. Use ISR with revalidate, not full static. |
| List every Berkshire town in `areaServed` for SEO | More keyword surface | Loss of credibility on first off-radius lead | Never. Local SEO honesty matters. |
| Hardcode the Cal.com URL in JSX | Phase 8 ships 5 minutes sooner | Single broken CTA on the whole freelance page | Never. |

---

## Integration Gotchas

| Integration | Common Mistake | Correct Approach |
|-------------|----------------|------------------|
| **GitHub GraphQL (contributions)** | Granting `repo` scope on the PAT | `read:user` only (covers private contributions, no repo content access) |
| **GitHub GraphQL (contributions)** | Unauthenticated requests (60/hr) — silent zeros at scale | Authenticated PAT (5000/hr) + cache with `next: { revalidate: 3600 }` |
| **GitHub GraphQL (contributions)** | Forgetting to count contributions on the `Europe/London` timezone vs UTC | Pass `from`/`to` ISO datetimes in Europe/London — `contributionsCollection(from: ..., to: ...)` |
| **GitHub REST (pinned repos)** | The REST API doesn't have a `/pinned` endpoint — using a third-party scraper | Use the GraphQL `user.pinnedItems(first: 6, types: REPOSITORY)` query — one round trip, official |
| **Tokscale** | Scraping HTML | Use `https://tokscale.ai/api/embed/<user>/svg` or `https://tokscale.ai/api/badge/<user>/svg?metric=tokens` |
| **Tokscale** | Embedding SVG via `<img>` (loses interactivity, accessibility) | `<object data="..." type="image/svg+xml" aria-label="...">` or inline SVG fetch + render |
| **Discord Watcher API (existing v1)** | Phase 5 deps bump breaks the polling backoff added in PERF-02 | Phase 5 smoke-test: load `/`, watch the network tab for `api.lagden.dev` requests, confirm backoff after 5 errors |
| **Google Analytics (existing v1, extended in Phase 8)** | Sending PII in event params | Click events only, no user identifiers, no email-shaped strings |
| **Formspree (existing v1)** | Bumping `@formspree/react` from 3.0 to 4.x (when it lands) without re-testing contact form | Phase 5: any major-version bump of `@formspree/react` requires a manual contact form submission test |
| **Next.js fetch caching** | Assuming default-cached like Next.js 14 | Next.js 16 changed defaults — `fetch` is **not** cached by default in dynamic contexts. Opt in explicitly. |
| **NextAuth v5 beta** | Treating a beta-to-beta bump as a patch | Each `5.0.0-beta.X` may change contract. Pin exact. Manual smoke test every bump. |
| **`@auth/mongodb-adapter`** | Bumping independently of `next-auth` | Bump in lockstep — the adapter version is tied to Auth.js core internals |
| **Cal.com** | Hardcoded URL in JSX | Sourced from `content.json` |
| **Cloudflare (if in front)** | Caching `/stats` aggressively without invalidation on content.json updates | If Cloudflare fronts the site, configure cache rules to honour Next.js `Cache-Control` headers; use `revalidateTag` for forced invalidation |

---

## Performance Traps

| Trap | Symptoms | Prevention | When It Breaks |
|------|----------|------------|----------------|
| `/stats` re-fetches GitHub on every request (Next 16 cache-by-default removed) | API rate-limit 403s in Coolify logs; blank heatmap on the live site | Explicit `next: { revalidate: 3600 }` on every external fetch | First time the site sees >60 anon visits in an hour |
| Tokscale SVG fetched on every request | Slow `/stats` TTFB; Tokscale rate-limits 429s | Cache the SVG response (6h revalidate); render the cached SVG as `<object>` | Same as above |
| `/stats` page uses `Promise.all` | Whole page 500s when one integration is down | `Promise.allSettled` + per-source fallback | Any single external outage |
| `/now` and `/freelance` pages re-render on every request because no revalidate | Higher VPS load; slower TTFB | `export const revalidate = 86400` (24h) on both | High traffic burst (HN, Twitter) — single VPS struggles |
| Tokscale `<object>` loads sync-blocking | LCP regression on `/stats` | Lazy-load with `loading="lazy"` (works for `<img>`; use Intersection Observer for `<object>`) | Visible on slow connections / Lighthouse scores drop |
| JSON-LD `@graph` includes the full pinned-repos list inline | Page HTML grows (~5KB extra) | Keep JSON-LD lean: Person + Service + Article schemas only, not data-mirroring | Mobile data plans / Lighthouse "page size" metric |
| Birthday computed in a loop in a hot path | CPU spikes (very unlikely but possible if `computeAge` is called inside `useMemo` deps incorrectly) | Compute once in `loadContentServer`, pass `age` as scalar prop | Never, if Phase 6 is implemented correctly |
| Framer Motion animating heatmap cells (one motion.div per day = 365 nodes) | Janky scroll on `/stats`; mobile FPS drops to 20 | Use CSS `transition` for the heatmap; reserve Framer Motion for orchestrated reveal | First mobile visitor on `/stats` |

---

## Security Mistakes

| Mistake | Risk | Prevention |
|---------|------|------------|
| Birthday in `content.json` leaked to client via prop drilling or JSON-LD | Permanent DOB leak; identity theft surface | Strip `birthday` server-side; expose `age` only; type-split `Personal` interface |
| GitHub PAT scoped to `repo` instead of `read:user` | Token leak = total repo compromise | Use `read:user` only; prefer fine-grained PAT scoped to "no repository access" + "Profile: Read-only" |
| GitHub PAT logged in error breadcrumbs | Token leaks via Coolify logs (which Coolify staff can read) | Never `console.log(process.env.GITHUB_PAT)`; redact in any error path |
| `NEXT_PUBLIC_GITHUB_PAT` accidentally added | PAT shipped to every client bundle | Strict naming: server-only env vars must **never** use `NEXT_PUBLIC_` prefix; review at PR time |
| Tokscale SVG embedded without CSP review | If we ever tighten CSP `img-src` later, this silently breaks | Current CSP `img-src 'self' data: https: blob:` covers it; document in Phase 7 plan that no CSP change is needed |
| Cal.com booking URL set via untrusted source | If `content.json` is ever editable by non-admins (future), attacker could redirect CTAs to phishing | Treat `content.json` as admin-controlled (it is — it's in git); audit if/when admin UI can edit it |
| GA events include PII | UK GDPR violation; Google ToS violation | Click-events only; no identifiers in params |
| Freelance pricing exposes "current rate" that competitors use | Loss of negotiating leverage | Acceptable trade-off — visible pricing is a positioning choice. Just be intentional. |
| `/freelance.md` machine-readable file exposes more than the page | LLMs crawl & cite outdated/private info | Generate `/freelance.md` from `content.json` at build time — single source of truth |
| Robots.txt accidentally permits `/admin/` to AI bots | Admin UI surface indexed/cited | Explicit `Disallow: /admin/` and `Disallow: /api/` for `User-agent: *` (already in v1; verify in Phase 8) |
| JSON-LD includes `Person.email` for SEO | Email harvested by bots | Use Schema.org `contactPoint` only if necessary; don't add email if not currently present |

---

## UX Pitfalls

| Pitfall | User Impact | Better Approach |
|---------|-------------|-----------------|
| `/now` shows a 6-month-old date | Site feels abandoned; lose freelance leads | Auto-hide `/now` nav link if > 90 days stale; show overdue banner |
| "Available for work" toggle is stale | Visitor books a call → Zach has to apologise → bad first impression | Dated availability with `asOf`; show "as of <date>" prominently |
| Pinned repos grid is half-empty | Looks broken / unfinished | Auto-balanced layout (1/2/3-col based on count) |
| `/stats` shows "0 commits this year" during GitHub outage | Visitor concludes Zach is inactive | Render skeleton "Loading stats — please retry shortly" instead of a literal zero |
| Visible pricing scares away "I have no idea what this costs" visitors | Bounce before booking | Optional: anchor with "Most projects: £X – £Y" before the detailed tier breakdown |
| "What I don't do" list reads dismissive ("I don't do WordPress") | Comes across as snobby | Frame positively ("I focus on X" rather than "I refuse Y") |
| "What I don't do" list reads apologetic ("I'm not great at design") | Undermines confidence | Frame as scope ("Design isn't my service — I work with X for that") |
| Freelance CTA is the only call-to-action | Visitors who aren't ready to book have no second-step | Secondary CTA: "Get on the email list" or "See past work" |
| Heatmap colours conflict with site palette | Visual mess on `/stats` | Use a custom heatmap palette derived from the site's accent colours, not GitHub's default green |
| Birthday auto-age increments to "19" on January 1 (when actual birthday is December) | Wrong age shown for a year | Pitfall 4 prevention — proper local-TZ computation |
| The freelance page reads American but the user is British | Loss of local credibility | British English review pass (Pitfall 19) |

---

## "Looks Done But Isn't" Checklist

Things that appear complete during phase work but are commonly missing.

- [ ] **Phase 5 — Dependency bump:** `pnpm audit --prod` returns 0 high/critical AND `pnpm build` still produces `.next/standalone/` AND `tsc --noEmit` passes AND home `/` route smoke-tested with intro animation in both reduced-motion states.
- [ ] **Phase 5 — Auth bump:** Sign-in flow tested end-to-end (sign out → sign in via GitHub → load `/admin/blog` → `session.user.isAdmin` is `true` in console).
- [ ] **Phase 5 — Coolify env audit:** `.env.example` matches Coolify-configured env vars; no orphan local-only vars; no missing prod-required vars (`MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME`, plus new `GITHUB_PAT`).
- [ ] **Phase 6 — Birthday safety:** `grep -r "birthday" .next/static/` returns nothing; page source contains no DOB.
- [ ] **Phase 6 — Age computation:** Inline assertions for known cases pass at module-load (DOB on Dec 31, viewed from UTC+12 etc.).
- [ ] **Phase 6 — ISR enabled:** `pnpm build` output shows `/` as ISR with 24h revalidate, not static.
- [ ] **Phase 6 — Hardcoded age stripped:** `grep -E "year-old|years old" public/content.json` returns no hardcoded age literals.
- [ ] **Phase 6 — Type/JSON sync:** `types/content.ts` `Personal` interface omits `birthday`, includes `age: number`. JSON has `birthday`, no `age`. Server loader bridges them.
- [ ] **Phase 7 — GitHub PAT scope:** GitHub settings page shows the token with `read:user` only (or fine-grained "Profile: Read-only").
- [ ] **Phase 7 — Caching declared:** Every external fetch in `/stats` has `next: { revalidate: ... }`; verified by reading the source.
- [ ] **Phase 7 — `Promise.allSettled`:** Grep confirms no `Promise.all([` over external fetches in `/stats`.
- [ ] **Phase 7 — Tokscale via embed:** No HTML scraping code; `<object>` or `<img>` references `tokscale.ai/api/embed/...` or `.../api/badge/...`.
- [ ] **Phase 7 — Pinned repos layout:** Tested with 0/1/3/6 mocked pins, no broken grid in any state.
- [ ] **Phase 7 — `/now` staleness:** Page shows last-updated date prominently; staleness banner logic implemented (even if the page is fresh on launch).
- [ ] **Phase 7 — Per-source error boundary:** `/stats` route segment has its own `error.tsx`; each integration component renders a fallback on `null` data.
- [ ] **Phase 7 — RSS subscriber decision documented:** Either cut from `/stats` (preferred) or relabelled honestly as "feed fetches".
- [ ] **Phase 8 — JSON-LD validates:** Google Rich Results Test passes on `/freelance`, `/`, and one blog post URL — no errors, no warnings on Person and Service.
- [ ] **Phase 8 — Birthday still not in schema:** `view-source:/` and `view-source:/freelance` contain no `birthDate` field in JSON-LD.
- [ ] **Phase 8 — Cal.com URL sourced from JSON:** `grep -rn "cal.com" src/` returns one read site, not multiple hardcoded references.
- [ ] **Phase 8 — Available toggle is dated:** `availability.asOf` and `availability.status` fields populated; staleness logic visible on the page.
- [ ] **Phase 8 — `/freelance.md` matches `/freelance`:** Build step generates the .md from `content.json`; both reflect the same pricing/availability.
- [ ] **Phase 8 — GA events PII-free:** Each `gtag(` call reviewed; no email/name/userId in params.
- [ ] **Phase 8 — Robots.txt validated:** Hit `https://cv.zachlagden.uk/robots.txt`, paste into Google's robots tester, no surprises.
- [ ] **Phase 8 — British English pass:** `optimise` not `optimize` across all new copy; `colour`, `behaviour`, `organisation` consistent.
- [ ] **Phase 8 — Pricing sanity check documented:** `.planning/runbooks/PRICING-RATIONALE.md` exists with comparison to 3+ peers.
- [ ] **Phase 8 — `areaServed` realistic:** Schema.org `areaServed` and on-page list both limited to ≤ 15-mile radius.
- [ ] **Phase 8 — "Available for work" callout** removable via a single content.json flag; verified by flipping and re-deploying.
- [ ] **Cross-phase — content.json + types in sync:** Each phase's PR includes both the JSON change and the type change; `tsc --noEmit` passes after merge.
- [ ] **Cross-phase — no regression in v1 features:** Intro animation still works; presence ticker still polls (with backoff); MongoDB-down guards still graceful.

---

## Recovery Strategies

When pitfalls land despite prevention.

| Pitfall | Recovery Cost | Recovery Steps |
|---------|---------------|----------------|
| Framer Motion bump breaks intro | LOW | `pnpm add framer-motion@~12.23.0` (downgrade), rebuild, redeploy. Open Phase 5 follow-up issue. |
| next-auth beta bump breaks auth | LOW-MEDIUM | `pnpm add next-auth@5.0.0-beta.30` (downgrade to last-known-good), redeploy. Sign-in restored within minutes. |
| Birthday leaked to client | HIGH (irreversible) | DOB is now public. Rotate any account using DOB as a recovery factor (banks, identity verification). Add note to PROJECT.md "DOB was leaked at <commit>; treated as public". |
| GitHub PAT leaked | HIGH | Immediately revoke on GitHub settings. Audit recent activity on the account. Create new PAT with minimum scope. Update Coolify env. Redeploy. |
| `/stats` returns 500 due to integration outage | LOW | If `error.tsx` exists, automatic; visitors see fallback. If not: `revalidateTag("stats")` to force re-cache, or temporarily set `export const dynamic = "error"`. |
| Cal.com URL points to a 404 | LOW | Update `content.json` `freelance.calBookingUrl`, redeploy. Visitors back to a working flow in minutes. |
| Stale `/now` indexed by Google | MEDIUM | Add `<meta name="robots" content="noindex">` to `/now` if stale; submit URL removal request in Search Console; update `/now` for real. |
| Wrong birthday in `content.json` (typo) → wrong age shown | LOW | Fix `content.json`, redeploy (or wait 24h for ISR). |
| Schema markup broken Person rich card | MEDIUM | Fix schema, redeploy, request re-validation in Search Console. Rich card typically restored within a week. |
| Dependabot mass-merge introduced silent vuln | MEDIUM | `pnpm audit --prod`, identify the offending dep, bump or downgrade individually, redeploy. |
| Stale "Available for work" → real client confusion | LOW (operational), MEDIUM (reputational) | Update flag, redeploy, apologise individually to any pending leads. |
| Robots.txt blocks Google by mistake | LOW (config), MEDIUM (SEO recovery) | Fix robots.txt, redeploy, submit reconsideration via Search Console. Recovery takes weeks. |
| US English shipped on `/freelance` | LOW | Edit copy, redeploy. Manual review pass to catch others. |

---

## Pitfall-to-Phase Mapping

| # | Pitfall | Prevention Phase | Verification |
|---|---------|------------------|--------------|
| 1 | Framer Motion bump breaks intro | **Phase 5** | Manual smoke test of `/` in both reduced-motion states after the bump |
| 2 | next-auth beta-to-beta breaking change | **Phase 5** | Sign-in flow tested end-to-end; `dependabot.yml` ignores next-auth |
| 3 | Birthday leak to client | **Phase 6** | `grep -r "birthday" .next/static/` returns nothing; page source clean |
| 4 | Age timezone off-by-one | **Phase 6** | Inline assertions in `computeAge` pass for edge cases |
| 5 | Age stale due to static rendering | **Phase 6** | `pnpm build` shows `/` as ISR not static |
| 6 | Hardcoded age string drift | **Phase 6** | `grep -E "year-old"` returns nothing in `content.json` |
| 7 | GitHub PAT over/under-scoped | **Phase 7** | PAT shows `read:user` only on GitHub settings; runbook documents rotation |
| 8 | `/stats` fragility on integration outage | **Phase 7** | Manual fault injection (set Tokscale URL to invalid) — rest of page renders |
| 9 | GitHub API rate limit hit | **Phase 7** | Every external fetch has `next: { revalidate }`; build output shows ISR on `/stats` |
| 10 | Tokscale scrape plan | **Phase 7** | Source uses `tokscale.ai/api/embed/...`, no scraping code |
| 11 | Pinned repos layout breaks at < 6 | **Phase 7** | Tested with mocked 0/1/3/6 pins |
| 12 | `/now` page stale | **Phase 7** | Staleness banner logic visible (test by setting `lastUpdated` back 100 days) |
| 13 | RSS subscriber count fabricated | **Phase 7** | Either cut from `/stats` (documented) or relabelled honestly |
| 14 | Person + Service schema conflict | **Phase 8** | Google Rich Results Test passes on `/freelance` and `/` |
| 15 | Hardcoded Cal.com URL | **Phase 8** | `grep "cal.com" src/` returns one source-of-truth file |
| 16 | Stale "Available for work" | **Phase 8** | `availability.asOf` field exists; staleness banner kicks in at 30d |
| 17 | GA event PII | **Phase 8** | Every `gtag(` call reviewed; no identifiers in params |
| 18 | Robots.txt blocks wrong bot | **Phase 8** | Visual inspection of `/robots.txt`; Google Search Console robots tester |
| 19 | American English drift | **Phase 8** (and 6 for content refresh) | Manual review pass; grep for `-ize` suffixes |
| 20 | Pricing misaligned with market | **Phase 8** | `PRICING-RATIONALE.md` documents comparison to 3+ peers |
| 21 | `areaServed` over-claim | **Phase 8** | List limited to ≤ 15-mile radius; documented in `SERVICE-AREA.md` |
| 22 | pnpm-lock.yaml merge conflict | **Phase 5** | Sequential group merges, `pnpm audit` after each, `pnpm dedupe` final |
| 23 | content.json schema drift across phases | **Phases 6/7/8** (roadmap-level) | Serial phase execution; each phase's DoD includes JSON↔type sync |

---

## Cross-Phase Verification Gates

These are explicit "must verify X before Y starts" requirements that emerge from the pitfall analysis:

- **Phase 5 must complete before Phase 7 starts.** Phase 7 introduces new external deps (or at least new API consumption patterns) and benefits from a clean dependency baseline. Phase 7's `GITHUB_PAT` env var addition also makes more sense after Phase 5's Coolify env audit.
- **Phase 6 must complete before Phase 8 starts.** Phase 8 references age in freelance copy ("18-year-old developer in Berkshire") and JSON-LD. If Phase 6's birthday/age handling isn't solid, Phase 8 inherits the timezone bugs and the leak risk.
- **Phase 7 must complete before Phase 8 starts.** Phase 8's `/freelance` page benefits from the caching patterns established in Phase 7 (`/stats` ISR, `Promise.allSettled`). Otherwise Phase 8 reinvents the wheel and likely introduces inconsistencies.
- **Each phase verifies v1 features did not regress.** Specifically:
  - Intro animation (STAB-03/04 fixes still hold).
  - MongoDB-down graceful degradation (CONCERNS #2 fix still holds).
  - Presence polling backoff (PERF-02 still holds).
  - Auth admin gating (SEC-04 still holds).
  - Markdown sanitisation (SEC-01 still holds).
  - Upload SVG rejection (SEC-05 still holds).

---

## Sources

- **`.planning/codebase/CONCERNS.md`** — 31 concerns documented during v1 stabilisation (HIGH severity findings #1-6 most relevant for understanding the codebase's existing failure modes).
- **`.planning/codebase/INTEGRATIONS.md`** — external service inventory; informs the v2.0 integration surface.
- **Current `next.config.ts`** — CSP allows `https:` for `img-src` (covers Tokscale SVG) and `https://www.google-analytics.com` for GA. No CSP change needed for Phase 7 or 8 GA events.
- **`public/content.json`** — confirmed age is currently embedded in string literals (`"18-year-old"`), not a structured field. Phase 6 must replace string templates.
- **`package.json`** — `next-auth@5.0.0-beta.30` exact pin confirms beta status; informs Pitfall 2.
- **GitHub Discussions community/24812** — confirms `read:user` scope is required for private contributions via GraphQL `contributionsCollection`. (`https://github.com/orgs/community/discussions/24812`)
- **GitHub Docs — `contributionsCollection`** — confirms scope behaviour. (`https://docs.github.com/en/graphql/reference/objects#contributionscollection`)
- **Tokscale README + project page** — confirms public SVG embed and badge endpoints; scraping is unnecessary. (`https://github.com/junhoyeo/tokscale`, `https://tokscale.ai/`)
- **Next.js 16 caching docs** — confirms `fetch` is **not** cached by default in dynamic contexts; opt in via `next: { revalidate }`. (`https://nextjs.org/docs/app/getting-started/caching-and-revalidating`)
- **Next.js 16 ISR guide** — `export const revalidate = N` is the supported pattern for time-based revalidation. (`https://nextjs.org/docs/app/guides/incremental-static-regeneration`)
- **MDN — `Intl.DateTimeFormat`** — canonical way to do timezone-aware date arithmetic without library deps.

---

*Pitfalls research for: zachlagden.uk v2.0 (Polish, Integrations & Freelance)*
*Researched: 2026-05-12*
