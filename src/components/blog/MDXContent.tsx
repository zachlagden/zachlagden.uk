import { MDXRemote } from 'next-mdx-remote/rsc'
import { CodeBlock } from '@/components/syntax/CodeBlock'
import rehypeHighlight from 'rehype-highlight'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

interface MDXContentProps {
  content: string
}

// Custom components for MDX rendering
const components = {
  pre: ({ children }: { children?: React.ReactNode }) => {
    // Extract the code element from pre
    const codeElement = children as React.ReactElement<{
      className?: string
      children?: React.ReactNode
    }>

    if (codeElement?.props) {
      return (
        <CodeBlock className={codeElement.props.className}>
          {codeElement.props.children}
        </CodeBlock>
      )
    }

    return <pre>{children}</pre>
  },
}

export async function MDXContent({ content }: MDXContentProps) {
  return (
    <MDXRemote
      source={content}
      components={components}
      options={{
        mdxOptions: {
          rehypePlugins: [
            rehypeHighlight,  // Syntax highlighting
            rehypeSlug,       // Add IDs to headings for TOC links
            [
              rehypeAutolinkHeadings, // Add clickable links to headings
              {
                behavior: 'wrap', // Wrap heading text in anchor
                properties: {
                  className: ['heading-link'],
                },
              },
            ],
          ],
        },
      }}
    />
  )
}
