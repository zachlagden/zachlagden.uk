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
    <div className="flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-zinc-800">
        <FileText className="h-8 w-8 text-zinc-500" aria-hidden="true" />
      </div>

      <h2 className="mb-3 font-heading text-2xl font-semibold text-text-primary">
        {hasFilters ? "No posts found" : "No posts yet"}
      </h2>

      <p className="mb-6 max-w-md text-zinc-400">
        {hasFilters ? (
          <>
            No posts match your filters. Try adjusting your search or explore
            other categories.
          </>
        ) : (
          <>Check back soon for new content!</>
        )}
      </p>

      {hasFilters && availableCategories.length > 0 && (
        <div className="mt-4">
          <p className="mb-3 text-sm text-zinc-500">
            Try browsing these categories:
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {availableCategories.slice(0, 5).map((category) => (
              <a
                key={category}
                href={`/blog?category=${encodeURIComponent(category)}`}
                className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-400 transition-colors hover:border-zinc-600 hover:text-zinc-300"
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
