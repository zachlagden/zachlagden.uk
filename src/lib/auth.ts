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
});
