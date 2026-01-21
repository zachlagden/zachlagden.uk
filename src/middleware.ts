import NextAuth from "next-auth"
import { authConfig } from "@/lib/auth.config"
import { NextResponse } from "next/server"

const { auth } = NextAuth(authConfig)

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isAdmin = req.auth?.user?.role === "admin"
  const pathname = req.nextUrl.pathname

  // Admin-only routes (blog management - for future phases)
  const adminRoutes = ["/blog/new", "/blog/edit"]
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route))

  if (isAdminRoute && !isAdmin) {
    if (!isLoggedIn) {
      // Not logged in - redirect to home with message
      // (Page will show "sign in required")
      return NextResponse.redirect(new URL("/?auth=required&returnTo=" + encodeURIComponent(pathname), req.url))
    }
    // Logged in but not admin - 403
    return NextResponse.redirect(new URL("/403", req.url))
  }

  return NextResponse.next()
})

export const config = {
  // Match all routes except static files and api/auth
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)",
  ],
}
