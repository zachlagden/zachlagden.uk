"use client";

import { useState, useEffect, useRef } from "react";
import { Search } from "lucide-react";

interface BlogSearchProps {
  onSearch: (query: string) => void;
  defaultValue?: string;
}

export default function BlogSearch({
  onSearch,
  defaultValue = "",
}: BlogSearchProps) {
  const [value, setValue] = useState(defaultValue);
  const isFirstRunRef = useRef(true);

  useEffect(() => {
    // Skip the initial fire — the parent already has SSR data for the
    // default query. Only debounce-trigger onSearch on actual user input.
    if (isFirstRunRef.current) {
      isFirstRunRef.current = false;
      return;
    }
    const timer = setTimeout(() => onSearch(value), 300);
    return () => clearTimeout(timer);
  }, [value, onSearch]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
      <input
        type="text"
        placeholder="Search posts..."
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-neutral-900 focus:border-transparent transition-shadow"
      />
    </div>
  );
}
