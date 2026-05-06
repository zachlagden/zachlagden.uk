"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";
import { Github } from "lucide-react";

export default function SignInPage() {
  useEffect(() => {
    document.body.classList.remove("intro-locked");
    document.getElementById("initial-loader")?.remove();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-50">
      <div className="max-w-sm w-full mx-4">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-heading font-bold tracking-tight mb-2">
            Sign In
          </h1>
          <p className="text-sm text-neutral-500">
            Sign in with your GitHub account
          </p>
        </div>
        <button
          onClick={() => signIn("github", { callbackUrl: "/" })}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
        >
          <Github className="w-5 h-5" />
          Continue with GitHub
        </button>
      </div>
    </div>
  );
}
