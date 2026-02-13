"use client";

import React, { useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

interface CategoryPillsProps {
  categories: string[];
  tags: string[];
}

export function CategoryPills({ categories, tags }: CategoryPillsProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeCategories =
    searchParams.get("category")?.split(",").filter(Boolean) || [];
  const activeTags = searchParams.get("tag")?.split(",").filter(Boolean) || [];

  const toggleFilter = useCallback(
    (type: "category" | "tag", value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      const current = params.get(type)?.split(",").filter(Boolean) || [];
      const isActive = current.includes(value);

      if (isActive) {
        const updated = current.filter((v) => v !== value);
        if (updated.length > 0) {
          params.set(type, updated.join(","));
        } else {
          params.delete(type);
        }
      } else {
        const updated = [...current, value];
        params.set(type, updated.join(","));
      }

      const newUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";
      router.push(newUrl);
    },
    [router, searchParams],
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("tag");

    const newUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";
    router.push(newUrl);
  }, [router, searchParams]);

  const hasActiveFilters = activeCategories.length > 0 || activeTags.length > 0;

  if (categories.length === 0 && tags.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Categories */}
      {categories.map((category) => {
        const isActive = activeCategories.includes(category);
        return (
          <button
            key={`cat-${category}`}
            onClick={() => toggleFilter("category", category)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
            }`}
            aria-pressed={isActive}
          >
            {category}
          </button>
        );
      })}

      {/* Tags */}
      {tags.map((tag) => {
        const isActive = activeTags.includes(tag);
        return (
          <button
            key={`tag-${tag}`}
            onClick={() => toggleFilter("tag", tag)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
            }`}
            aria-pressed={isActive}
          >
            #{tag}
          </button>
        );
      })}

      {/* Clear All */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="ml-2 text-sm text-zinc-500 transition-colors hover:text-cyan-500"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
