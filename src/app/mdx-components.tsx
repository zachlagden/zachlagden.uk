import type { MDXComponents } from 'mdx/types'
import { CodeBlock } from '@/components/syntax/CodeBlock'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Custom code block with syntax highlighting
    pre: ({ children }) => {
      // Extract className from the code element inside pre
      const codeElement = children as React.ReactElement<{ className?: string, children?: React.ReactNode }>
      const className = codeElement?.props?.className

      return (
        <CodeBlock className={className}>
          {codeElement?.props?.children}
        </CodeBlock>
      )
    },

    // Inline code styling
    code: ({ children, className, ...props }) => {
      // If inside a pre (has language class), let pre handle it
      if (className?.includes('language-')) {
        return <code className={className} {...props}>{children}</code>
      }

      // Inline code
      return (
        <code
          className="px-1.5 py-0.5 rounded bg-neutral-100 text-sm font-mono text-neutral-800"
          {...props}
        >
          {children}
        </code>
      )
    },

    // Pass through other components
    ...components,
  }
}
