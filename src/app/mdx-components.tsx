import type { MDXComponents } from "mdx/types";
import { CodeBlock } from "@/components/syntax/CodeBlock";

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom code block with syntax highlighting
    pre: ({ children }) => {
      // Extract className from the code element inside pre
      const codeElement = children as React.ReactElement<{
        className?: string;
        children?: React.ReactNode;
      }>;
      const className = codeElement?.props?.className;

      return (
        <CodeBlock className={className}>
          {codeElement?.props?.children}
        </CodeBlock>
      );
    },

    // Inline code styling
    code: ({ children, className, ...props }) => {
      // If inside a pre (has language class), let pre handle it
      if (className?.includes("language-")) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }

      // Inline code
      return (
        <code
          className="rounded bg-zinc-800 px-1.5 py-0.5 font-mono text-sm text-zinc-200"
          {...props}
        >
          {children}
        </code>
      );
    },

    // Pass through other components
    ...components,
  };
}
