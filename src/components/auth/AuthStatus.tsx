"use client"

import { useSession } from "next-auth/react"
import { SignInButton } from "./SignInButton"
import { UserMenu } from "./UserMenu"

export function AuthStatus() {
  const { data: session, status } = useSession()

  // Don't render anything while loading to prevent flash
  if (status === "loading") {
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className="h-10 w-32 rounded-full bg-white/30 dark:bg-gray-900/30 backdrop-blur-md animate-pulse" />
      </div>
    )
  }

  if (session) {
    return <UserMenu />
  }

  return <SignInButton />
}
