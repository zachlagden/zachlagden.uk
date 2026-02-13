"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface CodeBlockProps {
  children: React.ReactNode;
  className?: string;
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  // Extract language from className (e.g., "language-typescript" -> "typescript")
  const language =
    className
      ?.split(" ")
      .find((c) => c.startsWith("language-"))
      ?.replace("language-", "") ?? "text";

  const handleCopy = async () => {
    const text =
      typeof children === "string"
        ? children
        : ((children as React.ReactElement<{ children?: string }>)?.props
            ?.children ?? "");

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group relative my-4">
      {/* Language badge */}
      <div className="absolute right-0 top-0 rounded-bl-lg rounded-tr-lg border-b border-l border-zinc-700 bg-zinc-800 px-3 py-1 font-mono text-xs text-zinc-500">
        {language}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute right-2 top-8 rounded bg-zinc-700 px-2 py-1 text-xs text-zinc-300 opacity-0 transition-opacity hover:bg-zinc-600 group-hover:opacity-100"
        aria-label="Copy code"
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      {/* Code block */}
      <pre
        className={cn(
          "overflow-x-auto rounded-lg border",
          "bg-zinc-900",
          "border-zinc-800",
          "p-4 pt-8",
          "text-sm font-mono",
          className,
        )}
      >
        <code className={className}>{children}</code>
      </pre>
    </div>
  );
}
