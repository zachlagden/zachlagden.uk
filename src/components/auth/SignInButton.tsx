"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { LogIn, LogOut, Settings } from "lucide-react";
import Image from "next/image";

export default function SignInButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="fixed top-4 right-4 z-50 hidden lg:block">
        <div className="w-10 h-10 rounded-full bg-neutral-100 animate-pulse" />
      </div>
    );
  }

  if (session?.user) {
    return (
      <div className="fixed top-4 right-4 z-50 hidden lg:flex items-center gap-2">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md px-3 py-1.5">
          {session.user.image && (
            <Image
              src={session.user.image}
              alt={session.user.name || "User avatar"}
              width={28}
              height={28}
              className="rounded-full"
            />
          )}
          <span className="text-xs font-medium text-neutral-700 max-w-[100px] truncate">
            {session.user.name}
          </span>
          {session.user.isAdmin && (
            <Link
              href="/admin"
              className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              aria-label="Admin panel"
            >
              <Settings className="w-4 h-4" />
            </Link>
          )}
          <button
            onClick={() => signOut()}
            className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors rounded-full focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
            aria-label="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 z-50 hidden lg:block">
      <button
        onClick={() => signIn("github")}
        className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md px-4 py-2 text-xs font-medium text-neutral-700 hover:text-neutral-900 transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
        aria-label="Sign in with GitHub"
      >
        <LogIn className="w-4 h-4" />
        Sign In
      </button>
    </div>
  );
}
