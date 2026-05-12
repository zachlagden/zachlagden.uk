# Remove the Discord/Spotify presence widget

**Created:** 2026-05-12 (Plan 05-03 user directive)
**Priority:** Low — widget is non-essential; can be picked up in Phase 6 (content refresh) or as a `/gsd-quick` task.
**Status:** Pending (out of scope for Plan 05-03)

## Why this is owed

During Plan 05-03 the user decided the live-presence widget (Spotify + VS Code via `api.lagden.dev`) is being **removed**, not fixed. Rather than provisioning `NEXT_PUBLIC_DISCORD_USER_ID` in Coolify to make the widget work, the cleaner action is to delete the widget entirely.

The widget was originally tracked as a v1-stabilisation feature (PERF-02 hardened its polling behaviour in commit `4931ff6`) but adds little to the portfolio's core value and depends on a side service (`api.lagden.dev/v1/watcher/<discordId>`) that adds runtime fragility for marginal visual payoff.

## Scope

### Files to delete

- `src/components/ui/PresenceStatus.tsx`
- `src/utils/presenceService.ts`
- `src/types/presence.ts`

### Importers to update

Search for and remove every importer of the deleted files:

```bash
grep -rn "PresenceStatus\|presenceService\|presence\.ts\|from \"@/types/presence\"" src/
```

Expected hits (audit before deleting):

- `src/app/HomeClient.tsx` — likely renders `<PresenceStatus />`. Remove the import and the JSX usage.
- Anywhere else surfaced by the grep above.

### .env.example

Already cleaned in Plan 05-03 — no further change needed.

### README

Remove any mention of `NEXT_PUBLIC_DISCORD_USER_ID` from `README.md` (search: `grep -n DISCORD README.md`).

### Layout preconnect

Remove the `api.lagden.dev` preconnect hint from `src/app/layout.tsx`:

```bash
grep -n "lagden.dev" src/app/layout.tsx
```

If it appears as a `<link rel="preconnect" />` for the presence API, remove the line (preserve any other preconnects).

### Coolify env

`NEXT_PUBLIC_DISCORD_USER_ID` is NOT in Coolify (per Plan 05-03 audit) — no Coolify-side cleanup needed.

### CLAUDE.md / project context

Update `./CLAUDE.md` if it references the presence widget under "Key Implementation Details" or similar. Replace with a note that the widget was removed.

## Verification

After removing, run the verification floor:

```bash
pnpm install --frozen-lockfile
pnpm exec tsc --noEmit   # must pass — no dangling imports
pnpm lint                # must pass
pnpm build               # must pass — no missing-module errors
```

Then deploy and confirm:

- `/` renders normally without the presence ticker
- No network requests to `api.lagden.dev` in DevTools network panel
- No console errors

## Acceptance

- [ ] Three files deleted: `PresenceStatus.tsx`, `presenceService.ts`, `presence.ts`
- [ ] All importers updated (zero `tsc --noEmit` errors)
- [ ] `api.lagden.dev` preconnect removed from `layout.tsx`
- [ ] README references to `NEXT_PUBLIC_DISCORD_USER_ID` removed
- [ ] `pnpm build` succeeds
- [ ] Deployed and visually confirmed widget is gone
- [ ] Move this file to `.planning/todos/done/`

## Related

- `.planning/runbooks/ENV-VARS.md` → "Intentionally removed" → NEXT_PUBLIC_DISCORD_USER_ID
- `.planning/phases/05-dependency-hardening-env-config/05-03-SUMMARY.md` user-decision documentation
- v1 PERF-02 (`commit 4931ff6`) — the polling-backoff hardening that will become obsolete
