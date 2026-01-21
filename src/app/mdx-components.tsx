import type { MDXComponents } from "mdx/types";

/**
 * Global MDX component overrides
 * These components replace default HTML elements in MDX content
 * @see https://nextjs.org/docs/app/guides/mdx#custom-elements
 */
export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom component mappings for MDX content
    // For now, provide basic passthrough components
    // Will be enhanced in 04-02 with syntax highlighting and styling
    pre: ({ children, ...props }) => (
      <pre {...props} className="overflow-x-auto">
        {children}
      </pre>
    ),
    code: ({ children, ...props }) => (
      <code {...props} className="font-mono">
        {children}
      </code>
    ),
    ...components,
  };
}
