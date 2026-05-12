# Research Summary: zachlagden.uk v2.0 (Polish, Integrations & Freelance)

**Synthesized:** 2026-05-12
**Sources:** STACK.md, FEATURES.md, ARCHITECTURE.md, PITFALLS.md
**Overall confidence:** HIGH — ready for roadmap. Open items are user-input, not research gaps.

## Executive Summary

v2.0 is a tight, tactical milestone built on a now-stabilised v1 (23 reqs shipped, 6 HIGH concerns closed). The four phases — dep hardening, content refresh, integrations, freelance — share **one mutable surface** (`public/content.json`) and **one verification floor** (`tsc --noEmit && pnpm lint && pnpm build`). Across all three research streams, the same shape emerged: add three small libraries (`@octokit/graphql`, `schema-dts`, `knip`), avoid scrapers (Tokscale ships a public SVG embed), use native `Date` for age (no date library), and serialise the phases (5 → 6 → 7 → 8) rather than parallelising them.

The recommended approach is small, opinionated additions leaning hard on existing patterns (RSC ↔ `*Client` islands, content-as-props, `src/lib/` server-only). New routes (`/stats`, `/now`, `/freelance`, `/freelance.md`) stay outside the home-page section/keyboard-nav system. Caching for Phase 7 is in-process via `unstable_cache` (single VPS, no Redis), and Phase 8 ships JSON-LD `Service` + a build-time-generated `/freelance.md` route handler that mirrors the same content source. The "personal-site, not agency" tone is the anti-feature filter throughout.

The two biggest risks are **DOB leakage** (Phase 6's `personal.birthday` must never reach the client bundle or JSON-LD) and **mass-Dependabot regression** of the cinematic intro animation (no tests; `pnpm build` is the last line of defence).

## Locked Cross-Cutting Decisions

These are locked across all 4 phases. The roadmapper should NOT re-evaluate.

| Decision | Rationale |
|---|---|
| Native `Date` for age (no `date-fns`/`dayjs`) | 4-line util; server-only computation |
| `@octokit/graphql` over full `octokit` | Single GraphQL query, ~12 KB gz |
| `schema-dts` for typed JSON-LD | Type-only, retrofits existing `Person` schema |
| `knip` over `depcheck` | Better Next 16 / TS 5 awareness |
| `unstable_cache` over `"use cache"` directive | `"use cache"` still stabilising (vercel/next.js#89375) |
| Tokscale via public SVG embed | NOT scraping — Tokscale README confirms public endpoint at `/api/embed/{user}/svg` |
| RSS subscriber count: CUT or honest-relabel | No canonical data source; fabrication = brand damage |
| Cal.com: outbound link only, NO SDK/embed | Page-weight + consent + tone |
| Serial phase execution 5→6→7→8 | content.json schema drift risk; NO parallelisation |
| Verification floor: `tsc --noEmit && pnpm lint && pnpm build` per batch | `pnpm build` added beyond v1 — Docker/Coolify regression catch |
| Node runtime (default) for all routes | No Edge experiments |
| Robots.txt stays dynamic (`src/app/robots.ts`) | Already reads `siteUrl` from content.json |
| `Promise.allSettled` (NOT `Promise.all`) for `/stats` | One outage must not kill the page |

## Stack Additions Per Phase

| Phase | Runtime adds | Tooling | Anti-deps |
|---|---|---|---|
| 5 | none | `pnpm outdated`, `pnpm dedupe`, `pnpm dlx ncu`, `pnpm dlx knip`; `knip` installed as devDep | `depcheck`, `pnpm-deduplicate`, `npm-check` (old) |
| 6 | none | native `Date` + `Intl.DateTimeFormat` | `date-fns`, `dayjs`, `luxon`, `moment` |
| 7 | `@octokit/graphql@^9.0.3` | `unstable_cache`, vendored `linguist-colors.json` | `cheerio`, `linkedom`, `playwright`, full `octokit`, `feedly-client`, Apollo/urql/graphql-request |
| 8 | `schema-dts@^2.0.0` (type-only) | existing `@next/third-parties` `sendGAEvent` | `next-seo`, `@calcom/embed-react`, `react-ga`, `nextjs-google-analytics` |

**Verification floor enforced beyond v1:** add `pnpm build` to the per-batch floor (Coolify Docker builds are the only place Turbopack-specific issues surface).

## Features Per Phase (Table Stakes / Differentiators / Anti-features)

### Phase 5 — Dep hardening + env config

- **Table stakes:** 44 alerts resolved; `pnpm audit` 0 high/critical; env audit; `GITHUB_PAT` provisioned; env-vars + auth-smoke-test runbooks
- **Differentiators:** `knip` baseline; `dependabot.yml` ignoring `next-auth` beta-to-beta
- **Anti:** bulk-merge without per-group smoke test; bumping `framer-motion` together with anything else; bumping `next-auth` without sign-in test

### Phase 6 — Content refresh + auto-age

- **Table stakes:** `src/utils/age.ts` (London-tz-aware); `personal.birthday` server-only (stripped at loader); `age` computed; ISR `revalidate: 86400` on `/`; hardcoded "18-year-old" strings templated; tagline/skills/experience copy refresh (British English)
- **Differentiators:** build-time assertion that `birthday` doesn't leak; inline assertions in `computeAge` for edge cases
- **Anti:** `birthDate` in JSON-LD `Person`; age in hero `<title>`/OG metadata; optional `age?: number` type; parenthetical "Born YYYY (N)" format

### Phase 7 — Integrations + /stats + /now

- **Table stakes:** GitHub heatmap (53×7 canonical 5-bucket green, light+dark); pinned repos (auto-balanced 0/1/3/6 layout via `grid-cols-[repeat(auto-fill,minmax(280px,1fr))]`); `/now` page (static, 250–400 words, staleness banner >90d, `noindex` >180d); `/stats` composing all of it; streak indicator (free from heatmap data); homepage `StatsTeaser` (route link, NOT in-page anchor); Tokscale via SVG embed; `unstable_cache` everywhere; `Promise.allSettled`; `/stats/error.tsx` segment boundary
- **Differentiators:** year selector; public+private unified contributions; embedded `PresenceStatus`
- **Anti:** RSS subscriber count (CUT or honest-relabel as "feed fetches"); shields.io badge cards; wakatime/LOC stats; commit message scroller; top-langs pie; "total stars" megablock; animated count-ups; embedded `ghchart.rshah.org` iframe; `/stats` in primary nav (footer + teaser instead)

### Phase 8 — Freelance offering

- **Table stakes:** `/freelance` page (hero + 3+1 pricing + "What I don't do" + "How it works" + areas + past-work line + final CTA); Linear/Plain-style 5–10 word direct H1 (no buzzwords); "From £X" framing; "Most popular" on Standard ONLY if true; `Service` JSON-LD via `schema-dts` using `@graph` + stable `@id` cross-ref to `Person`; `/freelance.md` via dynamic route handler (NOT prebuild codegen); Cal.com link × 4 placements (UTM-tagged); `sendGAEvent` with click-only PII-free payload; `AvailabilityCallout` driven by dated `availability.asOf`; robots.txt per-bot allow rules (GPTBot/ClaudeBot/Claude-Web/PerplexityBot/CCBot/anthropic-ai/Google-Extended/Applebot-Extended); `Disallow: /admin` and `/api` for `*`; `areaServed` ≤15-mile radius (Ascot/Sunninghill/Sunningdale/Bracknell/Windsor/Egham/Virginia Water/Camberley); British English consistency pass
- **Differentiators:** dated availability with `asOf` + staleness `console.warn` at build; past-work inline line (single line not card grid); `PRICING-RATIONALE.md` peer comparison runbook
- **Anti (per brief):** FAQ accordion; testimonials carousel; mocked case studies; `LocalBusiness` schema; programmatic per-town pages; Cal.com inline embed; animated count-ups; live chat; stock photos; multiple CTAs; phone line; newsletter signup on /freelance

## Build Order (HARD — serial, NOT parallel)

```
Phase 5 → Phase 6 → Phase 7 → Phase 8
```

**Hard dependencies:**

- **5 → 7:** `GITHUB_PAT` env var provisioned during Phase 5 env audit
- **6 → 8:** Phase 8 freelance copy references age; Phase 6's `birthday`-strip pattern must be solid before Phase 8's JSON-LD `Service` lands (another leak surface)
- **7 → 8 (soft):** Phase 8 inherits Phase 7's `unstable_cache` + JSON-LD typing patterns

**Phase 6 first as warm-up:** independent of Phase 5 beyond runbook; landing first surfaces `content.json` schema sync discipline before 7/8 stack additional fields.

**Pitfall 23 (content.json schema drift) explicitly mandates no parallelisation** — three phases all extend the same JSON file and TS interface; serial is the only path that keeps `tsc --noEmit` honest.

## Critical Pitfalls with Phase Ownership

1. **DOB leak via JSON-LD or client props** → Phase 6. Strip at `loadContentServer`; `Personal` type omits `birthday`; no `birthDate` in JSON-LD. Verify: `grep -r "birthday" .next/static/` returns nothing.
2. **Framer Motion bump breaks intro state machine** → Phase 5. Bump isolated; pin `~12.23.x` patch-only for v2.0; smoke-test `/` in both reduced-motion states.
3. **`next-auth@5.0.0-beta.30` beta-to-beta breaks OAuth contract** → Phase 5. Configure `dependabot.yml ignore: next-auth`; commit `.planning/runbooks/AUTH-SMOKE-TEST.md`.
4. **GitHub PAT over-scoped to `repo`** → Phase 7. `read:user` only; prefer fine-grained PAT "no repo access" + "Profile: Read-only".
5. **`/stats` uses `Promise.all` → outage kills page** → Phase 7. `Promise.allSettled` + per-source fallback components + `/stats/error.tsx` segment boundary.
6. **Age stale because `/` statically rendered** → Phase 6. `export const revalidate = 86400` on `/`. `pnpm build` output must show `/` as ISR not Static.
7. **content.json schema drift across phases 6/7/8** → cross-phase, mandates serial execution.

Other pitfalls (full detail in `PITFALLS.md`):

- Age timezone bug (Phase 6): `Intl.DateTimeFormat` with `timeZone: "Europe/London"`; parse YYYY-MM-DD as `{year,month,day}` triple.
- GitHub API rate limits (Phase 7): every fetch declares `next: { revalidate: 3600 }`.
- Tokscale scrape plan wrong (Phase 7): use public SVG embed.
- Pinned grid breaks at 0/1/3/5 (Phase 7): content-aware layout.
- `/now` staleness (Phase 7): auto-hide nav at >90d, `noindex` >180d.
- RSS fabrication (Phase 7): cut from `/stats`.
- Person+Service JSON-LD conflict (Phase 8): `@graph` + stable `@id` + Google Rich Results Test.
- Cal.com URL hardcoded (Phase 8): single read site from `content.json`.
- Stale availability toggle (Phase 8): dated `availability.asOf` + build-time `console.warn` >30d.
- GA event PII (Phase 8): click-only payload, no identifiers.
- Robots.txt wrong agent (Phase 8): exact strings, validate via Search Console.
- British English drift (Phases 6, 8): manual review pass.
- Pricing misaligned with Berkshire market (Phase 8): `PRICING-RATIONALE.md` ≥3 peer comparison.
- `areaServed` over-claim (Phase 8): ≤15-mile radius.
- pnpm-lock conflicts (Phase 5): sequential group merges + `pnpm dedupe` after each.

## Research Flags

**Needs research during planning:**

- **Phase 7** — Probe Tokscale SVG endpoint params; verify GitHub Public profile "Include private contributions" toggle is on; spike pinned-repos count (decides layout); confirm fine-grained vs classic PAT path with user. ~30–60 min.
- **Phase 8** — Mostly user-input gathering: Cal.com URL, final pricing numbers, past-work client clearance, 3+1 layout sign-off. ~15 min.

**Skip research:**

- **Phase 5** — Dep batching fully spec'd in STACK.md + PITFALLS.md; follow the per-batch protocol.
- **Phase 6** — Native `Date` + `Intl.DateTimeFormat` + `loadContentServer` extension fully spec'd; 4-line util + 3 file mods.

## Confidence Assessment

| Area | Confidence | Notes |
|---|---|---|
| Stack | HIGH | All versions verified via npm + Context7; GraphQL shape verified against GitHub docs; Tokscale endpoint verified directly from README; Node 20 verified against Coolify base image |
| Features | MEDIUM-HIGH | Linear/Plain/Vercel WebFetched; pricing 3-tier cross-referenced; `/now` canonical (Sivers). MEDIUM only on "What I don't do" pattern (no quantitative study) |
| Architecture | HIGH | Fully mapped against existing codebase; `feed.xml/route.ts` is the reference for `freelance.md`; anti-patterns explicitly called out |
| Pitfalls | HIGH | Grounded in `.planning/codebase/CONCERNS.md` + current `next.config.ts` + `package.json` + verified third-party API shapes |

**Overall:** HIGH — ready for roadmap creation. Open questions are user-input items, not research gaps.

## Open Questions for User Before Planning

1. **Cloudflare proxy mode?** — `personal-infra.md` confirms DNS-level Cloudflare. Assume DNS-only / no CF cache unless user confirms full proxy. If proxied, CF page rules must honour Next `Cache-Control`.
2. **`/now` page source** — content.json field (`now: NowContent`) recommended over separate markdown file (consistency with content-as-props pattern).
3. **GitHub PAT type** — fine-grained recommended ("No repo access" + "Profile: Read-only", 1y expiry forces rotation). Classic `read:user` fallback.
4. **Cal.com booking URL** — user to supply. Stored in `content.personal.freelance.calLink`, never hardcoded.
5. **Pricing tier final numbers** — confirm milestone brief numbers (Starter £750 / Standard £1,800 / Pro £3,500+ / AI Integration £1,500+).
6. **Past-work clients cleared for citation** — Thatched Tavern / Chertsey Show / Blueview Group (already in CV). Sanity-check before naming on more promotional `/freelance` page.
7. **Pricing layout 3+1 (recommended) vs 4 tiles in a row** — FEATURES.md recommends 3+1; user to confirm.
8. **Availability toggle cadence** — git-committed boolean fine for v2.0; defer Mongo-backed toggle to v3 if higher cadence needed.

---

*Ready for requirements scoping.*
