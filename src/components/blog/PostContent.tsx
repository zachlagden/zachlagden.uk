import { cn } from "@/lib/utils";

interface PostContentProps {
  children: React.ReactNode;
  className?: string;
}

export function PostContent({ children, className }: PostContentProps) {
  return (
    <article
      className={cn(
        "prose prose-invert max-w-none",
        // Headings
        "prose-headings:font-heading prose-headings:font-bold prose-headings:tracking-tight",
        "prose-h1:text-4xl prose-h1:mb-4",
        "prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-zinc-800 prose-h2:pb-2",
        "prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3",
        "prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-2",
        // Paragraphs
        "prose-p:text-zinc-300",
        "prose-p:leading-relaxed",
        // Links
        "prose-a:text-cyan-500",
        "prose-a:underline prose-a:decoration-cyan-500/40",
        "prose-a:underline-offset-2",
        "hover:prose-a:decoration-cyan-500",
        "prose-a:transition-colors",
        // Lists
        "prose-ul:my-6 prose-ol:my-6",
        "prose-li:text-zinc-300",
        "prose-li:my-2",
        // Blockquotes
        "prose-blockquote:border-l-4 prose-blockquote:border-cyan-500/40",
        "prose-blockquote:pl-4 prose-blockquote:italic",
        "prose-blockquote:text-zinc-400",
        // Code (inline)
        "prose-code:text-sm prose-code:font-mono",
        "prose-code:bg-zinc-800",
        "prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded",
        "prose-code:text-zinc-200",
        "prose-code:before:content-none prose-code:after:content-none",
        // Tables
        "prose-table:border-collapse prose-table:w-full",
        "prose-th:border prose-th:border-zinc-700",
        "prose-th:bg-zinc-800",
        "prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:text-zinc-200",
        "prose-td:border prose-td:border-zinc-700",
        "prose-td:px-4 prose-td:py-2 prose-td:text-zinc-300",
        // Images
        "prose-img:rounded-lg prose-img:border prose-img:border-zinc-800",
        // HR
        "prose-hr:border-zinc-800",
        // Strong
        "prose-strong:text-zinc-100",
        className,
      )}
    >
      {children}
    </article>
  );
}
