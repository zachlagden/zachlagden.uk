# Knip Baseline — v2.0 Phase 5

**Captured:** 2026-05-12T11:02:45Z
**Commit SHA:** 53fb99b9a0b072292f5b4e0eccbd1a4e6f0af180
**Branch:** main
**knip version:** 6.13.0
**Node version:** v22.22.2
**pnpm version:** 10.33.0
**Reporter:** markdown
**Command:** `pnpm dlx knip --reporter markdown`

## Purpose

Verbatim baseline per D-08 — captured for v3 regression comparison. Re-run
the same command on the v3 milestone open commit and diff the two reports
to surface unused-code drift introduced during v2.0.

Per D-08: signal preservation > aesthetics. Do not curate.

The Commit SHA above (`53fb99b…`) points at the v2-open codebase state — the
parent of the atomic commit that adds knip + this baseline file. From a source
perspective the codebase is identical at HEAD because Plan 5 Plan 2 only adds a
devDependency; no application source changes.

---

## Knip Report (verbatim)

Progress: resolved 1, reused 0, downloaded 0, added 0
Packages: +21
+++++++++++++++++++++
Progress: resolved 65, reused 27, downloaded 0, added 21, done
# Knip report

## Unused files (3)

| Name                        | Location                    | Severity |
| :-------------------------- | :-------------------------- | :------- |
| scripts/optimize-images.mjs | scripts/optimize-images.mjs | error    |
| .remember/tmp/last-ndc.ts   | .remember/tmp/last-ndc.ts   | error    |
| src/lib/auth-helpers.ts     | src/lib/auth-helpers.ts     | error    |

## Unused devDependencies (1)

| Name  | Location          | Severity |
| :---- | :---------------- | :------- |
| sharp | package.json:43:6 | error    |

## Unused exports (18)

| Name                          | Location                            | Severity |
| :---------------------------- | :---------------------------------- | :------- |
| getPrimaryActivity            | src/utils/presenceService.ts:100:17 | error    |
| cardEntranceAnimation         | src/utils/animationUtils.ts:120:14  | error    |
| waveStaggerAnimation          | src/utils/animationUtils.ts:108:14  | error    |
| scrollToSectionWithTransition | src/utils/viewTransition.ts:69:14   | error    |
| staggerContainerAnimation     | src/utils/animationUtils.ts:37:14   | error    |
| slideFromRightAnimation       | src/utils/animationUtils.ts:98:14   | error    |
| slideFromLeftAnimation        | src/utils/animationUtils.ts:88:14   | error    |
| updateWithTransition          | src/utils/viewTransition.ts:39:14   | error    |
| listItemAnimation             | src/utils/animationUtils.ts:57:14   | error    |
| slideUpAnimation              | src/utils/animationUtils.ts:27:14   | error    |
| tooltipAnimation              | src/utils/animationUtils.ts:77:14   | error    |
| fadeInAnimation               | src/utils/animationUtils.ts:18:14   | error    |
| focusAnimation                | src/utils/animationUtils.ts:48:14   | error    |
| tapAnimation                  | src/utils/animationUtils.ts:12:14   | error    |
| scrollToTop                   | src/utils/scrollUtils.ts:24:14      | error    |
| getAllPublishedSlugs          | src/lib/blog.ts:189:23              | error    |
| signOut                       | src/lib/auth.ts:26:40               | error    |
| signIn                        | src/lib/auth.ts:26:32               | error    |

## Unused exported types (16)

| Name               | Location                     | Severity |
| :----------------- | :--------------------------- | :------- |
| UserAvatar         | src/types/presence.ts:112:18 | error    |
| ActivityTimestamps | src/types/presence.ts:46:18  | error    |
| ActivePlatforms    | src/types/presence.ts:15:18  | error    |
| SpotifyActivity    | src/types/presence.ts:57:18  | error    |
| ActivityAssets     | src/types/presence.ts:39:18  | error    |
| CustomStatus       | src/types/presence.ts:21:18  | error    |
| SpotifyColor       | src/types/presence.ts:65:18  | error    |
| SpotifyAlbum       | src/types/presence.ts:72:18  | error    |
| SpotifyTrack       | src/types/presence.ts:77:18  | error    |
| Statuses           | src/types/presence.ts:85:18  | error    |
| UserData           | src/types/presence.ts:93:18  | error    |
| Footer             | src/types/content.ts:114:18  | error    |
| SkillCategory      | src/types/content.ts:90:18   | error    |
| PresenceData       | src/types/presence.ts:7:18   | error    |
| Metadata           | src/types/content.ts:14:18   | error    |
| Personal           | src/types/content.ts:24:18   | error    |
