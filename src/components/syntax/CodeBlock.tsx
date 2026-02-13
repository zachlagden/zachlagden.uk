'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'

interface CodeBlockProps {
  children: React.ReactNode
  className?: string  // Contains language class from rehype-highlight (e.g., "hljs language-typescript")
}

export function CodeBlock({ children, className }: CodeBlockProps) {
  const [copied, setCopied] = useState(false)

  // Extract language from className (e.g., "language-typescript" -> "typescript")
  const language = className?.split(' ')
    .find(c => c.startsWith('language-'))
    ?.replace('language-', '') ?? 'text'

  const handleCopy = async () => {
    // Get text content from children
    const text = typeof children === 'string'
      ? children
      : (children as React.ReactElement<{ children?: string }>)?.props?.children ?? ''

    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="relative group my-4">
      {/* Language badge */}
      <div className="absolute top-0 right-0 px-3 py-1 text-xs font-mono text-neutral-500 bg-neutral-100 rounded-bl-lg rounded-tr-lg border-b border-l border-neutral-200">
        {language}
      </div>

      {/* Copy button */}
      <button
        onClick={handleCopy}
        className="absolute top-8 right-2 px-2 py-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-200 hover:bg-neutral-300 rounded text-neutral-700"
        aria-label="Copy code"
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>

      {/* Code block */}
      <pre className={cn(
        'overflow-x-auto rounded-lg border',
        'bg-neutral-50',  // GitHub dark theme background
        'border-neutral-200',
        'p-4 pt-8',  // Extra top padding for language badge
        'text-sm font-mono',
        className
      )}>
        <code className={className}>
          {children}
        </code>
      </pre>
    </div>
  )
}
