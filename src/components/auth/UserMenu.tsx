"use client"

import { useState, useRef, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { cn } from "@/lib/utils"

export function UserMenu() {
  const { data: session } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!session?.user) return null

  const isAdmin = session.user.role === "admin"

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" })
  }

  const handleSignOutEverywhere = async () => {
    // Will call API route created in later plan
    // Gracefully fails if route doesn't exist yet
    try {
      await fetch("/api/auth/sessions", {
        method: "DELETE",
        body: JSON.stringify({ all: true }),
      })
    } catch (error) {
      console.log("Sign out everywhere API not yet available")
    }
    signOut({ callbackUrl: "/" })
  }

  return (
    <div className="fixed top-6 right-6 z-50" ref={menuRef}>
      {/* Trigger - Avatar + Name */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 rounded-full",
          "bg-white/30 dark:bg-gray-900/30",
          "backdrop-blur-md",
          "hover:bg-white/50 dark:hover:bg-gray-900/50",
          "transition-colors duration-150"
        )}
      >
        <div className="relative">
          <img
            src={session.user.image || "/placeholder-avatar.png"}
            alt={session.user.name || "User"}
            className="h-8 w-8 rounded-full"
          />
          {isAdmin && (
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-amber-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
              <span className="text-[8px] text-white font-bold">A</span>
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
          {session.user.name}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className={cn(
          "absolute top-full right-0 mt-2 w-48",
          "bg-white/80 dark:bg-gray-900/80",
          "backdrop-blur-md rounded-lg",
          "shadow-lg dark:shadow-white/5",
          "border border-neutral-200/50 dark:border-neutral-700/50",
          "py-1"
        )}>
          {/* User info */}
          <div className="px-3 py-2 border-b border-neutral-200/50 dark:border-neutral-700/50">
            <p className="text-sm font-medium text-neutral-800 dark:text-neutral-200">
              {session.user.name}
            </p>
            <p className="text-xs text-neutral-500 dark:text-neutral-400">
              {session.user.email}
            </p>
            {isAdmin && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-200 rounded">
                Admin
              </span>
            )}
          </div>

          {/* Menu items */}
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50"
          >
            Sign out
          </button>
          <button
            onClick={handleSignOutEverywhere}
            className="w-full px-3 py-2 text-left text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100/50 dark:hover:bg-neutral-800/50"
          >
            Sign out everywhere
          </button>
        </div>
      )}
    </div>
  )
}
