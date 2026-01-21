"use client"

import { useSession } from "next-auth/react"
import { signIn } from "next-auth/react"
import { cn } from "@/lib/utils"

interface ProtectedContentProps {
  children: React.ReactNode
  adminOnly?: boolean
  fallback?: React.ReactNode
}

export function ProtectedContent({
  children,
  adminOnly = false,
  fallback,
}: ProtectedContentProps) {
  const { data: session, status } = useSession()

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-200 border-t-neutral-800 dark:border-neutral-700 dark:border-t-neutral-200" />
      </div>
    )
  }

  if (!session) {
    if (fallback) return <>{fallback}</>

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
          Sign in required
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400 mb-4">
          Please sign in to access this content.
        </p>
        <button
          onClick={() => signIn("github", { callbackUrl: window.location.href })}
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-lg",
            "bg-neutral-900 dark:bg-neutral-100",
            "text-white dark:text-neutral-900",
            "hover:bg-neutral-800 dark:hover:bg-neutral-200",
            "transition-colors"
          )}
        >
          Sign in with GitHub
        </button>
      </div>
    )
  }

  if (adminOnly && session.user.role !== "admin") {
    if (fallback) return <>{fallback}</>

    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-xl font-semibold text-neutral-800 dark:text-neutral-200 mb-2">
          Access denied
        </h2>
        <p className="text-neutral-600 dark:text-neutral-400">
          You don&apos;t have permission to access this content.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
