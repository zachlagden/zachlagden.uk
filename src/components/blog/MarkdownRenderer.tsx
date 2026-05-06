"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeHighlight from "rehype-highlight";
import Image from "next/image";
import type { Components } from "react-markdown";

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const components: Components = {
    h1: ({ children, ...props }) => {
      const id =
        typeof children === "string"
          ? children.toLowerCase().replace(/\s+/g, "-")
          : undefined;
      return (
        <h1
          id={id}
          className="text-3xl font-heading font-bold tracking-tight mt-10 mb-4"
          {...props}
        >
          {children}
        </h1>
      );
    },
    h2: ({ children, ...props }) => {
      const id =
        typeof children === "string"
          ? children.toLowerCase().replace(/\s+/g, "-")
          : undefined;
      return (
        <h2
          id={id}
          className="text-2xl font-heading font-bold tracking-tight mt-8 mb-3"
          {...props}
        >
          {children}
        </h2>
      );
    },
    h3: ({ children, ...props }) => {
      const id =
        typeof children === "string"
          ? children.toLowerCase().replace(/\s+/g, "-")
          : undefined;
      return (
        <h3
          id={id}
          className="text-xl font-heading font-semibold mt-6 mb-2"
          {...props}
        >
          {children}
        </h3>
      );
    },
    p: ({ children, ...props }) => (
      <p className="text-neutral-700 leading-relaxed mb-4" {...props}>
        {children}
      </p>
    ),
    a: ({ href, children, ...props }) => (
      <a
        href={href}
        className="text-neutral-900 underline underline-offset-2 hover:text-neutral-600 transition-colors"
        target={href?.startsWith("http") ? "_blank" : undefined}
        rel={href?.startsWith("http") ? "noopener noreferrer" : undefined}
        {...props}
      >
        {children}
      </a>
    ),
    ul: ({ children, ...props }) => (
      <ul className="list-disc list-inside mb-4 space-y-1 ml-2" {...props}>
        {children}
      </ul>
    ),
    ol: ({ children, ...props }) => (
      <ol className="list-decimal list-inside mb-4 space-y-1 ml-2" {...props}>
        {children}
      </ol>
    ),
    li: ({ children, ...props }) => (
      <li className="text-neutral-700" {...props}>
        {children}
      </li>
    ),
    blockquote: ({ children, ...props }) => (
      <blockquote
        className="border-l-4 border-neutral-300 pl-4 my-4 italic text-neutral-600"
        {...props}
      >
        {children}
      </blockquote>
    ),
    code: ({ className, children, ...props }) => {
      const isInline = !className;
      if (isInline) {
        return (
          <code
            className="font-mono-accent bg-neutral-100 rounded px-1.5 py-0.5 text-sm"
            {...props}
          >
            {children}
          </code>
        );
      }
      return (
        <code className={`font-mono-accent text-sm ${className}`} {...props}>
          {children}
        </code>
      );
    },
    pre: ({ children, ...props }) => (
      <pre
        className="bg-neutral-900 text-neutral-100 rounded-lg p-4 my-4 overflow-x-auto text-sm"
        {...props}
      >
        {children}
      </pre>
    ),
    img: ({ src, alt }) => {
      if (!src || typeof src !== "string") return null;
      return (
        <span className="block my-6">
          <Image
            src={src}
            alt={alt || ""}
            width={800}
            height={450}
            className="rounded-lg w-full h-auto"
            sizes="(max-width: 768px) 100vw, 768px"
          />
        </span>
      );
    },
    hr: () => <hr className="my-8 border-neutral-200" />,
    table: ({ children, ...props }) => (
      <div className="overflow-x-auto my-4">
        <table
          className="min-w-full border border-neutral-200 rounded-lg"
          {...props}
        >
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }) => (
      <th
        className="px-4 py-2 bg-neutral-100 text-left text-sm font-semibold border-b border-neutral-200"
        {...props}
      >
        {children}
      </th>
    ),
    td: ({ children, ...props }) => (
      <td className="px-4 py-2 text-sm border-b border-neutral-100" {...props}>
        {children}
      </td>
    ),
  };

  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize, rehypeHighlight]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
