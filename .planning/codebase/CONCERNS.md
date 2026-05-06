# Codebase Concerns

**Analysis Date:** 2026-05-06

This codebase is mid-flight on a major refactor. A blog/CMS feature (MongoDB + NextAuth + admin UI) has been bolted onto what was previously a static portfolio, Sentry has been ripped out, and a cinematic intro animation was recently added. Almost every `src/` file is modified but uncommitted. Build technically passes; runtime behaviour has multiple gaps. TypeScript and ESLint are clean.

The findings below are ordered roughly by severity. Many are interrelated — fixing the MongoDB-down crash also fixes the build noise, etc.

---

## HIGH severity

### 1. `BlogEditor` calls `setState` during render — infinite re-render hazard

**Severity:** HIGH
**Category:** bug
**Files:** `src/components/admin/BlogEditor.tsx` (lines 66-70)

```tsx
const derivedSlug =
  autoSlug && state.title ? slugify(state.title) : state.slug;
if (derivedSlug !== state.slug) {
  setState((prev) => ({ ...prev, slug: derivedSlug }));
}
```

This is a `setState` call in the render body, gated only by a value comparison. React will:
1. Render with `state.slug = ""`
2. Compute `derivedSlug = "my-title"`
3. `setState` schedules a re-render
4. Render again — new `state.slug = "my-title"` matches, exits

That's "fine" in the steady state but: any time `state.title` changes while `autoSlug=true` AND the slug somehow lags (e.g. controlled-form rehydration, autosave restore), you get an extra render pass. React 18 dev mode will throw `"Cannot update a component while rendering a different component"` warnings. Under StrictMode this also double-fires. Real risk of an infinite loop if `slugify` ever returns something different on subsequent calls (it doesn't today, but it's a footgun).

**Fix:** Move slug derivation into `onChange` handler for the title input, or compute it lazily as `derivedSlug` and read from that for both display and submission — never write back to state.

---

### 2. Production build crashes static generation when MongoDB is unreachable

**Severity:** HIGH
**Category:** broken integration / config drift
**Files:** `src/app/sitemap.ts`, `src/app/blog/feed.xml/route.ts`, `src/app/blog/page.tsx`, `src/app/page.tsx` (line 11)

`pnpm build` "succeeds" (exit code 0, all 16 static pages generate) but the build log is flooded with `MongoServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`. The errors come from:

- `src/app/sitemap.ts:11` — `getAllPublishedSlugs()` is wrapped in try/catch, so this is benign but still floods logs.
- `src/app/blog/feed.xml/route.ts` — `getPublishedPosts(1, 20)` is **not** wrapped, will 500 in prod when Mongo flaps.
- `src/app/blog/page.tsx:21-24` — `Promise.all([getPublishedPosts, getAllTags])` is **not** wrapped, will 500.
- `src/app/page.tsx:11` — `getLatestPosts(3)` IS wrapped but the page re-renders the BlogSection with empty array, which is fine.

Also note `src/lib/auth.ts:14-20` swallows MongoDB errors silently and falls back to no adapter, which means JWT-only sessions silently — and any DB-backed account linking won't work.

**Why it's a concern:** The build environment in CI/Coolify likely doesn't have MongoDB on `127.0.0.1:27017`. Either the build needs an env-var-aware fallback, or these routes need `export const dynamic = "force-dynamic"` to defer DB access to request time. As written, the first prod build with no DB access will look successful but render 500s for `/blog`, `/blog/feed.xml`.

**Fix:** Wrap all blog DB queries in route handlers/pages with try/catch + sensible fallback (empty list, 503, etc.), and/or add `export const dynamic = "force-dynamic"` to `/blog/page.tsx` and `/blog/feed.xml/route.ts` so they don't run at build time.

---

### 3. Markdown renderer pipeline order allows raw HTML through sanitizer

**Severity:** HIGH
**Category:** security
**Files:** `src/components/blog/MarkdownRenderer.tsx` (line 172)

```tsx
rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
```

`rehypeRaw` parses raw HTML inside markdown into the rehype tree, then `rehypeSanitize` strips disallowed nodes — that ordering IS correct (sanitize must come after raw). HOWEVER `rehypeSanitize` is invoked with the **default schema**, which permits `<a href="javascript:...">` only if href passes default URL handling, but more importantly does not restrict `target` / `rel` attributes added via raw HTML. The bigger issue: this pipeline runs on user-controlled blog post content. The admin user is the sole author today (gated by `ADMIN_GITHUB_USERNAME`), so the practical risk is low — but the moment a second author is added, any admin can XSS site visitors through raw `<script>` patterns the sanitizer's default schema doesn't fully cover (e.g. `<svg onload=…>` is stripped by default, but custom data attributes injecting via React hydration are not the threat model rehype-sanitize protects against).

**Fix:** Pass an explicit schema to `rehypeSanitize` based on `defaultSchema` from `hast-util-sanitize`, with an allowlist of tags/attrs your content actually needs. Until then, document that blog content authoring is treated as trusted-admin-only.

---

### 4. No error boundary anywhere — `global-error.tsx` was deleted but not replaced

**Severity:** HIGH
**Category:** broken integration / half-finished feature
**Files:** `src/app/global-error.tsx` (deleted, uncommitted), `src/app/error.tsx` (does not exist)

`git status` shows `D src/app/global-error.tsx`. There is no `error.tsx` or replacement boundary. In Next.js 16 App Router, without an `error.tsx` at any level, runtime errors in client components propagate to Next's built-in fallback (white screen with stack trace in dev, generic "Application error" in prod). For a public-facing portfolio this is a poor UX, and worse — if any of the new client components throw (e.g. `BlogPostCard` getting a malformed date, `Header` measurement failing), the entire app unmounts.

The Sentry deletions (`instrumentation-client.ts`, `sentry.edge.config.ts`, `sentry.server.config.ts`, `src/instrumentation.ts`) compound this: there is now zero error reporting. A user-visible crash will not be reported anywhere.

**Fix:** Add an `src/app/error.tsx` (root error boundary for the route group) and a `src/app/global-error.tsx` (catches errors in the root layout). Decide whether Sentry stays out — if so, replace with at minimum `console.error` reporting wired into the boundaries.

---

### 5. README is severely out of date — claims "no env vars required"

**Severity:** HIGH
**Category:** config drift / tech debt
**Files:** `README.md` (line 165), `.env.example`

README says:
> 🛡️ Environment Variables
> No specific environment variables are required to run the application.

In reality `.env.example` lists `MONGODB_URI`, `AUTH_SECRET`, `AUTH_GITHUB_ID`, `AUTH_GITHUB_SECRET`, `ADMIN_GITHUB_USERNAME` as **required** — without them, `pnpm dev` will crash on first request to `/blog`, `/admin`, or `/api/auth/*`. README also still mentions Vercel deploy as primary (project deploys via Coolify per global instructions), describes the project as static-only, and lists components that no longer reflect the architecture (no mention of admin/blog/auth).

**Fix:** Rewrite README to match current state: required env vars, MongoDB dependency, GitHub OAuth setup, Coolify deployment, blog/admin features.

---

### 6. `instrumentation-client.ts` deletion may leave Next looking for it

**Severity:** HIGH
**Category:** half-finished feature
**Files:** `instrumentation-client.ts` (deleted), `src/instrumentation.ts` (deleted), `next.config.ts`

Next.js 15+ auto-discovers `instrumentation.ts` and `instrumentation-client.ts` if present. Both are deleted. `next.config.ts` no longer references Sentry — confirmed clean. `package.json` has no `@sentry/*` deps. Dangling Sentry references: only `public/content.json:263` lists Sentry as a *skill*, which is intentional content.

**However** — these deletions are **uncommitted**. Anyone who pulls this state without the deletes (or restores from a stale branch) will see partial Sentry wiring with no SDK installed → ReferenceError at boot. The state needs to be committed and the work finished.

**Fix:** Commit the Sentry removal as a single atomic change, then decide whether to add error reporting back (Sentry per global instructions, or alternative).

---

## MED severity

### 7. Cinematic intro animation has multiple unhandled edge cases

**Severity:** MED
**Category:** bug / animation race condition
**Files:** `src/components/layout/Header.tsx`, `src/app/layout.tsx` (line 134), `src/app/globals.css` (line 229)

Recent commits (`35c2ba7`, `b163055`, `b4bfacb`, `c0eceaf`, `38b2634`) churned the intro sequence. Issues observed reading the current state:

- **Server-rendered `intro-locked` class is unconditional.** `src/app/layout.tsx:134` always adds `intro-locked` to `<body>`. `globals.css:229` sets `overflow: hidden`. If JS fails to load OR if Header never mounts (e.g. on `/auth/signin`, `/admin`, `/blog`), the body stays locked. Mitigation: each non-home route's layout/page renders `<ClearIntro />` (`src/components/ui/ClearIntro.tsx`) or directly removes the class. But this is duplicated at `src/app/admin/layout.tsx:18`, `src/app/blog/layout.tsx:15`, `src/app/auth/signin/page.tsx:9`. Three places to forget.

- **`document.fonts.ready` never resolving.** `src/components/layout/Header.tsx:125` awaits `document.fonts.ready` with no timeout. If the browser stalls (offline font CDN, very old browser without the API), the intro never starts and the body stays locked forever — site is unusable.

- **`requestAnimationFrame` inside an effect that may have unmounted.** `Header.tsx:116-120` schedules `setIntroPhase("done")` inside `rAF` after the wasScrolledOnLoad check. The `cancelled` flag is not checked inside the rAF callback, so if the component unmounts between the check and the frame, you get `setState on unmounted component` warnings.

- **`fallStartScale` measurement race.** `Header.tsx:177-186` measures `largeHeight` from `getBoundingClientRect()` then synchronously clears `fontSize` to read `normalHeight`. Browsers do this synchronously, but the side-effect mutation to `style.fontSize` will trigger a layout reflow that the user could perceive as a flicker on slower devices.

**Fix:** Add a 5s timeout fallback on `document.fonts.ready`. Centralise `intro-locked` removal in a single hook. Check `cancelled` inside the rAF callback. Consider doing the dual-measurement off-screen via a clone.

---

### 8. `PresenceStatus` polls every 5 seconds with no backoff

**Severity:** MED
**Category:** performance / tech debt
**Files:** `src/components/ui/PresenceStatus.tsx` (line 81)

```ts
intervalRef.current = setInterval(fetchData, 5000);
```

5-second polling against `https://api.lagden.dev/v1/watcher/{userId}` runs continuously while the page is open, regardless of whether the tab is visible. After 1 hour idle, that's 720 requests per visitor. If the API is rate-limited or down, errors flood `console.warn`. No exponential backoff, no `document.visibilityState` gating, no reduced-frequency mode.

**Fix:** Increase interval to 30s, pause polling when `document.hidden`, use exponential backoff on consecutive errors (5s → 10s → 30s → 60s → cap at 5min).

---

### 9. `useSectionObserver` recreates IntersectionObserver on every parent render

**Severity:** MED
**Category:** performance bug
**Files:** `src/hooks/useSectionObserver.ts` (line 68), `src/app/HomeClient.tsx` (line 190)

The `sectionRefs` prop is constructed inline as a fresh object literal on every render of `HomeClient` (line 190). `useEffect` depends on `sectionRefs` (line 68), so the observer is torn down and rebuilt on **every** state update in `HomeClient` — and `HomeClient` re-renders on every scroll-progress tick, every section change, every resize. This means `IntersectionObserver` is constantly being created/destroyed, plausibly causing scroll-active-section detection to glitch.

**Fix:** Either memoize the `sectionRefs` object in `HomeClient` with `useMemo`, or have `useSectionObserver` accept individual refs and stabilize them internally. Same pattern should be checked in any other hook that takes a "refs object" prop.

---

### 10. `CustomCursor` scans DOM once at mount, misses dynamically added elements

**Severity:** MED
**Category:** bug
**Files:** `src/components/ui/CustomCursor.tsx` (lines 68-75, 87)

```ts
const interactiveElements = document.querySelectorAll(
  'a, button, [role="button"], input, textarea, select, [tabindex]:not([tabindex="-1"])',
);
interactiveElements.forEach((el) => {
  el.addEventListener("mouseenter", handleMouseEnterInteractive);
  ...
});
```

This snapshots interactive elements at the time the effect runs. The dependency array `[isVisible, prefersReducedMotion, isTouchDevice]` (line 87) means the effect re-fires when `isVisible` toggles — which happens on first mouse enter — so it kind of works for the home page where everything is rendered. But:

- **Dynamic content breaks it.** Blog list pagination, mobile menu open/close, modal forms — newly mounted elements never get the cursor-style listener.
- **Re-running on `isVisible` change re-attaches listeners every time the cursor enters/leaves the viewport.** If the snapshot included 50 elements, you re-add 50 listeners each time, with the cleanup function only removing the previous batch. Net leak: 0 (cleanup is correct), but wasteful churn.

**Fix:** Use event delegation on `document.body` with `e.target.matches(selector)`, or use a `MutationObserver` on `document.body` to track new interactive elements. Drop `isVisible` from the dep array.

---

### 11. `BlogSearch` triggers fetch on initial mount with empty query

**Severity:** MED
**Category:** bug / performance
**Files:** `src/components/blog/BlogSearch.tsx` (lines 17-20)

```tsx
useEffect(() => {
  const timer = setTimeout(() => onSearch(value), 300);
  return () => clearTimeout(timer);
}, [value, onSearch]);
```

On first render `value = ""`. After 300ms, `onSearch("")` fires, which in `BlogListClient.handleSearch` calls `fetchPosts(1, selectedTag, "")` — an unnecessary network request that duplicates the SSR data the page already shipped with. Worse: if the user starts typing within 300ms, the timer is cleared and a new one queued, but the initial `value=""` effect still already scheduled. With React StrictMode in dev, the effect double-fires.

**Fix:** Skip the initial fire — `useRef` to track first mount, or only call `onSearch` if `value !== defaultValue`.

---

### 12. `AnimatedText` is dead code and loads a CDN script for a package already installed

**Severity:** MED
**Category:** dead code / tech debt
**Files:** `src/components/ui/AnimatedText.tsx`

- No file imports `AnimatedText` (verified by grep). It's exported but unused.
- It loads `split-type@0.3.3` from `unpkg.com` at runtime via a `<Script>` tag (line 158).
- `package.json` already declares `split-type@^0.3.4` as a dep — installed but never imported as an ES module.

**Why it's a concern:** Either delete the component and the npm dep, or rewrite to import the npm package directly. Right now you ship 350 lines of unused code AND ~12kB of node_modules for a package nothing uses.

**Fix:** Delete `src/components/ui/AnimatedText.tsx` and remove `split-type` from `package.json`, OR rewrite to use the installed npm package and find a use for it.

---

### 13. Client-side `contentLoader.ts` is dead code

**Severity:** MED
**Category:** dead code
**Files:** `src/utils/contentLoader.ts`

Exports `loadContent`, `getContent`, `formatDate`, `formatDateRange`. Grep shows nothing imports `loadContent` or `getContent`. The `formatDate` / `formatDateRange` exports are also unused (sections build date strings inline). The actual loader used everywhere is `serverContentLoader.ts`.

**Fix:** Delete `src/utils/contentLoader.ts` entirely.

---

### 14. Three layouts duplicate the `intro-locked` removal logic

**Severity:** MED
**Category:** tech debt
**Files:** `src/components/ui/ClearIntro.tsx`, `src/app/admin/layout.tsx:18`, `src/app/blog/layout.tsx:15`, `src/app/auth/signin/page.tsx:9`

`ClearIntro.tsx` is a 12-line client component that removes the `intro-locked` class and hides the loader. Three places use it, plus `auth/signin/page.tsx` reimplements it inline. The pattern is fragile because:
- Adding a new top-level route requires remembering to render `<ClearIntro />`.
- Forgetting it = body stuck in `overflow:hidden` on that route.
- The Header on `/` is the only place that does this "properly" via the intro phase machine.

**Fix:** Either (a) move `intro-locked` application from `layout.tsx` body className to a *route-specific* mechanism (e.g. only apply it inside the home route group), or (b) make the home route an explicit route group `(home)` and only apply `intro-locked` there.

---

### 15. `next.config.ts` has no security headers, no CSP, no `poweredByHeader: false`

**Severity:** MED
**Category:** security
**Files:** `next.config.ts`

```ts
const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [{ protocol: "https", hostname: "avatars.githubusercontent.com" }],
  },
};
```

No `headers()` function, no `Content-Security-Policy`, `X-Frame-Options`, `Referrer-Policy`, `X-Content-Type-Options`. The site loads scripts from `unpkg.com` (via `AnimatedText`, if it were used) and `fonts.googleapis.com` — without CSP, any future XSS via the blog markdown pipeline (#3) is fully unconstrained. `poweredByHeader` defaults to true, exposing `X-Powered-By: Next.js`.

**Fix:** Add a `headers()` config returning at minimum: `Strict-Transport-Security`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and a strict CSP (script-src 'self' 'unsafe-inline' for Next inline scripts + `https://www.googletagmanager.com` for GA + `https://unpkg.com` if AnimatedText stays). Set `poweredByHeader: false`.

---

### 16. Blog upload writes to filesystem in a containerized app — survives only via a Docker volume

**Severity:** MED
**Category:** broken integration
**Files:** `src/lib/upload.ts`, `Dockerfile` (lines 39, 48, 53), `.gitignore` (lines 45-46)

```ts
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
```

Uploads go to `public/uploads/` inside the container. Dockerfile creates the dir and declares `VOLUME ["/app/public/uploads"]`. This works locally but in Coolify with default volume mounts, you need to explicitly bind a persistent volume. If misconfigured, **uploaded blog images are lost on every redeploy**. Also: there's already one orphaned upload checked into git visible via `?? public/uploads/` — `1771240782482-6fb7e49cdfd6.webp` exists in working dir but `.gitignore` rules (`public/uploads/*` except `.gitkeep`) mean it's not tracked.

Filesystem uploads also don't scale (single instance only — no horizontal scale, no CDN, no image optimization beyond what Next/Image does at request time).

**Fix:** Migrate to S3-compatible object storage (Cloudflare R2 fits the existing infra given Cloudflare API access). Until then: document the Coolify volume requirement and add a startup sanity check.

---

### 17. Next-Auth `auth()` with no `MONGODB_URI` silently degrades

**Severity:** MED
**Category:** broken integration / security
**Files:** `src/lib/auth.ts` (lines 14-20)

```ts
function getAdapter() {
  try {
    return MongoDBAdapter(getClientPromise());
  } catch {
    return undefined;
  }
}
```

If `MONGODB_URI` is unset, `getClientPromise()` throws synchronously, the catch returns `undefined`, and NextAuth runs with no adapter → JWT-only sessions. **No error logged.** A misconfigured env will look like working auth until something queries the DB (admin panel, post creation) and 500s.

Worse: without an adapter, the JWT contains `isAdmin: true` if the GitHub username matches `ADMIN_GITHUB_USERNAME` — and that's all the security model. `requireAdmin()` checks `session.user.isAdmin`, which is set in the JWT callback. **There is no DB-side verification.** If `AUTH_SECRET` ever leaks, an attacker can forge an admin JWT.

**Fix:** Don't swallow the adapter error — log it loudly. Fail fast in prod if the DB is required. Consider rate-limiting `/api/auth/*` and storing a server-side admin allowlist that's verified on every request, not just at JWT issue time.

---

### 18. Blog file upload accepts SVG — XSS risk

**Severity:** MED
**Category:** security
**Files:** `src/app/api/blog/upload/route.ts` (lines 18-24)

```ts
const allowedTypes = [
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
];
```

SVG files can contain `<script>` tags. When served from `/uploads/foo.svg` directly (not via Next/Image), modern browsers execute embedded scripts. If an admin uploads a malicious SVG (or has their session hijacked), serving it from the same origin as the site = same-origin XSS bypassing CSP from #15.

Also: `file.type` is the **client-claimed** MIME, trivially spoofable. No magic-number sniff. No filename sanitization (`path.extname(file.name)` accepts `..\\..\\evil.exe.png`).

**Fix:** Drop SVG from allowlist (or sanitize via `dompurify`/`svg-sanitizer` server-side). Sniff actual file bytes (`file-type` package). Serve uploads from a different origin/subdomain or via a route that sets `Content-Disposition: attachment` for non-image-real types.

---

## LOW severity

### 19. PNG icons in `public/` are large for their purpose

**Severity:** LOW
**Category:** performance
**Files:** `public/og-image.png` (126KB), `public/twitter-image.png` (126KB), `public/android-chrome-512x512.png` (137KB), `public/apple-touch-icon.png` (29KB)

OG/Twitter share images at 1200x630 should be ~30-50KB optimized JPEG. 126KB PNGs render fine but waste bandwidth on social embeds. These are listed as `M` in git status — possibly already updated to be smaller; verify.

**Fix:** Run through `oxipng` or convert to optimized JPEG/WebP. OG images don't benefit from PNG transparency.

---

### 20. Framer Motion bundle bloat — used everywhere, including for trivial fades

**Severity:** LOW
**Category:** performance
**Files:** ~30 files using `import { motion } from "framer-motion"`

Framer Motion (`framer-motion@^12.23.26`) is ~50KB gzipped. It's pulled into the initial bundle by `HomeClient` (`motion`), `Header`, `Navigation`, `Footer`, every section. Many uses are trivial `initial={{opacity: 0}} animate={{opacity: 1}}` that could be CSS-only with `@keyframes` already defined in `globals.css` (`fadeIn`, `slideUp`).

**Fix:** Audit `motion.*` usages — replace simple opacity/transform fades with CSS classes from `globals.css`. Keep Framer Motion for orchestrated sequences (intro animation, AnimatePresence). Use `motion/mini` (LazyMotion) where possible.

---

### 21. `useAutoSave` writes to localStorage without size limits

**Severity:** LOW
**Category:** bug
**Files:** `src/hooks/useAutoSave.ts` (line 14)

```ts
localStorage.setItem(`autosave-${key}`, JSON.stringify(data));
```

Localstorage has a ~5MB per-origin limit. Blog post content can easily exceed that for a long post + a few base64-encoded image data URIs. No try/catch around `setItem` — when quota exceeded, throws `QuotaExceededError` and crashes the autosave. Also: `useAutoSave` exposes `load()` but `BlogEditor` never calls it — the autosaved draft is never restored.

**Fix:** Wrap `setItem` in try/catch, surface "autosave failed" to user. Consider IndexedDB for larger payloads. Wire up the load on mount with a "restore unsaved draft?" prompt.

---

### 22. `ensureIndexes` is exported but never called

**Severity:** LOW
**Category:** dead code / broken integration
**Files:** `src/lib/blog.ts` (line 10)

```ts
export async function ensureIndexes() {
  const col = await postsCollection();
  await col.createIndex({ slug: 1 }, { unique: true });
  ...
}
```

Defines four indexes (slug unique, status+publishedAt, tags, author). **Never invoked anywhere.** The blog will work without these indexes, but `getPostBySlug`, `getPublishedPosts(tag=...)` and the unique-slug guarantee all rely on them. First few hundred posts will be fine; queries get slow at scale, and duplicate slugs become possible.

**Fix:** Call `ensureIndexes()` from `instrumentation.ts` (which was deleted — would need to be re-added) or from a one-shot admin endpoint, or at the top of `getDb()` with a guard.

---

### 23. Sitemap silently swallows MongoDB errors with bare `// MongoDB not available`

**Severity:** LOW
**Category:** tech debt
**Files:** `src/app/sitemap.ts` (lines 10-14)

```ts
try {
  slugs = await getAllPublishedSlugs();
} catch {
  // MongoDB not available, skip blog URLs
}
```

No log, no Sentry (which is gone anyway). If the DB is down for an extended period, blog URLs silently disappear from the sitemap and Google will deindex them. Same pattern in `src/app/page.tsx:13`.

**Fix:** At minimum `console.error` with a structured message. Long-term: real error reporting per #4.

---

### 24. `pnpm-workspace.yaml` exists in a non-monorepo

**Severity:** LOW
**Category:** config drift
**Files:** `pnpm-workspace.yaml`

This file is in `git status` as modified. A standalone Next.js app does not need a workspace config. Either this is leftover from a historical monorepo setup or there are intended packages (none visible in repo).

**Fix:** Delete `pnpm-workspace.yaml` if there are no workspaces. If kept, document why.

---

### 25. ESLint config does not enforce key correctness rules

**Severity:** LOW
**Category:** tech debt
**Files:** `eslint.config.mjs`

The config extends `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript` only. No `react-hooks/exhaustive-deps` enforcement (would have caught #9, #10, #11), no `@typescript-eslint/no-floating-promises` (would catch unawaited `fetchData()` calls in #8), no rule against `console.log`. The recent additions of MongoDB / NextAuth code would benefit from stricter rules.

**Fix:** Enable `react-hooks/exhaustive-deps: "error"`, `@typescript-eslint/no-floating-promises: "error"`. Re-run lint and fix violations.

---

### 26. `tsconfig.json` `target: "ES2017"` is stale

**Severity:** LOW
**Category:** tech debt
**Files:** `tsconfig.json` (line 3)

ES2017 means TS down-levels modern syntax (`??`, `?.`, top-level await is fine because module is esnext). With Node 20 in Dockerfile and modern browsers via Next 16's targets, ES2022 or ES2023 is safe and produces smaller, faster code.

**Fix:** Bump `target` to `ES2022`.

---

### 27. `not-found.tsx` calls `window.history.back()` — unsafe if user landed via direct link

**Severity:** LOW
**Category:** bug
**Files:** `src/app/not-found.tsx` (line 55)

```tsx
<button onClick={() => window.history.back()}>
```

If the user opened the 404 page directly (shared bad URL, bookmark), `window.history.back()` either does nothing or navigates back to the referrer (could be a hostile site). Better UX: only show this button if `document.referrer` is set and same-origin.

**Fix:** Conditionally render the back button. Or just remove it — the "Back to Home" link is sufficient.

---

### 28. Blog pagination renders one button per page — explodes at 50+ pages

**Severity:** LOW
**Category:** UX bug
**Files:** `src/components/blog/BlogPagination.tsx` (line 28)

```tsx
{Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
  <button>...</button>
))}
```

At 50 pages this is 50 buttons rendered horizontally. UI breaks on mobile, looks comical on desktop. No "..." truncation.

**Fix:** Show first 2, current ± 1, last 2, with `...` between gaps. Standard pagination pattern.

---

### 29. `BlogPostCard` fetches images via `<Image fill>` without explicit width hint at small sizes

**Severity:** LOW
**Category:** performance
**Files:** `src/components/blog/BlogPostCard.tsx` (line 49)

```tsx
sizes={featured ? "100vw" : "(max-width: 768px) 100vw, 50vw"}
```

The non-featured grid is 3 columns on `lg` (`grid md:grid-cols-2 lg:grid-cols-3`), so on a 1280px viewport each card is ~33vw, not 50vw. Next/Image will fetch a bigger image than needed.

**Fix:** Update sizes to `"(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"`.

---

### 30. `MarkdownRenderer` heading IDs collide with non-heading content

**Severity:** LOW
**Category:** bug
**Files:** `src/components/blog/MarkdownRenderer.tsx` (lines 19-21, 33-35, 49-51)

The `id` is derived only when `children` is a string. If the heading contains inline markdown (e.g. `## Why **GSD** matters`), `children` is a React node array → no id is attached → table-of-contents `<a href="#why-gsd-matters">` is dead. The `TableOfContents` component (line 23) does its own slugification from regex matching `^(#{1,3})\s+(.+)$` — same bug, different approach. The two slug algorithms drift.

**Fix:** Use `rehype-slug` plugin in the rehype pipeline. Both renderers and the TOC use the same auto-generated IDs.

---

### 31. `new Date()` in `lastModified` for sitemap shifts on every build

**Severity:** LOW
**Category:** SEO bug
**Files:** `src/app/sitemap.ts` (lines 19, 27, 33)

```ts
{ url: siteUrl, lastModified: new Date(), changeFrequency: "monthly" }
```

`lastModified: new Date()` evaluates at request time → every sitemap fetch reports "modified just now" for every URL. Search engines lose any signal about which content actually changed.

**Fix:** For static pages, use the build timestamp or a committed date. For blog posts (already loaded from DB), use `post.updatedAt`.

---

## Test Coverage Gaps

**No tests exist anywhere.** No Jest, Vitest, Playwright, or any test config. `package.json` has no `test` script. For a project shipping authentication, file uploads, MongoDB queries, and a markdown rendering pipeline that handles user input, this is a significant risk. Specific areas where the absence is most painful:

- `src/lib/blog.ts` — DB query layer with several `Promise<BlogPost | null>` patterns and ObjectId construction that will throw on bad input.
- `src/lib/auth.ts` — admin-allowlist logic. A regression here is a security incident.
- `src/lib/upload.ts` — file naming / extension handling.
- The intro animation state machine — five-state FSM with multiple effects, easy to break.
- `useSectionObserver`, `useParallax` — non-trivial hooks with browser-API dependencies.

**Priority:** Start with `src/lib/auth.ts` (security-critical) and `src/lib/blog.ts` (data correctness). Use Vitest + a testcontainers MongoDB for integration tests.

---

## Summary

| Severity | Count |
|----------|-------|
| HIGH     | 6     |
| MED      | 12    |
| LOW      | 13    |
| **Total**| **31** |

**Most urgent action:** commit the in-progress work to a feature branch (currently sprawled across an uncommitted working tree), then tackle the HIGH severity items in this order: #1 (will crash the editor under React StrictMode), #2 (build is currently noisy and will 500 on `/blog` in prod), #4 (no error visibility at all), #3 (XSS hardening), #5 (docs lying about requirements), #6 (finish the Sentry removal cleanly).

---

*Concerns audit: 2026-05-06*
