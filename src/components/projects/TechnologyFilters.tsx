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
    <div className="flex flex-wrap items-center gap-2">
      {technologies.map((tech) => {
        const isActive = selectedTech.includes(tech);
        return (
          <button
            key={tech}
            onClick={() => toggleTech(tech)}
            className={`rounded-full border px-3 py-1.5 text-sm font-medium transition-colors ${
              isActive
                ? "border-cyan-500/50 bg-cyan-500/10 text-cyan-400"
                : "border-zinc-700 bg-zinc-800 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300"
            }`}
            aria-pressed={isActive}
          >
            {tech}
          </button>
        );
      })}

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="ml-2 text-sm text-zinc-500 transition-colors hover:text-cyan-500"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}
