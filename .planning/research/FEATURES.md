# Feature Research — v2.0 Polish, Integrations & Freelance

**Domain:** Personal portfolio + blog (NOT agency) — content refresh, GitHub/Tokscale integrations, `/now`, `/stats`, `/freelance`
**Researched:** 2026-05-12
**Confidence:** MEDIUM-HIGH

Scope is intentionally narrow — only the new capabilities for Phases 6, 7, 8. Pre-existing features (CV, blog, presence, intro) are out of scope per the milestone brief.

Personal-site context drives every recommendation: this is a one-person site, not an agency. The bar for "braggy" is lower, the tolerance for embedded widgets is lower, and the tone reference is Linear / Vercel / Plain (direct, no buzzwords) — not Webflow agency template.

---

## Phase 6 — Content Refresh (UX-light)

Only one substantive UX question: how to render the auto-computed age in About copy.

### Age rendering — 3 options ranked

| Pattern | Example | Verdict |
|---------|---------|---------|
| Inline number, no fanfare | "I'm a 22-year-old Director and full-stack developer based in Ascot." | **RECOMMENDED** — matches current voice in `about.mainDescription`; the age is just a fact, not a flex |
| Parenthetical with birth year | "Born 2003 (22), Ascot-based." | Avoid — feels CV-formal, doesn't fit the conversational About tone |
| Standalone label | "Age: 22" in a sidebar stat | Avoid — turns biography into a spec sheet |

**Implementation note:** The current `about.mainDescription` opens with "I'm an 18-year-old entrepreneur, technical architect…". The straight replacement is `I'm a {age}-year-old entrepreneur…` with `{age}` computed server-side from `personal.birthday` (no client-side calc — would cause hydration mismatch and goes stale at midnight). Drop the comma-formatted "X-year-old" only if age becomes two digits (it won't until 2103). Title-case `{age}-year-old` only when sentence-leading.

**Anti-pattern:** Don't render age in the hero / metadata title. Hero today is "Technical Architect & Entrepreneur" — adding age there shortens the shelf life of every screenshot, OG-share, and Google snippet to one year.

---

## Phase 7 — Integrations + /stats Feature Landscape

### Table Stakes (visitors expect these on a "stats" page)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| GitHub contribution heatmap | Canonical signal of "this person codes regularly"; every dev portfolio with a stats section has one | MEDIUM | Use GitHub GraphQL API `contributionsCollection.contributionCalendar` — returns weeks → days with `contributionCount` and `color` pre-bucketed; PAT must have `read:user` scope. No need to compute buckets yourself. Render 53 weeks × 7 days SVG/CSS grid. |
| Day-cell tooltip with date + count | Every visitor will hover the densest cell to see the number; expected from github.com itself | LOW | Native `<title>` works; for animated tooltip use Radix `@radix-ui/react-tooltip` (already in the shadcn tier). Format: "12 contributions on Tue, 4 Jun 2025". |
| Weekday axis (Mon/Wed/Fri) + month labels along top | GitHub's own layout — visitors pattern-match it instantly | LOW | Show Mon, Wed, Fri only (GitHub convention — Sun/Tue/Thu/Sat hidden to reduce noise). Month labels at the first column of each month. |
| 5-bucket green colour scale | This is the visual signature; anything else and visitors won't recognise it | LOW | Light mode (GitHub's exact values): `#ebedf0` (none), `#9be9a8`, `#40c463`, `#30a14e`, `#216e39`. Dark mode (GitHub's exact values): `#161b22` (none), `#0e4429`, `#006d32`, `#26a641`, `#39d353`. Honour `prefers-color-scheme`. |
| Pinned repos: name, description, primary language + colour dot, ⭐ stars, fork count | This is exactly what github.com/{user} shows; visitors expect parity | LOW-MEDIUM | Pull via GraphQL `user(login: ...) { pinnedItems(first: 6, types: REPOSITORY) }`. Cache aggressively (1 hour ISR or `revalidate`). Render 6 cards in a 3×2 grid on desktop, 2×3 or single-column on mobile. Use `linguist-colors` npm pkg or vendor `linguist-colors.json` into the repo (262 KB raw, smaller than adding a dep just to read a JSON map). |
| Pinned repo card → external link to repo | Cards are useless if you can't click through | LOW | `target="_blank" rel="noopener noreferrer"` + visible "↗" icon for explicit affordance. |
| `/now` page existing at all | Convention from nownownow.com; visitors who know the convention will look for it | LOW | Static `/now/page.tsx` — server component, content authored in markdown or JSX, no DB. |
| Reduced-motion fallback for heatmap | Site already honours `prefers-reduced-motion` everywhere; consistency demands it | LOW | Skip the per-cell hover scale; keep the colour change. No fade-in animation on initial render either. |

### Differentiators (genuinely useful, set the page apart)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| Public + private contribution unified | GitHub's own profile heatmap only shows public + private (if you opted in); but for an entrepreneur whose real work is mostly private repos, the public-only number undersells. A unified count with a small "includes private" footnote is honest signal. | LOW (depends on PAT scope) | The same GraphQL endpoint returns both when the PAT has `read:user` and the user has set Settings → Public profile → "Include private contributions on my profile". No code work — just toggle the GitHub setting plus PAT scope. |
| Year selector (2026 / 2025 / 2024…) | Adds depth without bloat; GitHub itself has this | LOW | Buttons or `<select>` above the grid; refetches via search-param-driven server component. Skip if it complicates ISR. |
| Streak indicator: "12-day commit streak" | Pure motivation flex but a single number is read instantly and visitors *do* notice it | LOW | Compute server-side from the same calendar data. Show both current and longest. Display in tile alongside Tokscale metrics. |
| Tokscale tiles: rank, total tokens, current/longest streak, cost | Niche but specific to this audience; signals "I actually use AI tools at scale" rather than just claiming it | MEDIUM (API research → scrape fallback) | Treat as 4-6 small tiles. Each tile: tiny label, big number, optional sparkline. Refresh hourly via ISR or build-time. **If Tokscale has no public API**, scrape with a daily cron → snapshot to a small JSON in the repo (or Mongo). Don't poll on every request. |
| RSS subscriber count near `/blog` header | Honest signal of audience; uses existing scaffolding | LOW-MEDIUM | **Implementation reality:** RSS subscriber counts are unmeasurable directly — RSS clients don't phone home reliably. Two real options: (a) parse User-Agent logs from `/blog/feed.xml` requests and dedupe by `agent + IP /24` over 7 days (FeedBurner-style estimation), or (b) skip the absolute count and show "X feed reader hits/week" instead. **Recommendation:** hide entirely until ≥100 unique-feed-reader fingerprints/week (small numbers feel sad and signal low traffic). If below threshold, replace with a copyable RSS URL + a "Subscribe in your reader" link. |
| Live presence ticker embedded inside `/stats` | The presence widget already exists site-wide; placing it in /stats unifies "things happening right now" | LOW | Reuse the existing `PresenceStatus` component. Just import. |
| Subdued intro animation on /stats | Page tone should be "honest dashboard," not "marketing landing." Reuse only the section reveal pattern, not the cinematic Header intro | LOW | Drop the Header intro entirely on /stats. Use the standard `Section` wrapper with its default fade-in. Body class `intro-locked` must never apply to /stats. |

### Anti-features (avoid even though templates love them)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| GitHub-themed badges card (shields.io style) | Easy to add, instantly "looks like a dev site" | Visual noise, breaks the typographic system, every dev site has them, doesn't communicate anything specific | Skip entirely. The pinned repo cards already communicate "I code." |
| Lines-of-code or "wakatime"-style time-tracked stats | Feels like effort, popular in dev README art | Wakatime time = time editor open, not time productive. Easy to inflate, easy to spot inflation. Reads as braggy and inaccurate. | Tokscale stats already do this honestly (real spend) — they're enough. |
| GitHub commit message scroller / activity feed | Looks dynamic | Mostly low-quality commit messages ("fix typo", "wip"); reveals sausage-making rather than substance | The heatmap already shows activity. Don't show the words. |
| Top languages pie chart (GitHub Readme Stats style) | Standard generator output | Counts bytes — biased toward HTML/CSS-heavy projects; misleads about actual focus | Pinned repos with language dot already convey this with context. |
| "Total stars across all repos" megablock | Easy to compute | Stars are vanity. NN/G's vanity-metrics writeup [^nng-vanity] is explicit: a raw number without context = signal of vanity. | If you must show stars, attach them to specific pinned repos so the number ties to a thing. |
| Animated count-up numbers on first scroll | Looks "designed" | Slows time-to-information, every agency template does it, breaks reduced-motion expectations | Render the final number on first paint. |
| Embedded GitHub calendar iframe (e.g., `ghchart.rshah.org`) | Quickest implementation | External-image dependency, can't theme, no tooltip control, breaks `next/image` CSP | Render your own SVG/grid from the GraphQL response. |
| /stats nav link in primary nav | Discoverability | Pollutes the main nav (already 7 items). Stats is a "go deeper if curious" destination | Footer link + small homepage teaser callout (see Homepage placement below). |

### `/now` page — structure recommendation

Reference: [Derek Sivers' /now page][^sivers-now] (the canonical example).

| Section | Tone | Length |
|---------|------|--------|
| Header: "What I'm doing now" + last-updated date + location | Conversational | 1 line |
| **Working on** | Concrete: what code/clients fill the calendar this month | 2-4 lines |
| **Learning** | What I'm actively studying / reading | 1-3 lines |
| **Side projects** | Background work, not client-paid | 2-3 bullets |
| **Life** (optional) | One sentence — keeps it human, doesn't overshare | 1-2 lines |

**Length:** ~250-400 words total. Sivers' own page is ~400.
**Update frequency:** "When something material changes" — typically every 1-3 months. Stamp the date prominently so visitors can judge freshness.
**Anti-pattern:** Don't list every meal / vacation / mood. The /now convention is explicit: "what you'd tell a friend you hadn't seen in a year," not a microblog.

### Homepage placement of new integration data

| Approach | Verdict |
|----------|---------|
| Full GitHub heatmap on homepage | Avoid — competes with the cinematic Header intro, doubles the homepage's vertical height, dilutes "I'm a person" with "I'm a dashboard" |
| **Small teaser callouts that link to /stats** | **Recommended** — e.g., one inline line "12-day commit streak • 47 repos pinned → /stats" between Experience and Education, plus a tile in the footer. Keeps homepage focused on the CV story. |
| No homepage signal at all | Avoid — visitors won't discover /stats |

### /stats layout — recommended order

Reasoning: present in **descending immediacy** — the most "live" thing first.

1. **Heading + last-updated timestamp** ("Updated 5 minutes ago")
2. **GitHub heatmap** (full-bleed, ~840px wide on desktop, year selector if shipped)
3. **Tile grid** — 4-6 small tiles in a 2-3 column grid: current streak, longest streak, Tokscale rank, total tokens, total cost, RSS readers (if above threshold)
4. **Pinned repos** — 3×2 grid of cards
5. **Live presence** — embedded `PresenceStatus` component, small footprint
6. **Footer note** — "Data sources: GitHub GraphQL API, Tokscale. Refreshes hourly."

---

## Phase 8 — Freelance Offering Feature Landscape

This is a **personal site freelance page**, not an agency landing page. The bar for trust signals is lower (visitors already know who Zach is from the rest of the site) but the bar for tone is higher (must feel personal, not marketing).

### Table Stakes (visitors expect these on any /freelance page)

| Feature | Why Expected | Complexity | Notes |
|---------|--------------|------------|-------|
| Single H1 + positioning subhead + primary CTA | Standard hero pattern; visitors need to know in 3 seconds whether to keep scrolling | LOW | See "Hero headline" section below for tone references. |
| Visible pricing (not "contact for quote") | A site that hides prices signals "we charge whatever we can extract." Visible pricing builds trust *and* filters tyre-kickers. Linear, Plain, Vercel all show prices upfront. | LOW | "From £X" framing for fixed packages so visitors don't anchor on the minimum as the maximum. |
| 3-4 service tiers with clear deliverables | Power of three; anything more is decision fatigue | LOW | Use the 4 tiers from the milestone brief: Starter £750, Standard £1,800, Pro £3,500+, AI Integration £1,500+. **But** — 4 may be one too many; see anchoring discussion below. |
| Cal.com booking CTA | Replaces "contact form" friction with a real booking | LOW | Just a link, no embed (perf). Add a GA event on click. |
| Email + contact form fallback | Not every visitor wants to book a call | LOW | Reuse existing Formspree contact section — link to it from /freelance. |
| Areas covered (UK + Berkshire towns) | Local SEO signal + filters out-of-region inquiries | LOW | Short flat list. See "Areas covered" section below. |
| `Service` schema (JSON-LD) | Required by milestone brief; helps Google's Service-card rich result | LOW | `@type: Service`, `provider: {@type: Person}`, `areaServed: {@type: AdministrativeArea, name: "Berkshire"}`, `offers: [...]` mapping to pricing tiers. |
| Robots.txt review for AI bots | Required by milestone brief | LOW | Allow GPTBot / ClaudeBot for /freelance specifically (you want LLMs to know you're available) but check current robots.txt for conflicts. |
| "Available for work" homepage callout when `freelance.available: true` | Required by milestone brief | LOW | See dedicated section below. |

### Differentiators (this is what makes a personal freelance page beat an agency page)

| Feature | Value Proposition | Complexity | Notes |
|---------|-------------------|------------|-------|
| **"What I don't do" list** | The single highest-trust signal on a freelance page. Says "I've thought about my niche, I'm not going to waste your money pretending I'm great at X." Vastly more credible than the typical agency "we do everything" list. | LOW | See dedicated section below. |
| **"How it works" 4-step explainer** | Demystifies the process; pre-answers "how does this even start?" objection | LOW | See dedicated section below. |
| Plain-English tier descriptions | Most pricing pages list features as bullets; describing the work in plain sentences ("a 1-page brochure site with a contact form, deployed on your domain") converts better for non-technical buyers | LOW | One paragraph per tier in addition to a 3-4 bullet feature list. |
| `/freelance.md` machine-readable version | Required by milestone brief; specifically targets LLM-driven discovery (ChatGPT browse, Perplexity, Claude) | LOW | Pure markdown at `/freelance.md` (Next.js can serve this via a Route Handler returning `text/markdown`). Same pricing + services + email but stripped of layout. |
| Honest turnaround estimates | "2-3 weeks for Starter, 4-6 weeks for Standard" — most agencies refuse to commit | LOW | Per-tier line. Don't promise speed you can't deliver. |
| One client logo or testimonial line | Already have real clients (Thatched Tavern, Chertsey Show, Blueview Group) named in CV — naming them on /freelance reinforces social proof without "testimonials" overhead | LOW | Single inline line: "Past work includes The Thatched Tavern, The Chertsey Show, Blueview Group." No card grid. (Per milestone brief: full testimonials/case studies cut.) |

### Anti-features (avoid even though agency-template instincts push for them)

| Feature | Why Requested | Why Problematic | Alternative |
|---------|---------------|-----------------|-------------|
| FAQ accordion | Standard agency-page filler | Brief explicitly cuts it. FAQ is where pages put answers they should have made obvious in the actual content. | Make the answers obvious in the pricing tiers + "How it works" + "What I don't do" instead. |
| Testimonials carousel | "Build trust" | Brief explicitly cuts it (no real testimonials yet — mocking is worse than nothing). Carousels rotate past content faster than visitors read it. | Inline named-client line (see Differentiators). |
| `LocalBusiness` schema | Local SEO | Brief explicitly cuts it. `LocalBusiness` implies physical premises; this is a remote/hybrid freelancer. `Service` + `Person` is the correct shape. | Use `@type: Service` + `areaServed`. |
| Mocked case studies | Common when starting out | Brief explicitly cuts it. Reads as fake to anyone savvy; legal grey area for client confidentiality. | Single named-client line. Add real case studies later only with client permission. |
| Programmatic town pages ("Freelance developer Bracknell" / "…Reading" / "…Newbury") | Local SEO ranking | Brief explicitly cuts it. Reads as spam, dilutes brand. The "Areas I cover" list captures the local-SEO benefit without the spam optics. | One flat bullet list of towns. |
| Embedded Cal.com inline widget | "Frictionless booking" | Adds ~150 KB of JS, breaks intro animation timing, hurts CLS, requires consent for analytics cookies | Just link to the Cal.com page — opens in same tab, returns to /freelance via browser back. |
| Animated count-up of "happy clients" / "projects delivered" | Marketing template default | Vanity metrics with no context; can't be verified; "127 happy clients" reads as fabricated | Skip entirely. |
| Live chat widget (Intercom, Crisp, etc.) | "Conversion optimisation" | Heavy JS, breaks page weight budget, requires monitoring you won't do, expectation-violating for a one-person site | Cal.com call link is the chat channel. |
| Stock photography of "team meetings" | Agency template instinct | Obviously fake on a personal site; contradicts the "I'm one person" positioning that's the whole value prop | No photos other than the existing site identity assets. |
| Multiple CTAs (book / get quote / start project / email) | "More paths to conversion" | Decision paralysis; visitors do nothing | One primary CTA (Cal.com link) repeated at hero, mid-page, and footer. Email link as secondary. |
| Toll-free phone number / live phone line | UK B2B convention | You will not answer it reliably; voicemail kills trust | Email + Cal.com only. |
| Newsletter signup on /freelance | Easy capture | Wrong audience — visitors here want to hire, not read essays | Newsletter signup belongs on /blog. |

### Hero headline pattern — tone reference

**Reference H1s from the milestone-named sites:**
- Linear (current homepage): "The product development system for teams and agents" [^linear-home]
- Plain.com: "Build support your way" [^plain-home]
- Vercel: "Your complete platform for the web" (historical) / Variants on the theme of "the platform for X"

**Pattern:** 5-10 word direct outcome statement; no marketing adjectives; subhead does the work of explaining the "for whom".

**Recommended H1 patterns for /freelance** (pick one — DO NOT use buzzwords like "innovative", "cutting-edge", "transform"):

1. "Web development that ships." — short, blunt, true to current voice
2. "Custom websites and AI integrations for small businesses." — direct, names the audience
3. "Freelance web dev for businesses that need it done properly." — opinionated, slightly anti-corporate

**Recommended subhead pattern:**
"From £750. Based in Ascot, Berkshire — working with clients across the UK. Cal.com link below to book a free 30-minute call."

Single primary CTA button text: **"Book a 30-min call"** (specific is better than "Get started"). Secondary text link: "Or email zach@zachlagden.uk".

### Pricing table — anchor + highlight strategy

**Tier counts:** SaaS conventional wisdom says 3 tiers is the sweet spot [^pricing-2026]; 4 is workable but pushes decision fatigue. The milestone brief's 4 tiers — Starter, Standard, Pro, AI Integration — actually splits into **3 service tiers + 1 add-on**, which is fine if presented that way:

```
[Starter £750]   [Standard £1,800]   [Pro £3,500+]      ← 3-tier row
                                                          
[+ AI Integration £1,500+ — add to any tier]           ← separate add-on row
```

**Anchoring:** Pro at £3,500+ anchors high → makes Standard at £1,800 feel like the value pick. The `+` is doing important work here: it signals "this is the floor, real projects cost more" without pricing yourself out by stating a ceiling.

**Highlight:** Mark **Standard** as "Most popular" (visual emphasis: subtle border tint, no shouty badge). 2025 UX research [^pricing-2026] shows pages without a highlighted tier convert ~22% worse — but on a personal site, "Most popular" feels less manipulative than "Recommended" or "Best value." If the data isn't real (you haven't sold enough Standard packages to call it "most popular"), use **"Best fit for most"** or skip the highlight entirely. Don't lie.

**"From £" framing:** Use it consistently. `From £750` for Starter, `From £1,800` for Standard, `From £3,500` for Pro, `From £1,500` for AI Integration. Signals the floor without committing to a ceiling.

**Tier card structure:**

```
┌────────────────────────────┐
│ Starter            From £750│
│ A simple website, done well │
│                             │
│ • 1-3 pages                 │
│ • Custom design             │
│ • Contact form              │
│ • Deployed on your domain   │
│ • 2-3 week turnaround       │
│                             │
│ [Book a call →]             │
└────────────────────────────┘
```

**CTAs:** Per-tier CTAs (each card has "Book a call →") **plus** a single big CTA at the bottom of the section. Per-tier CTAs deep-link to the same Cal.com URL with a `?utm_content={tier}` parameter so you can see which tier drove the booking in GA.

**Mobile:** Stack vertically with Standard first (the recommended tier should appear first on mobile per 2026 best practice [^pricing-2026]).

### "What I don't do" list — framing

This is the differentiator. It's also the trust-builder. Treat it carefully.

**Position on page:** After pricing tiers, before "How it works." Reasoning: visitors see the tiers, get hyped, then this list either confirms "yes, you're my person" or disqualifies them cleanly. Cleaner disqualification = fewer bad-fit calls = more revenue per booked call.

**Format:** 4-6 bullets, each with a one-line rationale, lowercase imperative. Style reference: the GitHub README "What this isn't" pattern.

**Tone:** Confident but not snarky. "Don't do X" is fine; "Will not under any circumstances X" reads insecure.

**Suggested content** (Zach should validate):

- **No WordPress builds.** I work in Next.js / modern stacks. If you specifically need WordPress, I'm not the right call.
- **No SEO retainers or 6-month content packages.** I build the thing; ongoing marketing isn't my zone.
- **No emergency 24/7 support contracts.** I respond within 2 business days. If you need an on-call, you need an agency.
- **No design-only work.** I build and design together; pure design briefs go to a specialist.
- **No <£500 projects.** Briefs below this are usually undersized — better fit for a no-code tool.
- **No equity-for-build deals.** Cash only.

**Anti-pattern:** Don't make the list ironic / jokey ("I don't do Comic Sans"). Visitors are filtering — be useful, not cute.

### "How it works" 4-step explainer

**Step count:** 4 is fine; the milestone brief's 4-step process (Book call → Quote → Build → Launch) maps cleanly to client expectations. 3 steps would compress; 5+ overcommits. Search results on "3 vs 4 steps optimal" don't show a clear winner [^cro-steps] — pick 4 because it matches the natural process.

**Format:** Numbered cards in a horizontal row on desktop, stacked on mobile.

```
[1] Book a call          [2] I send a quote      [3] I build it           [4] You launch
30 min, free, no          Within 48 hrs.          Weekly updates.          Final review, deploy,
prep needed. We talk      Fixed price, plain      You see progress on      handover docs. I'm
through what you need.    English, no surprises.  a staging URL.           around for 30 days
                                                                          to fix anything.
```

**Numbered cards vs flow diagram:** Numbered cards. Flow diagrams (with arrows between steps) add visual complexity for zero comprehension gain at 4 steps. The numbers `[1] [2] [3] [4]` carry the sequence.

**Position on page:** After "What I don't do," before final CTA. Order rationale:

1. Hero — "Yes I'm available"
2. Services + Pricing — "Here's what it costs"
3. What I don't do — "Here's whether we're a fit"
4. How it works — "Here's what happens next"
5. Areas I cover — "Here's whether I serve your region"
6. Past work line — "Here's proof"
7. Final CTA — "Book the call"

### "Available for freelance" toggle — homepage callout UX

Driven by `personal.freelance.available: boolean` in `content.json`.

| State | Homepage Treatment |
|-------|-------------------|
| `true` | Small inline banner near the hero or between About and Experience: "Currently available for freelance — [Book a 30-min call →](https://cal.com/...)". Plus a subtle green status dot animation (matches the existing presence ticker dot pattern — visual consistency). |
| `false` | **Hide the banner entirely.** Do not flip to "Currently booked" or "Join waitlist" — this is a personal site, not an agency. A "waitlist" implies more demand than there is and looks contrived. Just remove the callout. The /freelance page itself stays accessible (don't 404 it) but the hero copy on /freelance should change to "Currently booked through [month]. Email me to discuss future work." — set via a second flag if needed, or just edit copy when toggling. |

**Anti-pattern:** Don't put the availability state in the main nav (e.g., "Freelance (Available)" / "Freelance (Booked)"). Nav labels should be stable. Toggle visibility, not phrasing.

### Cal.com CTA placement

Decided in the milestone brief: **link only, no embed.** Performance + consistency reasons.

**Placement on /freelance:**

1. Hero — primary CTA button
2. Per-tier — "Book a call" on each pricing card
3. End of "How it works" — repeated CTA
4. Final block — repeated CTA + secondary email link

Same Cal.com URL across all of them, distinguished only by `utm_content` parameter for tracking.

**Tracking:** Fire a GA event `freelance_cta_click` with `{location: 'hero' | 'tier_starter' | 'tier_standard' | ...}`. Already have GA wired site-wide.

### Areas I cover — list pattern

**Format:** Single short flat list. Position: after "How it works", before the final CTA.

```
Areas I cover

Based in Ascot, Berkshire. Working with clients across:

Ascot · Bracknell · Crowthorne · Maidenhead · Newbury · Reading · Sandhurst ·
Slough · Wokingham · Windsor · Sunningdale

— and UK-wide remotely.
```

Berkshire town list cross-checked against existing freelance SEO pages serving the region [^seo-berkshire]. Eleven towns is enough — adding 20+ starts to look like local-SEO keyword stuffing.

**Anti-pattern:** No interactive map. No "Click your town for a custom quote" links (those are programmatic town pages, which the brief cuts). One flat list. UK-wide line at the bottom.

---

## Feature Dependencies

```
[GitHub heatmap]
    └──requires──> [GitHub PAT env var (read:user scope)]
                       └──requires──> [Phase 5 env config]

[GitHub pinned repos]
    └──requires──> [GitHub PAT env var]                            (same as above)
    └──requires──> [linguist-colors data vendored or npm dep]

[Tokscale tiles]
    └──requires──> [Tokscale API research → scrape fallback decision]
    └──requires──> [Caching layer (ISR or daily cron + JSON snapshot)]

[Streak indicator] ──derives-from──> [GitHub heatmap data]

[/stats page] ──aggregates──> [heatmap + tiles + repos + presence + RSS]

[Server-computed age]
    └──requires──> [personal.birthday field in content.json]
    └──requires──> [src/types/content.ts schema update]

[/freelance page]
    └──requires──> [personal.freelance config block in content.json]
                       (.available, .pricing tiers, .calComUrl, .areasCovered)
    └──requires──> [Service JSON-LD schema in metadata]

[Homepage "Available for freelance" callout]
    └──requires──> [personal.freelance.available flag]
    └──requires──> [Cal.com URL configured]

[/freelance.md machine-readable]
    └──requires──> [/freelance page content authored]
    (same content surface, different format)

[Robots.txt AI-bot audit]
    └──requires──> [/freelance page exists]
                       (need to know what to allow/disallow)
```

### Dependency notes

- **GitHub PAT scope is the gating dependency for Phase 7.** Both the heatmap and pinned repos hit GraphQL; both want `read:user`. If the PAT is provisioned with only `public_repo`, the private-contributions toggle won't work. Resolve this in Phase 5 env config (already in scope).
- **Tokscale API availability is the unknown.** Plan A: official API. Plan B: scrape the dashboard with a daily GitHub Actions cron and commit a `stats.json` snapshot. Plan C: hardcode the most recent screenshot stats and label as "last updated [date]". The /stats page should ship even if Tokscale falls through — don't gate the whole page on one widget.
- **`/freelance.md` mirrors `/freelance` content.** Keep them in sync; either author both manually each update, or generate the `.md` from a shared content source (a `freelance.json` in `public/` or a TypeScript module that both renders the page and emits the markdown at build time).
- **The age computation has zero runtime dependencies** other than `personal.birthday` being present. Compute in `serverContentLoader` so it's available on first paint.

---

## MVP Definition

### Launch with Phase 7 (Integrations + /stats)

- [x] GitHub contribution heatmap (canonical 5-bucket colour scale, light + dark mode, tooltip, weekday/month axes)
- [x] Pinned repos grid (6 cards, language dot, stars/forks)
- [x] `/now` page (static, 250-400 words, last-updated stamp)
- [x] `/stats` page assembling heatmap + tiles + pinned + presence
- [x] Streak indicator (current + longest) — falls out of heatmap data for free
- [x] Homepage teaser callout linking to /stats
- [ ] Tokscale tiles — ship if API/scrape works in Phase 7 timebox; defer if blocked
- [ ] RSS subscriber count — ship **only** if threshold reached; otherwise hide

### Launch with Phase 8 (Freelance)

- [x] /freelance page with hero, 3+1 pricing tiers, "What I don't do," "How it works," "Areas covered," past-work line, final CTA
- [x] Cal.com link CTA (4 placements, all UTM-tagged)
- [x] Homepage "Available for freelance" callout (toggle via content.json flag)
- [x] `Service` JSON-LD schema
- [x] `/freelance.md` machine-readable version
- [x] Robots.txt AI-bot audit (allow GPTBot/ClaudeBot, document in env runbook)

### Defer (out of scope per milestone brief)

- FAQ section
- Testimonials / case studies (until real ones approved by clients)
- `LocalBusiness` schema
- Programmatic per-town pages
- Cal.com inline embed
- Live chat
- Newsletter signup on /freelance

---

## Feature Prioritization Matrix

| Feature | User Value | Implementation Cost | Priority |
|---------|------------|---------------------|----------|
| Server-computed age | LOW | LOW | P1 (Phase 6, blocks "stale 18yo" copy issue) |
| GitHub heatmap | HIGH | MEDIUM | P1 |
| Pinned repos grid | HIGH | LOW | P1 |
| `/now` page | MEDIUM | LOW | P1 (free win; conventional) |
| `/stats` page composition | HIGH | LOW (mostly layout) | P1 |
| Streak indicator | MEDIUM | LOW | P1 (data is free) |
| Homepage /stats teaser | MEDIUM | LOW | P1 |
| Tokscale tiles | MEDIUM | MEDIUM-HIGH (API unknown) | P2 (defer if API blocked) |
| RSS subscriber count | LOW | MEDIUM (fingerprinting) | P3 (hide until threshold) |
| /freelance hero + tiers | HIGH | LOW | P1 |
| "What I don't do" | HIGH (trust signal) | LOW | P1 (do not cut) |
| "How it works" | HIGH | LOW | P1 |
| Areas covered list | MEDIUM | LOW | P1 |
| `Service` JSON-LD | MEDIUM (SEO) | LOW | P1 |
| /freelance.md | MEDIUM (LLM discovery) | LOW | P1 |
| Robots.txt AI audit | MEDIUM | LOW | P1 |
| Homepage availability callout | HIGH | LOW | P1 |
| Cal.com inline embed | LOW (already linked) | MEDIUM (perf cost) | OUT |
| FAQ accordion | LOW | LOW | OUT (per brief) |
| Testimonials | MEDIUM | MEDIUM (need client approval) | OUT (per brief) |

---

## Competitor / Reference Feature Analysis

Personal-site references, NOT agency. Three closest analogues:

| Feature | Pieter Levels (levels.io) | Lee Robinson (leerob.com) | Josh Comeau (joshwcomeau.com) | Our Approach |
|---------|---------------------------|---------------------------|-------------------------------|--------------|
| Stats / numbers | Open transparent revenue + projects on homepage | `/stats` analytics dashboard — visitor stats, GitHub, music | No public stats page | `/stats` page with heatmap + Tokscale + pinned repos + presence |
| /now equivalent | Yes, `/now` linked from nav | No explicit /now, but uptime/status-style live updates | "Currently" section in About | Standalone `/now` per Sivers convention |
| Freelance / hire CTA | "Hire me" inline on homepage | Not available — at Vercel | Not freelance — courses/products | Dedicated /freelance page + homepage toggle callout |
| Pricing visibility | Per-project transparent prices | N/A | Course prices visible | 3 tiers + 1 add-on, "From £X" framing |
| Tone | Direct, blunt, no marketing | Calm, technical, considered | Warm, friendly, opinionated | Match Linear/Vercel/Plain reference — direct, not buzzword-y |
| Heatmap | None | Yes (GitHub heatmap) | None | Yes — GitHub canonical 5-bucket |

**Key insight:** None of these three sites do an "agency landing page." All three lean into "this is a person, here's what they're doing." That's the target tone for /freelance.

---

## Confidence Assessment per Recommendation

| Recommendation | Confidence | Basis |
|---------------|------------|-------|
| GitHub heatmap canonical 5-bucket colours | HIGH | GitHub's own values are public-known constants; widely-replicated in shadcn heatmap, react-activity-heatmap [^heatmap-libs] |
| GitHub GraphQL `contributionsCollection` endpoint | HIGH | Official GitHub API, well-documented, used by github-readme-stats |
| Linguist-colors source | HIGH | github/linguist `languages.yml` is the canonical source [^linguist] |
| Pricing 3-tier sweet spot + highlight middle | HIGH | Multiple 2026 UX studies converge [^pricing-2026] |
| `/now` convention structure | HIGH | Derek Sivers' own definition is the convention [^sivers-now] |
| "What I don't do" list as differentiator | MEDIUM | No quantitative study found; pattern-recognised from indie-hacker freelance pages but not benchmarked |
| Linear/Plain headline pattern | HIGH | Direct WebFetch of both homepages confirmed |
| 4-step "How it works" optimum | MEDIUM | No clear quantitative winner over 3 steps; choice is editorial fit-to-process |
| Hide RSS count until threshold | MEDIUM | Mirrors received wisdom in early-blog SEO writeups; flags small numbers as "anti-signal" [^rss-display] |
| `Service` not `LocalBusiness` schema | HIGH | Schema.org docs; `LocalBusiness` requires physical premises |
| Reduce 4 tiers to 3+1 visual layout | MEDIUM | Editorial recommendation based on power-of-three heuristic + the AI Integration tier being conceptually an add-on |

---

## Open Questions for Phase 7 / 8 Planners

1. **Tokscale API status** — Unknown whether they offer a public API. Phase 7 planner should spike this first; if API exists, ~LOW complexity; if scrape, MEDIUM; if hardcoded snapshot, LOW but stale.
2. **GitHub PAT scope on Coolify** — Confirm existing PAT (if any) has `read:user`. Confirm Public profile → "Include private contributions" is enabled on Zach's GitHub account.
3. **Cal.com account exists?** — `personal.freelance.calComUrl` will be needed in content.json. Phase 8 planner needs the live URL.
4. **Past-work line — clear with clients?** — Naming Thatched Tavern / Chertsey Show / Blueview Group on /freelance is fine if they're already named in the CV section, but worth a sanity check.
5. **"Available" status — who toggles it?** — A boolean in `content.json` requires a git commit. Acceptable for a personal site (low frequency). If higher cadence is wanted, push to a small Mongo doc readable by `loadContent`. Default assumption: git-committed toggle is fine.
6. **`/freelance.md` generation strategy** — Generate from a shared source at build time, or author by hand? Recommend shared source: a `src/content/freelance.ts` module that both `app/freelance/page.tsx` renders and `app/freelance.md/route.ts` serves.

---

## Sources

[^nng-vanity]: NN/g — Vanity Metrics: Add Context to Add Meaning. https://www.nngroup.com/articles/vanity-metrics/
[^sivers-now]: Derek Sivers — /now page convention. https://sive.rs/now and https://sive.rs/nowff
[^linear-home]: Linear homepage (WebFetched 2026-05-12). https://linear.app
[^plain-home]: Plain.com homepage (WebFetched 2026-05-12). https://plain.com
[^pricing-2026]: InfluenceFlow / PipelineRoad / DesignStudio 2026 SaaS pricing best-practice writeups. https://influenceflow.io/resources/saas-pricing-page-best-practices-a-complete-2026-guide/ , https://pipelineroad.com/agency/blog/saas-pricing-page-best-practices , https://www.designstudiouiux.com/blog/saas-pricing-page-design-best-practices/
[^cro-steps]: Mixed results on 3 vs 4 steps; no clear winner. https://www.rickwhittington.com/blog/four-steps-conversion-rate-optimization-process , https://conversionwise.com/blog/the-ultimate-guide-to-conversion-design-conversionwise/
[^seo-berkshire]: Existing freelance SEO sites covering Berkshire towns. https://seoallardice.com/seo-berkshire/ , https://www.seolondonsurrey.co.uk/freelance-seo-services-in-hampshire-and-berkshire
[^heatmap-libs]: Shadcn calendar heatmap and react-activity-heatmap reference implementations. https://allshadcn.com/tools/calendar-heatmap/ , https://github.com/stefan5441/react-activity-heatmap
[^linguist]: GitHub Linguist canonical language colour source. https://github.com/github/linguist (languages.yml) ; JS wrappers: https://www.npmjs.com/package/github-language-colors , https://github.com/simonecorsi/github-languages-colors
[^rss-display]: When to display RSS subscriber counts (small numbers signal weakness). https://robbsutton.com/when-should-i-display-my-rss-feed-subscription-count-stat-button/ , https://darekkay.com/blog/rss-subscriber-count/
[^vercel-aesthetic]: Vercel/Linear-style direct hero pattern study. https://evilmartians.com/chronicles/we-studied-100-devtool-landing-pages-here-is-what-actually-works-in-2025 , https://www.setproduct.com/blog/complete-guide-to-blueprint-grid-design

---

*Feature research for: zachlagden.uk v2.0 (Phases 6, 7, 8 only)*
*Researched: 2026-05-12*
