---
phase: 03-authentication
plan: 01
subsystem: auth
tags: [next-auth, auth.js, mongodb, github-oauth, session-management]

# Dependency graph
requires:
  - phase: 02-testing-infrastructure
    provides: Testing framework and E2E setup
provides:
  - Auth.js v5 with GitHub OAuth provider
  - MongoDB adapter for session persistence
  - Session type extensions with role-based access
  - Admin detection via environment variable
  - API route at /api/auth/[...nextauth]
affects: [04-ui-components, 05-blog-storage, 06-blog-management, 07-comments]

# Tech tracking
tech-stack:
  added: [next-auth@5.0.0-beta.30, @auth/mongodb-adapter@3.11.1, mongodb@7.0.0]
  patterns: [Database session strategy, Edge-compatible auth config separation, Environment-based admin detection]

key-files:
  created: [src/lib/db.ts, src/lib/auth.ts, src/lib/auth.config.ts, src/types/next-auth.d.ts, src/app/api/auth/[...nextauth]/route.ts, .env.example]
  modified: [package.json, vitest.setup.tsx]

key-decisions:
  - "Database session strategy for multi-device support"
  - "Separate auth.config.ts for Edge runtime compatibility"
  - "Admin detection via ADMIN_GITHUB_USERNAME env var (defaults to zachlagden)"
  - "Defer MongoDB URI validation to runtime for build compatibility"

patterns-established:
  - "MongoDB client singleton with hot-reload support using global variable pattern"
  - "Auth.js configuration split: auth.config.ts (Edge-compatible) + auth.ts (full with adapter)"
  - "Session callbacks extend user object with id and role fields"

# Metrics
duration: 6min
completed: 2026-01-21
---

# Phase 3 Plan 1: Auth.js Foundation Summary

**Auth.js v5 with GitHub OAuth, MongoDB sessions, and role-based admin detection via environment variable**

## Performance

- **Duration:** 6 minutes
- **Started:** 2026-01-21T19:52:46Z
- **Completed:** 2026-01-21T19:58:31Z
- **Tasks:** 2
- **Files modified:** 10

## Accomplishments
- Installed and configured Auth.js v5 beta with GitHub OAuth provider
- Created MongoDB client singleton with hot-reload support for development
- Implemented database session strategy for multi-device session management
- Extended session type with user ID and role (admin/user) fields
- Set up admin detection based on GitHub username from environment variable

## Task Commits

Each task was committed atomically:

1. **Task 1: Install Auth.js dependencies and create MongoDB client** - `8ad0ec5` (chore)
2. **Task 2: Create Auth.js configuration with GitHub provider and role extension** - `f56bbdc` (feat)

## Files Created/Modified

**Created:**
- `src/lib/db.ts` - MongoDB client singleton with hot-reload support
- `src/lib/auth.ts` - Full Auth.js configuration with MongoDB adapter
- `src/lib/auth.config.ts` - Edge-compatible auth configuration
- `src/types/next-auth.d.ts` - Session type extensions with id and role
- `src/app/api/auth/[...nextauth]/route.ts` - Auth.js API route handler
- `.env.example` - Environment variable template with all required vars

**Modified:**
- `package.json` - Added Auth.js dependencies
- `vitest.setup.tsx` - Fixed TypeScript error in Framer Motion mock

## Decisions Made

1. **Database session strategy** - Using `strategy: "database"` instead of JWT for session storage to enable multi-device session management and "sign out everywhere" functionality.

2. **Separate auth.config.ts** - Split configuration into Edge-compatible config (auth.config.ts) and full config with MongoDB adapter (auth.ts) to support future middleware implementation on Edge runtime.

3. **Admin detection via env var** - Using `ADMIN_GITHUB_USERNAME` environment variable (defaults to "zachlagden") instead of hardcoding to allow flexibility.

4. **Runtime validation** - Deferred MongoDB URI validation to runtime instead of build time to allow builds without environment variables.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed TypeScript error in vitest.setup.tsx**
- **Found during:** Task 2 (Build verification)
- **Issue:** Dynamic component creation in Framer Motion mock caused TypeScript error: "Type '{ children: ReactNode; }' has no properties in common with type 'IntrinsicAttributes'"
- **Fix:** Replaced JSX syntax with `React.createElement()` to properly handle dynamic tag types
- **Files modified:** vitest.setup.tsx
- **Verification:** Build passes, type check succeeds
- **Committed in:** f56bbdc (Task 2 commit)

**2. [Rule 3 - Blocking] Deferred MongoDB URI validation for build compatibility**
- **Found during:** Task 2 (Build verification)
- **Issue:** MongoDB client threw error at module import time when MONGODB_URI was missing, preventing builds
- **Fix:** Changed to Promise.reject() pattern to defer validation until runtime
- **Files modified:** src/lib/db.ts
- **Verification:** Build succeeds without environment variables
- **Committed in:** f56bbdc (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 bug, 1 blocking)
**Impact on plan:** Both auto-fixes necessary for build to succeed. No scope creep.

## Issues Encountered

None - plan executed smoothly with only expected build-time issues.

## User Setup Required

**External services require manual configuration.** Before the authentication system can be used:

### Required Environment Variables

Add to `.env.local` (see `.env.example` for template):

```bash
# MongoDB - Database for session persistence
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/zachlagden-uk?retryWrites=true&w=majority

# Auth.js - Authentication configuration
AUTH_SECRET=  # Generate with: openssl rand -base64 32
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=

# Admin - User with admin privileges
ADMIN_GITHUB_USERNAME=zachlagden
```

### GitHub OAuth Setup

1. Go to [GitHub Settings → Developer settings → OAuth Apps](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name:** Zach Lagden Portfolio (Dev) or (Prod)
   - **Homepage URL:** `http://localhost:3000` (dev) or `https://zachlagden.uk` (prod)
   - **Authorization callback URL:** `http://localhost:3000/api/auth/callback/github` (dev) or `https://zachlagden.uk/api/auth/callback/github` (prod)
4. Copy the **Client ID** → `AUTH_GITHUB_ID`
5. Generate a new **Client Secret** → `AUTH_GITHUB_SECRET`

**Note:** GitHub OAuth only allows one callback URL per app. Create separate apps for dev and production.

### MongoDB Setup

1. Option A: MongoDB Atlas (recommended for production)
   - Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
   - Create cluster
   - Database → Connect → Get connection string

2. Option B: Local MongoDB (for development)
   - Install MongoDB locally
   - Use `mongodb://localhost:27017/zachlagden-uk`

### Verification

After setup, verify authentication works:

```bash
# Start development server
pnpm dev

# Visit in browser
open http://localhost:3000/api/auth/providers

# Should see: {"github":{"id":"github","name":"GitHub","type":"oauth"}}
```

## Next Phase Readiness

**Ready for Phase 3 Plan 2 (UI Components):**
- Auth.js foundation complete and ready for integration
- Session type extensions support role-based rendering
- API routes ready to handle OAuth flow

**Blockers:** None - UI components can now check authentication state and render conditionally

**Concerns:** None - standard Auth.js setup with proven patterns

---
*Phase: 03-authentication*
*Completed: 2026-01-21*
