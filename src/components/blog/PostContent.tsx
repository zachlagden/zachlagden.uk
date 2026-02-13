import { cn } from '@/lib/utils'

interface PostContentProps {
  children: React.ReactNode
  className?: string
}

export function PostContent({ children, className }: PostContentProps) {
  return (
    <article
      className={cn(
        'prose prose-neutral max-w-none',
        // Headings
        'prose-headings:font-bold prose-headings:tracking-tight',
        'prose-h1:text-4xl prose-h1:mb-4',
        'prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-4 prose-h2:border-b prose-h2:border-neutral-200 prose-h2:pb-2',
        'prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-3',
        'prose-h4:text-xl prose-h4:mt-6 prose-h4:mb-2',
        // Paragraphs
        'prose-p:text-neutral-700',
        'prose-p:leading-relaxed',
        // Links
        'prose-a:text-neutral-900',
        'prose-a:underline prose-a:decoration-neutral-400',
        'prose-a:underline-offset-2',
        'hover:prose-a:decoration-neutral-600',
        'prose-a:transition-colors',
        // Lists
        'prose-ul:my-6 prose-ol:my-6',
        'prose-li:text-neutral-700',
        'prose-li:my-2',
        // Blockquotes
        'prose-blockquote:border-l-4 prose-blockquote:border-neutral-300',
        'prose-blockquote:pl-4 prose-blockquote:italic',
        'prose-blockquote:text-neutral-600',
        // Code (inline)
        'prose-code:text-sm prose-code:font-mono',
        'prose-code:bg-neutral-100',
        'prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded',
        'prose-code:text-neutral-900',
        'prose-code:before:content-none prose-code:after:content-none',
        // Tables
        'prose-table:border-collapse prose-table:w-full',
        'prose-th:border prose-th:border-neutral-300',
        'prose-th:bg-neutral-100',
        'prose-th:px-4 prose-th:py-2 prose-th:text-left',
        'prose-td:border prose-td:border-neutral-300',
        'prose-td:px-4 prose-td:py-2',
        // Images
        'prose-img:rounded-lg prose-img:border prose-img:border-neutral-200',
        // HR
        'prose-hr:border-neutral-200',
        className
      )}
    >
      {children}
    </article>
  )
}
