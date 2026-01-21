# Phase 3: Authentication - Context

**Gathered:** 2026-01-21
**Status:** Ready for planning

<domain>
## Phase Boundary

Users can sign in with GitHub and admins can access protected functionality. Includes OAuth flow, session persistence, admin detection for user "zachlagden", and protected route handling. Blog features (comments, post creation) are separate phases that consume this auth system.

</domain>

<decisions>
## Implementation Decisions

### Sign-in UI
- Floating element in top-right corner (no traditional header exists)
- Glass effect style matching the theme toggle (backdrop-blur, semi-transparent)
- When signed out: "Sign in with GitHub" button
- When signed in: Avatar + username always visible, dropdown reveals profile/logout options
- Dropdown includes: view their comments/interactions, Sign out, Sign out everywhere
- Direct OAuth redirect on click (no confirmation modal)

### Session behavior
- 30-day session duration ("remember me" by default)
- Session expiry handling:
  - If expired while user is away: show signed-out state silently on next visit
  - If expired while user is active: show toast notification, update UI to logged-out state
  - If on protected page when expired: redirect to login with return URL parameter
- Return-to-origin after sign-in: always redirect back to the page they were on
- Multi-device support: unlimited simultaneous sessions
- User can view active sessions from profile dropdown
- Logout options: "Sign out" (current device) and "Sign out everywhere" (all sessions)

### Admin vs commenter UI
- Admin controls via floating action menu (FAB)
- FAB contains: New Post, Edit, Delete (context-dependent actions)
- Admin badge on avatar (small visual indicator)
- Non-admin logged-in users see read-only indicators only
- Commenters cannot edit/delete others' content (standard read-only experience)

### Protected routes
- Visiting protected route while logged out: show "Sign in required" message with sign-in button (not redirect)
- Non-admin visiting admin route (e.g., /blog/new): 403 Forbidden page with clear message
- Auth check loading state: loading spinner
- Admin routes hidden completely from any navigation when logged out

### Claude's Discretion
- Exact FAB position and animation
- Loading spinner design
- Toast notification styling
- Session storage implementation details (database schema, token format)
- Active sessions UI design in dropdown

</decisions>

<specifics>
## Specific Ideas

- Sign-in element should match the existing page style (glass effect like theme toggle)
- The site doesn't have a header, so floating elements in corners are the pattern
- Return URL handling is important for good UX — always bring users back where they were

</specifics>

<deferred>
## Deferred Ideas

None — discussion stayed within phase scope

</deferred>

---

*Phase: 03-authentication*
*Context gathered: 2026-01-21*
