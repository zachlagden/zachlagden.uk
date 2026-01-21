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

  const activeCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];
  const activeTags = searchParams.get("tag")?.split(",").filter(Boolean) || [];

  const toggleFilter = useCallback(
    (type: "category" | "tag", value: string) => {
      const params = new URLSearchParams(searchParams.toString());

      const current = params.get(type)?.split(",").filter(Boolean) || [];
      const isActive = current.includes(value);

      if (isActive) {
        // Remove from active filters
        const updated = current.filter((v) => v !== value);
        if (updated.length > 0) {
          params.set(type, updated.join(","));
        } else {
          params.delete(type);
        }
      } else {
        // Add to active filters
        const updated = [...current, value];
        params.set(type, updated.join(","));
      }

      const newUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";
      router.push(newUrl);
    },
    [router, searchParams]
  );

  const clearAllFilters = useCallback(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete("category");
    params.delete("tag");

    const newUrl = params.toString() ? `/blog?${params.toString()}` : "/blog";
    router.push(newUrl);
  }, [router, searchParams]);

  const hasActiveFilters = activeCategories.length > 0 || activeTags.length > 0;

  return (
    <div className="space-y-4">
      {/* Categories */}
      {categories.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Categories
          </h3>
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => {
              const isActive = activeCategories.includes(category);
              return (
                <button
                  key={category}
                  onClick={() => toggleFilter("category", category)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    isActive
                      ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                  aria-pressed={isActive}
                >
                  {category}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <h3 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
            Tags
          </h3>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => {
              const isActive = activeTags.includes(tag);
              return (
                <button
                  key={tag}
                  onClick={() => toggleFilter("tag", tag)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                    isActive
                      ? "bg-neutral-800 dark:bg-neutral-200 text-white dark:text-neutral-900"
                      : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                  }`}
                  aria-pressed={isActive}
                >
                  #{tag}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Clear All Filters */}
      {hasActiveFilters && (
        <button
          onClick={clearAllFilters}
          className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
