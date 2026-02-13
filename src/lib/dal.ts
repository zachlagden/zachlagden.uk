import "server-only";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

/**
 * Verify user is authenticated. Use in server components and API routes.
 * @returns User session with id and role
 * @throws Redirects to home if not authenticated
 */
export async function verifySession() {
  const session = await auth();

  if (!session?.user) {
    redirect("/?auth=required");
  }

  return {
    userId: session.user.id,
    role: session.user.role,
    user: session.user,
  };
}

/**
 * Verify user is admin. Use for admin-only data access.
 * @returns User session with admin role confirmed
 * @throws Error if not admin (403)
 */
export async function requireAdmin() {
  const { user, role } = await verifySession();

  if (role !== "admin") {
    throw new Error("Unauthorized: Admin access required");
  }

  return { user, role };
}

/**
 * Get current session without throwing. Use when you need to check auth optionally.
 * @returns Session or null
 */
export async function getOptionalSession() {
  return await auth();
}
