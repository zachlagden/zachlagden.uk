import NextAuth from "next-auth";
import { MongoDBAdapter } from "@auth/mongodb-adapter";
import clientPromise from "./db";
import { authConfig } from "./auth.config";

/**
 * Full Auth.js configuration with MongoDB adapter.
 * This file runs in Node.js runtime and includes database integration.
 */
export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  adapter: MongoDBAdapter(clientPromise),
  events: {
    async signIn({ user, account, profile }) {
      // Update the user record with their GitHub username on every sign-in
      // This ensures existing users get the field populated
      if (account?.provider === "github" && profile && user.id) {
        try {
          const client = await clientPromise;
          const db = client.db();
          const githubProfile = profile as { login?: string };
          if (githubProfile.login) {
            await db
              .collection("users")
              .updateOne(
                { email: user.email },
                { $set: { githubUsername: githubProfile.login } },
              );
          }
        } catch {
          // Non-fatal: admin check will just fail gracefully
        }
      }
    },
  },
});
