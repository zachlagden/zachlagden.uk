"use client";

import React from "react";
import { parseAsArrayOf, parseAsString, useQueryState } from "nuqs";

interface TechnologyFiltersProps {
  technologies: string[];
}

export function TechnologyFilters({ technologies }: TechnologyFiltersProps) {
  const [selectedTech, setSelectedTech] = useQueryState(
    "tech",
    parseAsArrayOf(parseAsString).withDefault([]),
  );

  const toggleTech = (tech: string) => {
    setSelectedTech((current) =>
      current.includes(tech)
        ? current.filter((t) => t !== tech)
        : [...current, tech],
    );
  };

  const clearFilters = () => setSelectedTech([]);

  const hasActiveFilters = selectedTech.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {technologies.map((tech) => {
          const isActive = selectedTech.includes(tech);
          return (
            <button
              key={tech}
              onClick={() => toggleTech(tech)}
              className={`px-3 py-1.5 text-sm font-medium rounded-full transition-colors ${
                isActive
                  ? "bg-neutral-800 text-white"
                  : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200"
              }`}
              aria-pressed={isActive}
            >
              {tech}
            </button>
          );
        })}
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
        >
          Clear all filters
        </button>
      )}
    </div>
  );
}
