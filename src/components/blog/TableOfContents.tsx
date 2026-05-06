"use client";

import { useMemo } from "react";
import GithubSlugger from "github-slugger";

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
}

// Strip basic markdown emphasis from heading text so the rendered TOC
// label matches what readers see. Slug derivation uses the cleaned text
// too — github-slugger normalizes punctuation but not bold/italic markers.
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/\*(.+?)\*/g, "$1")
    .replace(/`(.+?)`/g, "$1")
    .replace(/_(.+?)_/g, "$1")
    .replace(/\[(.+?)\]\([^)]*\)/g, "$1")
    .trim();
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const headings = useMemo(() => {
    // Match the same rehype-slug + github-slugger algorithm used by
    // MarkdownRenderer so #anchors stay in sync.
    const slugger = new GithubSlugger();
    const items: TocItem[] = [];

    for (const match of content.matchAll(/^(#{1,3})\s+(.+)$/gm)) {
      const text = stripInlineMarkdown(match[2]);
      items.push({
        id: slugger.slug(text),
        text,
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
        {headings.map((heading, idx) => (
          <li key={`${heading.id}-${idx}`}>
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
