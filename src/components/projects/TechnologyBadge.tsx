import React from "react";

// Technology-specific colors (common technologies)
const TECH_COLORS: Record<string, string> = {
  // Languages
  TypeScript: "bg-blue-500/10 text-blue-700",
  JavaScript: "bg-yellow-500/10 text-yellow-700",
  Python: "bg-green-500/10 text-green-700",
  Rust: "bg-orange-500/10 text-orange-700",
  Go: "bg-cyan-500/10 text-cyan-700",

  // Frameworks
  React: "bg-cyan-500/10 text-cyan-700",
  "Next.js": "bg-neutral-900/10 text-neutral-900",
  Vue: "bg-emerald-500/10 text-emerald-700",
  Svelte: "bg-orange-500/10 text-orange-700",

  // Backend/DB
  Node: "bg-green-600/10 text-green-700",
  MongoDB: "bg-green-600/10 text-green-700",
  PostgreSQL: "bg-blue-600/10 text-blue-700",
  Redis: "bg-red-500/10 text-red-700",

  // Tools
  Docker: "bg-blue-500/10 text-blue-700",
  Tailwind: "bg-teal-500/10 text-teal-700",
  "Tailwind CSS": "bg-teal-500/10 text-teal-700",
};

// Default color for technologies not in the map
const DEFAULT_COLOR = "bg-neutral-100 text-neutral-700";

interface TechnologyBadgeProps {
  technology: string;
  className?: string;
}

export function TechnologyBadge({
  technology,
  className = "",
}: TechnologyBadgeProps) {
  const colorClass = TECH_COLORS[technology] || DEFAULT_COLOR;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 text-xs font-medium rounded-full ${colorClass} ${className}`}
    >
      {technology}
    </span>
  );
}
