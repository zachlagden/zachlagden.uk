"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Build a windowed page list with `…` truncation. Always include first and
// last; show current ± 1 around the middle.
function buildPageList(page: number, totalPages: number): Array<number | "…"> {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: Array<number | "…"> = [1];
  const left = Math.max(2, page - 1);
  const right = Math.min(totalPages - 1, page + 1);

  if (left > 2) items.push("…");
  for (let p = left; p <= right; p++) items.push(p);
  if (right < totalPages - 1) items.push("…");

  items.push(totalPages);
  return items;
}

export default function BlogPagination({
  page,
  totalPages,
  onPageChange,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const items = buildPageList(page, totalPages);

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      {items.map((item, idx) =>
        item === "…" ? (
          <span
            key={`gap-${idx}`}
            aria-hidden="true"
            className="w-10 h-10 flex items-center justify-center text-sm text-neutral-400"
          >
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item)}
            aria-current={item === page ? "page" : undefined}
            className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
              item === page
                ? "bg-neutral-900 text-white"
                : "border border-neutral-200 text-neutral-600 hover:border-neutral-300"
            }`}
          >
            {item}
          </button>
        ),
      )}
      <button
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        className="p-2 rounded-lg border border-neutral-200 text-neutral-600 hover:border-neutral-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Next page"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
