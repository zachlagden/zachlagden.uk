"use client";

import React from "react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";
import { FolderOpen } from "lucide-react";

interface EmptyStateProps {
  technologies: string[];
}

export function EmptyState({ technologies }: EmptyStateProps) {
  const [, setSelectedTech] = useQueryState(
    "tech",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const clearFilters = () => setSelectedTech([]);

  if (technologies.length > 0) {
    return (
      <div className="py-16 text-center">
        <FolderOpen
          className="mx-auto mb-4 h-12 w-12 text-zinc-600"
          aria-hidden="true"
        />
        <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
          No matching projects
        </h3>
        <p className="mb-4 text-zinc-400">
          No projects found with the selected technologies.
        </p>
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-zinc-400 underline underline-offset-2 transition-colors hover:text-cyan-500"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="py-16 text-center">
      <FolderOpen
        className="mx-auto mb-4 h-12 w-12 text-zinc-600"
        aria-hidden="true"
      />
      <h3 className="mb-2 font-heading text-lg font-semibold text-text-primary">
        No projects yet
      </h3>
      <p className="text-zinc-400">Check back soon for exciting projects!</p>
    </div>
  );
}
