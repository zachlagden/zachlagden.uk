"use client";

import { useSession } from "next-auth/react";
import { SignInButton } from "./SignInButton";
import { UserMenu } from "./UserMenu";

export function AuthStatus() {
  const { data: session, status } = useSession();

  // Don't render anything while loading to prevent flash
  if (status === "loading") {
    return (
      <div className="fixed top-6 right-6 z-50">
        <div className="h-10 w-32 animate-pulse rounded-full bg-zinc-700/30 backdrop-blur-md" />
      </div>
    );
  }

  if (session) {
    return <UserMenu />;
  }

  return <SignInButton />;
}
