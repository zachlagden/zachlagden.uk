"use client";

import { useSession } from "next-auth/react";
import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

interface ProtectedContentProps {
  children: React.ReactNode;
  adminOnly?: boolean;
  fallback?: React.ReactNode;
}

export function ProtectedContent({
  children,
  adminOnly = false,
  fallback,
}: ProtectedContentProps) {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-700 border-t-zinc-300" />
      </div>
    );
  }

  if (!session) {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-zinc-100">
          Sign in required
        </h2>
        <p className="mb-4 text-zinc-400">
          Please sign in to access this content.
        </p>
        <button
          onClick={() =>
            signIn("github", { callbackUrl: window.location.href })
          }
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2",
            "bg-zinc-100",
            "text-zinc-900",
            "hover:bg-zinc-200",
            "transition-colors",
          )}
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  if (adminOnly && session.user.role !== "admin") {
    if (fallback) return <>{fallback}</>;

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="mb-2 text-xl font-semibold text-zinc-100">
          Access denied
        </h2>
        <p className="text-zinc-400">
          You don&apos;t have permission to access this content.
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
