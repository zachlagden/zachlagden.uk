'use client'

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { common, createLowlight } from 'lowlight'
import { EditorToolbar } from './EditorToolbar'

const lowlight = createLowlight(common)

interface PostEditorProps {
  initialContent: string // HTML content from database
  onChange: (html: string) => void // Called on content change
  placeholder?: string
}

export function PostEditor({
  initialContent,
  onChange,
  placeholder = 'Start writing...',
}: PostEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false, // Use CodeBlockLowlight instead
      }),
      CodeBlockLowlight.configure({
        lowlight,
      }),
      Image.configure({
        inline: false,
        allowBase64: false,
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder,
      }),
    ],
    content: initialContent,
    immediatelyRender: false, // Critical: prevents SSR hydration issues
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  if (!editor) {
    return (
      <div className="border border-border rounded-md overflow-hidden bg-background">
        <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-muted/30 rounded-t-md h-12" />
        <div className="min-h-[400px] p-4 animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </div>
    )
  }

  return (
    <div className="border border-border rounded-md overflow-hidden bg-background">
      <EditorToolbar editor={editor} />
      <EditorContent editor={editor} className="tiptap" />
    </div>
  )
}
