"use client";

import React from "react";
import { FileText } from "lucide-react";

interface EmptyStateProps {
  query?: string;
  categories?: string[];
  tags?: string[];
  availableCategories?: string[];
}

export function EmptyState({
  query,
  categories = [],
  tags = [],
  availableCategories = [],
}: EmptyStateProps) {
  const hasFilters = query || categories.length > 0 || tags.length > 0;

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 mb-6 rounded-full bg-neutral-100 dark:bg-neutral-800 flex items-center justify-center">
        <FileText className="w-8 h-8 text-neutral-400" />
      </div>

      <h2 className="text-2xl font-semibold mb-3 text-neutral-900 dark:text-neutral-100">
        {hasFilters ? "No posts found" : "No posts yet"}
      </h2>

      <p className="text-neutral-600 dark:text-neutral-400 mb-6 max-w-md">
        {hasFilters ? (
          <>
            No posts match your filters. Try adjusting your search or explore
            other categories.
          </>
        ) : (
          <>Check back soon for new content!</>
        )}
      </p>

      {/* Show category suggestions if search returned no results */}
      {hasFilters && availableCategories.length > 0 && (
        <div className="mt-4">
          <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
            Try browsing these categories:
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {availableCategories.slice(0, 5).map((category) => (
              <a
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
                className="px-3 py-1.5 text-sm font-medium rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                {category}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
