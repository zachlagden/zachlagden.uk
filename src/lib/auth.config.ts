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
      profile(profile) {
        return {
          id: profile.id.toString(),
          name: profile.name || profile.login,
          email: profile.email,
          image: profile.avatar_url,
          // Store GitHub username for admin checks (MongoDB stores extra fields)
          githubUsername: profile.login,
        };
      },
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

        // Determine admin role based on GitHub username stored in user record
        const adminUsername = process.env.ADMIN_GITHUB_USERNAME || "zachlagden";
        const dbUser = user as typeof user & { githubUsername?: string };
        session.user.role =
          dbUser.githubUsername === adminUsername ? "admin" : "user";
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
