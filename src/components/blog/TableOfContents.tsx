"use client";

import { useMemo } from "react";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    const regex = /^(#{1,3})\s+(.+)$/gm;
    const items: TocItem[] = [];
    let match;

    while ((match = regex.exec(content)) !== null) {
      items.push({
        id: match[2].toLowerCase().replace(/\s+/g, "-"),
        text: match[2],
        level: match[1].length,
      });
    }

    return items;
  }, [content]);

  if (headings.length < 2) return null;

  return (
    <nav
      className="sticky top-24 p-4 border border-neutral-200 rounded-lg bg-white"
      aria-label="Table of contents"
    >
      <h4 className="text-sm font-heading font-semibold mb-3 text-neutral-900">
        On this page
      </h4>
      <ul className="space-y-1.5">
        {headings.map((heading) => (
          <li key={heading.id}>
            <a
              href={`#${heading.id}`}
              className={`block text-xs text-neutral-500 hover:text-neutral-900 transition-colors ${
                heading.level === 2 ? "pl-0" : heading.level === 3 ? "pl-3" : ""
              }`}
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
