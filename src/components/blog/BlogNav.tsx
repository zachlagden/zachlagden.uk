"use client";

import Link from "next/link";
import { ArrowLeft, Rss } from "lucide-react";

interface BlogNavProps {
  showBackToHome?: boolean;
}

export default function BlogNav({ showBackToHome = true }: BlogNavProps) {
  return (
    <nav className="border-b border-neutral-200 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 xl:px-0 flex items-center justify-between h-14">
        <div className="flex items-center gap-4">
          {showBackToHome && (
            <Link
              href="/"
              className="flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Home
            </Link>
          )}
          <Link
            href="/blog"
            className="text-sm font-heading font-bold tracking-tight"
          >
            Blog
          </Link>
        </div>
        <Link
          href="/blog/feed.xml"
          className="p-2 text-neutral-400 hover:text-neutral-700 transition-colors rounded-lg"
          aria-label="RSS Feed"
        >
          <Rss className="w-4 h-4" />
        </Link>
      </div>
    </nav>
  );
}
