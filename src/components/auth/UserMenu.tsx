"use client";

import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!session?.user) return null;

  const isAdmin = session.user.role === "admin";

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  const handleSignOutEverywhere = async () => {
    try {
      await fetch("/api/auth/sessions", {
        method: "DELETE",
        body: JSON.stringify({ all: true }),
      });
    } catch {
      console.log("Sign out everywhere API not yet available");
    }
    signOut({ callbackUrl: "/" });
  };

  return (
    <div className="fixed right-6 top-6 z-50" ref={menuRef}>
      {/* Trigger - Avatar + Name */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 rounded-full px-3 py-2",
          "bg-zinc-800/80",
          "backdrop-blur-md",
          "hover:bg-zinc-700/80",
          "transition-colors duration-150",
        )}
      >
        <div className="relative">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={session.user.image || "/placeholder-avatar.png"}
            alt={session.user.name || "User"}
            className="h-8 w-8 rounded-full"
          />
          {isAdmin && (
            <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-zinc-900 bg-cyan-500">
              <span className="text-[8px] font-bold text-zinc-950">A</span>
            </span>
          )}
        </div>
        <span className="text-sm font-medium text-zinc-200">
          {session.user.name}
        </span>
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 top-full mt-2 w-48",
            "bg-zinc-800/80",
            "rounded-lg backdrop-blur-md",
            "shadow-lg",
            "border border-zinc-700/50",
            "py-1",
          )}
        >
          {/* User info */}
          <div className="border-b border-zinc-700/50 px-3 py-2">
            <p className="text-sm font-medium text-zinc-200">
              {session.user.name}
            </p>
            <p className="text-xs text-zinc-400">{session.user.email}</p>
            {isAdmin && (
              <span className="mt-1 inline-block rounded bg-cyan-500/10 px-2 py-0.5 text-xs text-cyan-400">
                Admin
              </span>
            )}
          </div>

          {/* Menu items */}
          <button
            onClick={handleSignOut}
            className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700/50"
          >
            Sign out
          </button>
          <button
            onClick={handleSignOutEverywhere}
            className="w-full px-3 py-2 text-left text-sm text-zinc-300 hover:bg-zinc-700/50"
          >
            Sign out everywhere
          </button>
        </div>
      )}
    </div>
  );
}
