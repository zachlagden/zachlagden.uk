import NextAuth from "next-auth";
import GitHub from "next-auth/providers/github";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import getClientPromise from "./mongodb";

function getAdminUsernames(): string[] {
  const raw = process.env.ADMIN_GITHUB_USERNAME || "";
  return raw
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

function getAdapter() {
  try {
    return MongoDBAdapter(getClientPromise());
  } catch {
    return undefined;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: getAdapter(),
  providers: [GitHub],
  callbacks: {
    async jwt({ token, profile }) {
      if (profile) {
        const username = (profile as { login?: string }).login || "";
        token.githubUsername = username;
        token.isAdmin = getAdminUsernames().includes(username.toLowerCase());
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.githubUsername = token.githubUsername as
          | string
          | undefined;
        session.user.isAdmin = token.isAdmin as boolean | undefined;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
  },
});
