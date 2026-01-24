import React from "react";

// Technology-specific colors (common technologies)
const TECH_COLORS: Record<string, string> = {
  // Languages
  TypeScript: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  JavaScript: "bg-yellow-500/10 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-300",
  Python: "bg-green-500/10 text-green-700 dark:bg-green-500/20 dark:text-green-300",
  Rust: "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",
  Go: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",

  // Frameworks
  React: "bg-cyan-500/10 text-cyan-700 dark:bg-cyan-500/20 dark:text-cyan-300",
  "Next.js": "bg-neutral-900/10 text-neutral-900 dark:bg-neutral-100/20 dark:text-neutral-100",
  Vue: "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300",
  Svelte: "bg-orange-500/10 text-orange-700 dark:bg-orange-500/20 dark:text-orange-300",

  // Backend/DB
  Node: "bg-green-600/10 text-green-700 dark:bg-green-600/20 dark:text-green-300",
  MongoDB: "bg-green-600/10 text-green-700 dark:bg-green-600/20 dark:text-green-300",
  PostgreSQL: "bg-blue-600/10 text-blue-700 dark:bg-blue-600/20 dark:text-blue-300",
  Redis: "bg-red-500/10 text-red-700 dark:bg-red-500/20 dark:text-red-300",

  // Tools
  Docker: "bg-blue-500/10 text-blue-700 dark:bg-blue-500/20 dark:text-blue-300",
  Tailwind: "bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
  "Tailwind CSS": "bg-teal-500/10 text-teal-700 dark:bg-teal-500/20 dark:text-teal-300",
};

// Default color for technologies not in the map
const DEFAULT_COLOR = "bg-neutral-100 text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300";

interface TechnologyBadgeProps {
  technology: string;
  className?: string;
}

export function TechnologyBadge({ technology, className = "" }: TechnologyBadgeProps) {
  const colorClass = TECH_COLORS[technology] || DEFAULT_COLOR;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClass} ${className}`}
    >
      {technology}
    </span>
  );
}
