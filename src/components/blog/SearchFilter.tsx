"use client";

import React, { useCallback, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";

export function SearchFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("q") || "");

  // Debounced search - 300ms delay
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());

      if (query.trim()) {
        params.set("q", query.trim());
      } else {
        params.delete("q");
      }

      // Preserve other params (category, tag)
      const newUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";
      router.push(newUrl);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, router, searchParams]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  }, []);

  const handleClear = useCallback(() => {
    setQuery("");
  }, []);

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <Search className="h-5 w-5 text-zinc-500" aria-hidden="true" />
      </div>
      <input
        type="search"
        value={query}
        onChange={handleChange}
        placeholder="Search posts..."
        className="w-full rounded-lg border border-zinc-800 bg-zinc-900 py-3 pl-11 pr-10 text-zinc-100 placeholder-zinc-500 transition-colors focus:border-cyan-500/50 focus:outline-none focus:ring-2 focus:ring-cyan-500/20"
        aria-label="Search blog posts"
      />
      {query && (
        <button
          onClick={handleClear}
          className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-500 transition-colors hover:text-zinc-300"
          aria-label="Clear search"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
