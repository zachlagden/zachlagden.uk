---
quick_id: 260506-dyv
type: execute
wave: 1
depends_on: []
files_modified:
  - src/app/error.tsx
  - src/app/global-error.tsx
autonomous: true
requirements: [STAB-01, STAB-02]
must_haves:
  truths:
    - "Runtime errors below the root layout render a styled fallback with retry, not Next's default white-screen"
    - "Errors in the root layout itself render a styled fallback with retry inside a self-contained <html><body>"
    - "Both boundaries log the error via console.error so failures are observable in dev/prod logs"
    - "Both fallbacks offer Try again (reset) and Back to Home (navigation) affordances"
  artifacts:
    - path: src/app/error.tsx
      provides: "Route-group error boundary (lives inside root layout)"
      contains: '"use client"'
    - path: src/app/global-error.tsx
      provides: "Root-layout error boundary (renders its own <html><body>)"
      contains: '"use client"'
  key_links:
    - from: src/app/error.tsx
      to: console.error
      via: useEffect on mount
      pattern: "console\\.error\\(error\\)"
    - from: src/app/global-error.tsx
      to: console.error
      via: useEffect on mount
      pattern: "console\\.error\\(error\\)"
    - from: src/app/error.tsx
      to: reset
      via: "Try again" button onClick
      pattern: "onClick=\\{.*reset"
    - from: src/app/global-error.tsx
      to: reset
      via: "Try again" button onClick
      pattern: "onClick=\\{.*reset"
---

<objective>
Restore the two error boundaries removed during Sentry cleanup (CONCERNS #4). Closes STAB-01 and STAB-02 in a single atomic commit so the site never falls back to Next's bare default error UI.

Purpose: Core value is "site never blanks/500s". Without `error.tsx` the entire app unmounts on any client-component throw; without `global-error.tsx` a root-layout throw shows Next's generic fallback. Both must exist and match the polished `not-found.tsx` aesthetic.

Output: Two new client components — `src/app/error.tsx` and `src/app/global-error.tsx` — with no dependency on Sentry, observability via `console.error`.
</objective>

<execution_context>
@$HOME/.claude/get-shit-done/workflows/execute-plan.md
</execution_context>

<context>
@.planning/STATE.md
@.planning/PROJECT.md
@.planning/REQUIREMENTS.md
@.planning/codebase/CONCERNS.md
@./CLAUDE.md
@src/app/not-found.tsx
@src/app/layout.tsx

<interfaces>
<!-- Next.js 16 App Router error boundary contract — both files share this prop shape. -->

```ts
type ErrorBoundaryProps = {
  error: Error & { digest?: string };
  reset: () => void;
};
```

Both files must:
- Be client components (`"use client"` at top)
- Export a default function accepting `ErrorBoundaryProps`
- Call `console.error(error)` in a `useEffect(() => { ... }, [error])`

Visual language to match (from `src/app/not-found.tsx`):
- Outer wrapper: `min-h-screen bg-neutral-50 font-[system-ui] text-neutral-900 flex flex-col items-center justify-center px-4`
- Inner: `text-center max-w-lg`
- framer-motion fade-ins with staggered `delay` (0, 0.2, 0.3, 0.4)
- Primary button (Back to Home): `flex items-center gap-2 bg-black text-white py-2 px-4 rounded-lg hover:bg-neutral-800 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`
- Secondary button (Try again): `flex items-center gap-2 text-neutral-600 py-2 px-4 rounded-lg hover:text-neutral-900 hover:bg-neutral-100 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2`
- Footer copyright block at the bottom: `mt-16 text-center` with `text-xs text-neutral-400`
</interfaces>
</context>

<tasks>

<task type="auto">
  <name>Task 1: Create both error boundaries</name>
  <files>src/app/error.tsx, src/app/global-error.tsx</files>
  <action>
Create both files in one shot. Closes STAB-01 (error.tsx) and STAB-02 (global-error.tsx).

**File 1 — `src/app/error.tsx`** (route-group boundary, renders inside root layout):

- Top: `"use client";`
- Imports: `Link` from `next/link`, `motion` from `framer-motion`, `useEffect` from `react`, icons `RefreshCw` and `Home` from `lucide-react`.
- Default export named `Error` accepting `{ error, reset }: { error: Error & { digest?: string }; reset: () => void }`.
- `useEffect(() => { console.error(error); }, [error]);` — single dependency, fires once per new error.
- Render the same structural shell as `not-found.tsx`:
  - Outer `<div>` with `min-h-screen bg-neutral-50 font-[system-ui] text-neutral-900 flex flex-col items-center justify-center px-4`.
  - Inner `<div className="text-center max-w-lg">`.
  - First `motion.div` (delay 0): an `inline-flex` rounded badge `w-20 h-20 rounded-full bg-neutral-100` containing an `AlertTriangle` icon (`w-10 h-10 text-neutral-800`) — drop-in replacement for the "404" badge in not-found.tsx. Import `AlertTriangle` alongside the other lucide icons.
  - `motion.h1` (delay 0.2): copy `Something went wrong` — class `text-4xl font-bold tracking-tighter mb-4`.
  - `motion.p` (delay 0.3): copy `An unexpected error occurred. Try again, or head back home if the problem persists.` — class `text-neutral-600 mb-8 leading-relaxed`. Use `&apos;` for any apostrophes.
  - `motion.div` button row (delay 0.4): `flex flex-col sm:flex-row items-center justify-center gap-4`.
    - Primary `<button onClick={() => reset()}>` (NOT a Link — must trigger reset): `bg-black text-white …` styling exactly as not-found.tsx primary. Icon: `<RefreshCw className="w-4 h-4" />` then text `Try again`.
    - Secondary `<Link href="/">`: ghost styling exactly as not-found.tsx secondary. Icon: `<Home className="w-4 h-4" />` then text `Back to Home`.
  - Footer `motion.div` (delay 0.6): `mt-16 text-center` with `<p className="text-xs text-neutral-400">© {new Date().getFullYear()} Zach Lagden</p>`.
- Each `motion.*` element uses the same `initial`/`animate`/`transition` shape as not-found.tsx (the badge and footer use `{ opacity: 0, y: -20 }`/`{ opacity: 0 }` consistent with the originals — match not-found.tsx case-for-case for the equivalent slot).
- Do NOT render `<html>` or `<body>` — this boundary lives inside the root layout.

**File 2 — `src/app/global-error.tsx`** (root-layout boundary, must replace `<html><body>`):

- Top: `"use client";`
- Imports: `Link` from `next/link`, `motion` from `framer-motion`, `useEffect` from `react`, icons `RefreshCw`, `Home`, `AlertTriangle` from `lucide-react`.
- Default export named `GlobalError` accepting the same props.
- Same `useEffect(() => { console.error(error); }, [error])`.
- Render `<html lang="en"><body>...</body></html>` directly — this REPLACES the root layout when the layout itself throws, so we cannot rely on it.
- Apply the visual classes directly on `<body>` instead of an outer wrapper: `<body className="min-h-screen bg-neutral-50 font-[system-ui] text-neutral-900 flex flex-col items-center justify-center px-4">`. This avoids needing `globals.css` to load (the layout that imports it has errored).
- Inside the body, render the same `text-center max-w-lg` block as error.tsx with the same motion choreography.
- Heading copy: `Application error`.
- Body copy: `A fatal error prevented the application from rendering. Try again, or return home — we&apos;re looking into it.`
- Same two buttons (Try again → `reset()`, Back to Home → `<Link href="/">`).
- Same footer copyright block.
- DO NOT import any project components (no `Header`, `GlobalBackground`, `SessionProvider`, `GoogleAnalytics`, no `globals.css` import). framer-motion + lucide-react + next/link only — these are leaf libraries with no layout-provider dependencies.
- Do NOT add `<head>` content, fonts, or metadata — keep this minimal.

**After writing both files, BEFORE committing:**

```bash
pnpm tsc --noEmit
pnpm lint
```

Both must exit 0. Fix any issues (most likely: unescaped apostrophes — use `&apos;` in JSX text; unused imports).

**Commit (atomic):**

```bash
git add src/app/error.tsx src/app/global-error.tsx
git commit -m "feat(error): add route and global error boundaries"
```

The two deleted Sentry files (`sentry.edge.config.ts`, `sentry.server.config.ts`, `instrumentation-client.ts`) are out of scope for this commit — leave them in their current `D` git state, do not stage them.
  </action>
  <verify>
    <automated>test -f src/app/error.tsx && test -f src/app/global-error.tsx && grep -q '"use client"' src/app/error.tsx && grep -q '"use client"' src/app/global-error.tsx && grep -q 'console.error(error)' src/app/error.tsx && grep -q 'console.error(error)' src/app/global-error.tsx && grep -q '<html' src/app/global-error.tsx && grep -q '<body' src/app/global-error.tsx && ! grep -q '<html' src/app/error.tsx && grep -q 'reset()' src/app/error.tsx && grep -q 'reset()' src/app/global-error.tsx && pnpm tsc --noEmit && pnpm lint</automated>
  </verify>
  <done>
    - `src/app/error.tsx` exists with `"use client"`, `console.error(error)` in `useEffect`, calls `reset()` from a "Try again" button, and a `<Link href="/">` "Back to Home" button.
    - `src/app/global-error.tsx` exists with `"use client"`, its own `<html>` and `<body>` tags, the same `console.error` and `reset()` wiring, and no imports of project layout components.
    - Both files match `not-found.tsx`'s framer-motion choreography and neutral palette visually.
    - `pnpm tsc --noEmit` exits 0.
    - `pnpm lint` exits 0.
    - One commit on disk: `feat(error): add route and global error boundaries` with exactly those two files staged.
  </done>
</task>

</tasks>

<verification>
- Both files exist at `src/app/error.tsx` and `src/app/global-error.tsx`.
- `pnpm tsc --noEmit` passes.
- `pnpm lint` passes.
- `git log -1 --oneline` shows `feat(error): add route and global error boundaries`.
- `git diff --stat HEAD~1` shows exactly two new files.
</verification>

<success_criteria>
- STAB-01 satisfied: route-level error boundary recovers from runtime errors with Try again + Back to Home, logs via `console.error`.
- STAB-02 satisfied: global error boundary replaces `<html><body>` and recovers from root-layout errors with the same affordances.
- Both fallbacks visually consistent with `not-found.tsx` (neutral-50 bg, system-ui, framer-motion fade-ins, lucide icons).
- No regression: `tsc --noEmit` and `lint` clean.
- One atomic commit captures both files.
</success_criteria>

<output>
After completion, no SUMMARY file is required (quick mode). The commit on `main` is the artifact.
</output>
