"use client";

import Link from "next/link";

interface BlogTagBadgeProps {
  tag: string;
  href?: string;
  active?: boolean;
}

export default function BlogTagBadge({
  tag,
  href,
  active = false,
}: BlogTagBadgeProps) {
  const className = `inline-block px-3 py-1 text-xs font-medium rounded-full transition-colors ${
    active
      ? "bg-neutral-900 text-white"
      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
  }`;

  if (href) {
    return (
      <Link href={href} className={className}>
        {tag}
      </Link>
    );
  }

  return <span className={className}>{tag}</span>;
}
