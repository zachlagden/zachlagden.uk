import type { NextAuthConfig } from "next-auth";
import GitHub from "next-auth/providers/github";

/**
 * Shared auth configuration for Edge runtime compatibility.
 * This file is used by middleware which runs on Edge runtime,
 * so it CANNOT import MongoDB or other Node.js-specific modules.
 */
export const authConfig = {
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
      // Add user ID to session
      if (session.user) {
        session.user.id = user.id;

        // Determine admin role based on GitHub username
        const adminUsername = process.env.ADMIN_GITHUB_USERNAME || "zachlagden";
        session.user.role = user.name === adminUsername ? "admin" : "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
