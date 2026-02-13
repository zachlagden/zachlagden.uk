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
    parseAsArrayOf(parseAsString).withDefault([])
  );

  const clearFilters = () => setSelectedTech([]);

  if (technologies.length > 0) {
    return (
      <div className="text-center py-16">
        <FolderOpen className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
        <h3 className="text-lg font-semibold text-neutral-900 mb-2">
          No matching projects
        </h3>
        <p className="text-neutral-600 mb-4">
          No projects found with the selected technologies.
        </p>
        <button
          onClick={clearFilters}
          className="text-sm font-medium text-neutral-700 hover:text-neutral-900 underline underline-offset-2"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <FolderOpen className="h-12 w-12 mx-auto text-neutral-400 mb-4" />
      <h3 className="text-lg font-semibold text-neutral-900 mb-2">
        No projects yet
      </h3>
      <p className="text-neutral-600">
        Check back soon for exciting projects!
      </p>
    </div>
  );
}
