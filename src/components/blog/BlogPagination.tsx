"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

interface BlogPaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function BlogPagination({
  page,
  totalPages,
  onPageChange,
}: BlogPaginationProps) {
  if (totalPages <= 1) return null;

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
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
            p === page
              ? "bg-neutral-900 text-white"
              : "border border-neutral-200 text-neutral-600 hover:border-neutral-300"
          }`}
        >
          {p}
        </button>
      ))}
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
