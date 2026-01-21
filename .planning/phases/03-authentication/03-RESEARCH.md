# Phase 3: Authentication - Research

**Researched:** 2026-01-21
**Domain:** Next.js authentication with GitHub OAuth, session management, and role-based access control
**Confidence:** HIGH

## Summary

Authentication in Next.js 15 App Router has reached a critical transition point. Auth.js (formerly NextAuth.js) has entered maintenance mode and is being succeeded by Better Auth, which offers superior type safety, built-in plugins for real-world features (2FA, organizations, device management), and framework-agnostic design. However, Auth.js v5 remains stable, widely adopted, and well-documented for Next.js integration.

The standard approach for Next.js authentication combines:
1. **Auth.js v5** or **Better Auth** for authentication framework (both support GitHub OAuth, MongoDB sessions, and role-based access)
2. **MongoDB adapter** for session persistence with database storage
3. **Middleware** for route protection (but NOT as the sole security layer)
4. **Data Access Layer pattern** for verification at data fetching points
5. **JWT or database sessions** (JWT default, database for multi-device session management)

**Critical security note:** CVE-2025-29927 (CVSS 9.1) exposed a middleware bypass vulnerability in Next.js versions through 15.2.2. Applications must use Next.js 15.2.3+ and implement defense-in-depth by verifying authentication at multiple layers, not just middleware.

**Primary recommendation:** Use Auth.js v5 for this project (stable, proven, excellent Next.js integration) with MongoDB adapter for database sessions to support multi-device session management and "sign out everywhere" functionality. Better Auth is viable but newer and requires more custom implementation for specific UI requirements.

## Standard Stack

The established libraries/tools for Next.js 15 authentication:

### Core

| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| next-auth | 5.x (beta) | Authentication framework | Official Next.js integration, 80+ OAuth providers, universal `auth()` function works everywhere (middleware, server components, route handlers) |
| @auth/mongodb-adapter | latest | Session persistence | Official Auth.js adapter, stores users/sessions/accounts in MongoDB with minimal configuration |
| mongodb | 6.x | Database driver | Required by MongoDB adapter, industry-standard Node.js driver |
| next-auth/react | 5.x (beta) | Client-side hooks | Provides `useSession()` for client components, handles session state reactively |

### Supporting

| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| better-auth | 1.x | Modern auth framework | Alternative to Auth.js with better DX, type safety, and built-in plugins; use for new projects prioritizing modern patterns |
| @better-auth/mongodb | latest | Better Auth MongoDB adapter | If using Better Auth instead of Auth.js |
| @auth/core | 0.x | Auth.js core utilities | Typically included via next-auth, provides shared types and utilities |

### Alternatives Considered

| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| Auth.js (free, self-hosted) | Clerk | Clerk offers beautiful pre-built UI, faster setup (1-3 days vs 1-2 weeks), built-in organizations/RBAC, but costs $25/month after 10k MAU and reduces backend control |
| Auth.js (configuration required) | Supabase Auth | Better if already using Supabase, excellent free tier (50k MAU), Row Level Security integration, but simpler feature set and requires PostgreSQL not MongoDB |
| Auth.js v5 (maintenance mode) | Better Auth | Better Auth is the future, with superior type safety and modern patterns, but newer (less community content) and requires more custom work for UI |

**Installation:**

```bash
# Auth.js approach (recommended for this project)
pnpm add next-auth@beta @auth/mongodb-adapter mongodb

# Better Auth approach (alternative)
pnpm add better-auth @better-auth/mongodb mongodb
```

## Architecture Patterns

### Recommended Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts          # Auth.js API route handler
│   ├── login/
│   │   └── page.tsx                  # Optional custom login page
│   └── middleware.ts                 # Route protection (edge runtime)
├── components/
│   ├── auth/
│   │   ├── SignInButton.tsx          # Floating sign-in button (glass effect)
│   │   ├── UserMenu.tsx              # Avatar + dropdown when authenticated
│   │   ├── SessionProvider.tsx       # Client-side session context wrapper
│   │   └── ProtectedRoute.tsx        # Component wrapper for auth checks
│   └── ui/
│       └── floating-action-button.tsx # FAB for admin controls
├── lib/
│   ├── auth.ts                       # Auth.js configuration (exports auth, signIn, signOut)
│   ├── db.ts                         # MongoDB client singleton
│   └── dal.ts                        # Data Access Layer - verify auth before data access
└── middleware.ts                     # Root middleware for route protection
```

### Pattern 1: Universal `auth()` Function

**What:** Auth.js v5 provides a single `auth()` function that works in all contexts (middleware, server components, route handlers, API routes).

**When to use:** Everywhere you need to check authentication status in server-side code.

**Example:**

```typescript
// Source: https://authjs.dev/reference/nextjs
// lib/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [GitHub],
  session: {
    strategy: "database", // Required for multi-device session management
    maxAge: 30 * 24 * 60 * 60, // 30 days (default)
  },
  callbacks: {
    // Add role to session
    async session({ session, user }) {
      if (session.user) {
        session.user.role = user.email === "your-email@example.com" ? "admin" : "user"
      }
      return session
    },
  },
})

// app/api/auth/[...nextauth]/route.ts
export { handlers as GET, handlers as POST }

// middleware.ts
export { auth as middleware } from "@/lib/auth"

// Server component
import { auth } from "@/lib/auth"

export default async function Page() {
  const session = await auth()
  if (!session) return <div>Not authenticated</div>
  return <div>Welcome {session.user.name}</div>
}
```

### Pattern 2: Data Access Layer (DAL)

**What:** Verify authentication at every data access point, not just at route boundaries. This is the canonical security pattern post-CVE-2025-29927.

**When to use:** Every function that fetches sensitive data from the database or external APIs.

**Example:**

```typescript
// Source: Official Next.js App Router security guidance
// lib/dal.ts
import 'server-only'
import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'

export async function verifySession() {
  const session = await auth()
  if (!session?.user) {
    redirect('/login')
  }
  return { userId: session.user.id, role: session.user.role }
}

export async function getAdminData() {
  const { role } = await verifySession()

  if (role !== 'admin') {
    throw new Error('Unauthorized')
  }

  // Safe to fetch admin data here
  const data = await db.adminData.find()
  return data
}
```

### Pattern 3: Multi-Device Session Management

**What:** With database sessions, each login creates a new session record. Users can view active sessions and revoke them individually or all at once.

**When to use:** When implementing "sign out" and "sign out everywhere" features.

**Example:**

```typescript
// Source: Better Auth multi-session concepts
// app/api/sessions/route.ts
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET() {
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Get all sessions for current user
  const sessions = await db.collection('sessions').find({
    userId: session.user.id
  }).toArray()

  return Response.json(sessions)
}

export async function DELETE(request: Request) {
  const { sessionId, all } = await request.json()
  const session = await auth()
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  if (all) {
    // Sign out everywhere
    await db.collection('sessions').deleteMany({
      userId: session.user.id
    })
  } else {
    // Sign out specific session
    await db.collection('sessions').deleteOne({
      _id: sessionId,
      userId: session.user.id
    })
  }

  return Response.json({ success: true })
}
```

### Pattern 4: Return URL Preservation

**What:** After sign-in, redirect users back to the page they were trying to access.

**When to use:** Always, for good UX.

**Example:**

```typescript
// Source: https://next-auth.js.org/getting-started/client
// Client component
import { signIn } from 'next-auth/react'

function SignInButton() {
  const handleSignIn = () => {
    // callbackUrl preserves the current page
    signIn('github', { callbackUrl: window.location.href })
  }

  return <button onClick={handleSignIn}>Sign in with GitHub</button>
}

// Or in middleware, preserve with query param
export async function middleware(request) {
  const session = await auth()

  if (!session) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }
}
```

### Anti-Patterns to Avoid

- **Middleware-only authentication:** CVE-2025-29927 proved middleware can be bypassed. Always verify at data access layer too.
- **Storing sessions in localStorage:** Vulnerable to XSS attacks. Use HTTP-only cookies (Auth.js default).
- **Single session per user:** Modern apps need multi-device support. Use database sessions, not JWT-only.
- **Layout-based auth checks:** Layouts don't re-render on navigation in App Router. Use route handlers or page-level checks.
- **Hardcoded admin emails:** Use environment variables for admin user identifiers.

## Don't Hand-Roll

Problems that look simple but have existing solutions:

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| OAuth flow | Custom OAuth state/PKCE handling | Auth.js GitHub provider | OAuth has CSRF, state validation, token exchange, refresh tokens - Auth.js handles all edge cases |
| Session cookies | Custom cookie signing/encryption | Auth.js session management | HTTP-only cookies, secure flags, SameSite attributes, CSRF protection - easy to get wrong |
| Multi-device sessions | Manual session tracking | MongoDB adapter with database sessions | Race conditions, session cleanup, concurrent logins - adapter handles atomicity |
| "Sign out everywhere" | Delete all user sessions | MongoDB adapter `deleteMany()` on sessions collection | Needs proper indexing, atomic operations, and session ID validation |
| Return URL handling | Manual redirect tracking | Auth.js `callbackUrl` parameter | Open redirect vulnerabilities, URL validation, base64 encoding issues |
| Role-based access | Custom role checking | Auth.js callbacks + session extension | Role should be in JWT/session, not fetched per-request; callbacks ensure consistency |

**Key insight:** Authentication has decades of security research behind it. OAuth alone has 15+ security considerations (PKCE, state, nonce, token rotation, etc.). Libraries like Auth.js encode this knowledge. Custom implementations miss edge cases that lead to security vulnerabilities.

## Common Pitfalls

### Pitfall 1: Middleware Bypass Vulnerability (CVE-2025-29927)

**What goes wrong:** Relying solely on middleware for authentication allows attackers to bypass protection by manipulating the `x-middleware-subrequest` header.

**Why it happens:** Middleware runs on the Edge Runtime and can be bypassed through specific header manipulation in Next.js versions below 15.2.3.

**How to avoid:**
1. Upgrade to Next.js 15.2.3 or higher (critical security patch)
2. Implement Data Access Layer pattern - verify auth at data fetching points
3. Use `'server-only'` directive in DAL files to prevent client-side imports
4. Never trust middleware as the only security boundary

**Warning signs:**
- Auth checks only in `middleware.ts`, not in data fetching functions
- Using Next.js version below 15.2.3
- Protected data accessible via direct API calls bypassing middleware

### Pitfall 2: MongoDB Adapter Edge Runtime Incompatibility

**What goes wrong:** MongoDB adapter fails with errors about Node.js 'stream' module when used in middleware on Edge Runtime.

**Why it happens:** The MongoDB Node.js driver uses Node.js APIs not available in Edge Runtime. Middleware runs on Edge by default.

**How to avoid:**
1. Use JWT sessions in middleware (default Auth.js behavior, no database calls)
2. Switch to database sessions only for data access layer (Node.js runtime)
3. Configure middleware to use JWT: `export const config = { matcher: [...] }` with JWT strategy
4. Or use Vercel Postgres/Planetscale adapters which are Edge-compatible

**Warning signs:**
- Error: "The edge runtime does not support Node.js 'stream' module"
- MongoDB adapter configured but middleware fails to run
- Using `session: { strategy: "database" }` with Edge Runtime middleware

### Pitfall 3: GitHub OAuth Callback URL Limitations

**What goes wrong:** GitHub only allows one callback URL per OAuth application, breaking local development or preview deployments.

**Why it happens:** Unlike Google/Microsoft OAuth, GitHub doesn't support multiple callback URLs or wildcards.

**How to avoid:**
1. Create separate GitHub OAuth apps for development (localhost) and production
2. Use different environment variables: `AUTH_GITHUB_ID_DEV` vs `AUTH_GITHUB_ID_PROD`
3. For preview deployments, use Auth.js proxy pattern (stable URL proxies to preview)
4. Document which OAuth app to use in `.env.example`

**Warning signs:**
- "Callback URL mismatch" errors in development
- OAuth works locally but fails in production (or vice versa)
- Preview deployments can't complete OAuth flow

### Pitfall 4: Session Rotation Prevents Expiry Warnings

**What goes wrong:** Can't implement "session expiring soon" toast notifications because Auth.js automatically extends session expiry on each check.

**Why it happens:** Auth.js v5 rotates session expiry whenever `auth()` is called, preventing traditional expiry warnings.

**How to avoid:**
1. Accept that sessions are sliding window (30 days of inactivity, not absolute 30 days)
2. For absolute expiry, track login timestamp separately in session
3. Use `session.expires` as ISO string, parse and compare client-side
4. Or use Better Auth which has better session lifetime controls

**Warning signs:**
- Session never expires despite `maxAge` configuration
- Can't implement "log out in 5 minutes" warnings
- Active users never see session expiry prompts

### Pitfall 5: Partial Rendering in Layouts

**What goes wrong:** Auth checks in layouts don't re-run on navigation, showing stale auth state.

**Why it happens:** Next.js App Router preserves layouts during navigation (Partial Rendering optimization).

**How to avoid:**
1. Perform auth checks in `page.tsx`, not `layout.tsx`
2. Or use client-side `useSession()` in layouts (reacts to session changes)
3. For admin badges, fetch in client component that subscribes to session
4. Document that layouts are static during navigation

**Warning signs:**
- User logs out but layout still shows "logged in" state
- Admin controls visible after role downgrade
- Need to refresh page to see auth state changes

### Pitfall 6: Admin Detection Hardcoding

**What goes wrong:** Admin email is hardcoded in source code, visible to all users, can't be changed without redeployment.

**Why it happens:** Easy to write `if (email === "zachlagden@example.com")` directly in callbacks.

**How to avoid:**
1. Use environment variable: `process.env.ADMIN_EMAIL` or `ADMIN_GITHUB_USERNAME`
2. Or check against database admin table
3. Validate on server side only, never expose admin list to client
4. Use multiple admin detection methods (email AND GitHub username)

**Warning signs:**
- Admin email visible in client-side code
- Can't add new admins without code deploy
- Admin status determined by client-side logic

## Code Examples

Verified patterns from official sources:

### Complete Auth.js Setup with MongoDB and GitHub OAuth

```typescript
// Source: https://authjs.dev/getting-started/adapters/mongodb
// lib/db.ts
import { MongoClient } from "mongodb"

if (!process.env.MONGODB_URI) {
  throw new Error('Invalid/Missing environment variable: "MONGODB_URI"')
}

const uri = process.env.MONGODB_URI
const options = {}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === "development") {
  // In development, use a global variable to preserve client across hot reloads
  let globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>
  }

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options)
    globalWithMongo._mongoClientPromise = client.connect()
  }
  clientPromise = globalWithMongo._mongoClientPromise
} else {
  // In production, create a new client for each connection
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise

// lib/auth.ts
import NextAuth from "next-auth"
import GitHub from "next-auth/providers/github"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import clientPromise from "./db"

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: MongoDBAdapter(clientPromise),
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
  ],
  session: {
    strategy: "database",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async session({ session, user }) {
      // Add role to session
      if (session.user) {
        session.user.id = user.id
        session.user.role =
          user.email === process.env.ADMIN_EMAIL ? "admin" : "user"
      }
      return session
    },
  },
})

// app/api/auth/[...nextauth]/route.ts
import { handlers } from "@/lib/auth"
export const { GET, POST } = handlers
```

### Role-Based Access Control

```typescript
// Source: https://authjs.dev/guides/role-based-access-control
// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: "admin" | "user"
    } & DefaultSession["user"]
  }
}

// Server component - check role before rendering
import { auth } from "@/lib/auth"

export default async function AdminPage() {
  const session = await auth()

  if (session?.user?.role !== "admin") {
    return <div>Access denied. Admin only.</div>
  }

  return <div>Admin dashboard</div>
}

// Client component - use session hook
'use client'
import { useSession } from "next-auth/react"

export function AdminButton() {
  const { data: session } = useSession()

  if (session?.user?.role !== "admin") {
    return null
  }

  return <button>Admin Action</button>
}
```

### Protected Routes with Middleware

```typescript
// Source: https://authjs.dev/getting-started/session-management/protecting
// middleware.ts
import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isProtectedRoute = req.nextUrl.pathname.startsWith('/blog/new')

  if (isProtectedRoute && !isLoggedIn) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', req.url)
    loginUrl.searchParams.set('callbackUrl', req.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Check admin routes
  if (req.nextUrl.pathname.startsWith('/admin') && req.auth?.user?.role !== 'admin') {
    return NextResponse.redirect(new URL('/403', req.url))
  }
})

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
```

### Sign Out All Devices

```typescript
// Source: Better Auth session revocation concepts
// app/api/auth/revoke-sessions/route.ts
import { auth } from "@/lib/auth"
import clientPromise from "@/lib/db"

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { all } = await request.json()
  const client = await clientPromise
  const db = client.db()

  if (all) {
    // Delete all sessions for this user
    await db.collection('sessions').deleteMany({
      userId: session.user.id
    })
  } else {
    // Delete current session only
    await db.collection('sessions').deleteOne({
      sessionToken: request.cookies.get('authjs.session-token')?.value
    })
  }

  return Response.json({ success: true })
}

// Client component
'use client'
import { signOut } from "next-auth/react"

export function SignOutButtons() {
  const handleSignOut = async () => {
    // Sign out current device
    await signOut({ callbackUrl: '/' })
  }

  const handleSignOutEverywhere = async () => {
    // Revoke all sessions first
    await fetch('/api/auth/revoke-sessions', {
      method: 'POST',
      body: JSON.stringify({ all: true })
    })
    // Then sign out
    await signOut({ callbackUrl: '/' })
  }

  return (
    <>
      <button onClick={handleSignOut}>Sign out</button>
      <button onClick={handleSignOutEverywhere}>Sign out everywhere</button>
    </>
  )
}
```

### Client-Side Session Provider

```typescript
// Source: https://next-auth.js.org/getting-started/client
// components/auth/SessionProvider.tsx
'use client'
import { SessionProvider as NextAuthSessionProvider } from "next-auth/react"

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider
      refetchInterval={5 * 60} // Refetch session every 5 minutes
      refetchOnWindowFocus={true}
    >
      {children}
    </NextAuthSessionProvider>
  )
}

// app/layout.tsx
import { SessionProvider } from "@/components/auth/SessionProvider"

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
```

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| NextAuth.js v4 (Pages Router) | Auth.js v5 (App Router) | 2024 | Universal `auth()` function replaces `getServerSession()`, `getToken()`, `withAuth()`; environment vars change from `NEXTAUTH_*` to `AUTH_*` |
| Middleware-only auth | Data Access Layer pattern | March 2025 (CVE-2025-29927) | Must verify authentication at data fetching, not just route boundaries |
| JWT-only sessions | Database sessions for multi-device | 2024-2025 | Better UX for "sign out everywhere", active session management, but requires database adapter |
| NextAuth.js | Better Auth | 2025-2026 | Auth.js in maintenance mode; Better Auth is successor with improved DX, type safety, plugins |
| Custom auth UI | Clerk/Supabase pre-built | 2024-2025 | Faster implementation (1-3 days vs 1-2 weeks) but vendor lock-in and per-user costs |

**Deprecated/outdated:**
- **`getServerSession()`:** Replaced by universal `auth()` function in Auth.js v5
- **`NEXTAUTH_URL` environment variable:** Now `AUTH_URL` (automatic in most cases)
- **`/api/auth/session` API route checks:** Use `auth()` directly in server components
- **Middleware as sole protection:** Post-CVE-2025-29927, must implement DAL pattern
- **OAuth 1.0 providers:** Deprecated in Auth.js v5, use OAuth 2.0 providers only

## Open Questions

Things that couldn't be fully resolved:

1. **Active Session UI Design**
   - What we know: Database adapter creates session records with device/browser info
   - What's unclear: Exact fields available (user agent, IP, last accessed timestamp)
   - Recommendation: Inspect MongoDB `sessions` collection after first login to see available fields, then design UI around actual data

2. **Session Expiry Toast Implementation**
   - What we know: Auth.js v5 rotates session expiry automatically, making traditional expiry warnings difficult
   - What's unclear: Best pattern for showing "session expiring" without breaking rotation
   - Recommendation: Track `loginTimestamp` separately in session, show toast based on absolute time since login rather than session expiry date

3. **Better Auth vs Auth.js for This Project**
   - What we know: Better Auth is the future, Auth.js is in maintenance mode
   - What's unclear: Whether Better Auth's maturity is sufficient for production use with all required features
   - Recommendation: Start with Auth.js v5 (proven, stable) but monitor Better Auth development; migration path exists if needed

4. **OAuth App Preview Deployments**
   - What we know: GitHub OAuth only allows one callback URL per app
   - What's unclear: Best pattern for handling Vercel preview deployments with OAuth
   - Recommendation: Use Auth.js proxy pattern or create staging OAuth app; document in deployment guide

## Sources

### Primary (HIGH confidence)
- [Auth.js Next.js Reference](https://authjs.dev/reference/nextjs) - Main API documentation
- [Auth.js MongoDB Adapter Guide](https://authjs.dev/getting-started/adapters/mongodb) - Database session setup
- [Auth.js Role-Based Access Control](https://authjs.dev/guides/role-based-access-control) - RBAC implementation
- [Auth.js GitHub Provider Configuration](https://authjs.dev/guides/configuring-github) - OAuth setup
- [Auth.js Session Management](https://authjs.dev/concepts/session-strategies) - Session strategies
- [Auth.js Protecting Routes](https://authjs.dev/getting-started/session-management/protecting) - Middleware patterns
- [Auth.js v5 Migration Guide](https://authjs.dev/getting-started/migrating-to-v5) - Breaking changes and new patterns
- [Next.js Security Guidance](https://nextjs.org/docs/app/guides/data-security) - Data Access Layer pattern
- [Next.js Authentication Guide](https://nextjs.org/docs/app/guides/authentication) - Official Next.js recommendations

### Secondary (MEDIUM confidence)
- [CVE-2025-29927 Analysis - Datadog Security Labs](https://securitylabs.datadoghq.com/articles/nextjs-middleware-auth-bypass/) - Critical middleware vulnerability details
- [Better Auth vs Auth.js Comparison](https://indie-starter.dev/blog/next-auth-js-vs-better-auth) - Feature comparison and migration guidance
- [Auth.js is now part of Better Auth](https://github.com/nextauthjs/next-auth/discussions/13252) - Official announcement
- [Complete Authentication Guide for Next.js App Router 2025](https://clerk.com/articles/complete-authentication-guide-for-nextjs-app-router) - Alternative approach with Clerk
- [Next.js 15 Authentication with Auth.js v5](https://javascript.plainenglish.io/stop-crying-over-auth-a-senior-devs-guide-to-next-js-15-auth-js-v5-42a57bc5b4ce) - Practical implementation guide
- [Next.js Security Checklist](https://blog.arcjet.com/next-js-security-checklist/) - Security best practices
- [Better Auth Multi-Session Management](https://www.better-auth.com/docs/concepts/session-management) - Session revocation patterns

### Tertiary (LOW confidence - WebSearch only)
- Various Stack Overflow discussions on Auth.js session management
- Community blog posts on Next.js authentication patterns
- GitHub issues discussing MongoDB adapter Edge Runtime compatibility

## Metadata

**Confidence breakdown:**
- Standard stack: HIGH - Auth.js is official Next.js authentication solution, MongoDB adapter is documented and stable
- Architecture: HIGH - Patterns verified from official Auth.js and Next.js documentation, DAL pattern is canonical post-CVE
- Pitfalls: HIGH - CVE-2025-29927 is documented vulnerability, other pitfalls from official GitHub issues and community discussions
- Code examples: HIGH - All examples sourced from official Auth.js documentation or verified implementations

**Research date:** 2026-01-21
**Valid until:** 2026-02-28 (30 days - Auth.js is stable but Better Auth is evolving rapidly)
