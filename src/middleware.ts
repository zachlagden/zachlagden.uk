import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Lightweight middleware for route protection.
 *
 * Note: We don't use NextAuth in middleware because:
 * - Edge runtime can't use MongoDB adapter
 * - Database sessions require the adapter
 * - Server-side DAL provides the real security layer
 *
 * This middleware just handles redirects for known protected routes.
 * Actual auth validation happens server-side in the DAL.
 */
export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  // Admin-only routes (blog management - for future phases)
  const adminRoutes = ["/blog/new", "/blog/edit"]
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  // For admin routes, we let the server-side page handle auth checking
  // The DAL will verify the session and redirect/show 403 as needed
  // This middleware is just a placeholder for future enhancements

  return NextResponse.next()
}

export const config = {
  // Match all routes except static files and api/auth
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}
