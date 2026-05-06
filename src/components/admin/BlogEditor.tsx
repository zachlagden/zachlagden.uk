"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Bold,
  Italic,
  Heading2,
  Link as LinkIcon,
  ImageIcon,
  Code,
  Save,
  Eye,
  Edit3,
} from "lucide-react";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import ImageUpload from "./ImageUpload";
import useAutoSave from "@/hooks/useAutoSave";
import { BlogPostSerialized } from "@/types/blog";

interface BlogEditorProps {
  post?: BlogPostSerialized;
}

interface EditorState {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  tags: string;
  featuredImage?: string;
  status: "draft" | "published";
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default function BlogEditor({ post }: BlogEditorProps) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [autoSlug, setAutoSlug] = useState(!post);

  const [state, setState] = useState<EditorState>({
    title: post?.title || "",
    slug: post?.slug || "",
    content: post?.content || "",
    excerpt: post?.excerpt || "",
    tags: post?.tags.join(", ") || "",
    featuredImage: post?.featuredImage,
    status: post?.status || "draft",
  });

  const { clear: clearAutoSave } = useAutoSave(
    post?._id || "new-post",
    state,
    5000,
  );

  // Derive slug from title during render when autoSlug is enabled
  const derivedSlug =
    autoSlug && state.title ? slugify(state.title) : state.slug;
  if (derivedSlug !== state.slug) {
    setState((prev) => ({ ...prev, slug: derivedSlug }));
  }

  const insertMarkdown = useCallback((prefix: string, suffix: string = "") => {
    const textarea = document.querySelector(
      'textarea[name="content"]',
    ) as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const newText = `${prefix}${selected || "text"}${suffix}`;

    setState((prev) => ({
      ...prev,
      content:
        prev.content.substring(0, start) +
        newText +
        prev.content.substring(end),
    }));

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + (selected || "text").length,
      );
    }, 0);
  }, []);

  const handleSave = async (overrideStatus?: "draft" | "published") => {
    setSaving(true);
    const tags = state.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const body = {
      title: state.title,
      slug: state.slug,
      content: state.content,
      excerpt: state.excerpt,
      tags,
      featuredImage: state.featuredImage,
      status: overrideStatus || state.status,
    };

    const url = post ? `/api/blog/posts/${post._id}` : "/api/blog/posts";
    const method = post ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      clearAutoSave();
      const data = await res.json();
      router.push(`/admin/blog/${data.slug}/edit`);
      router.refresh();
    }

    setSaving(false);
  };

  const toolbar = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertMarkdown("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertMarkdown("*", "*"),
    },
    {
      icon: Heading2,
      label: "Heading",
      action: () => insertMarkdown("## "),
    },
    {
      icon: LinkIcon,
      label: "Link",
      action: () => insertMarkdown("[", "](url)"),
    },
    {
      icon: ImageIcon,
      label: "Image",
      action: () => insertMarkdown("![alt](", ")"),
    },
    {
      icon: Code,
      label: "Code block",
      action: () => insertMarkdown("```\n", "\n```"),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Title */}
      <input
        type="text"
        placeholder="Post title"
        value={state.title}
        onChange={(e) =>
          setState((prev) => ({ ...prev, title: e.target.value }))
        }
        className="w-full text-3xl font-heading font-bold tracking-tight bg-transparent border-none outline-none placeholder:text-neutral-300"
      />

      {/* Slug */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-neutral-400">/blog/</span>
        <input
          type="text"
          value={state.slug}
          onChange={(e) => {
            setAutoSlug(false);
            setState((prev) => ({ ...prev, slug: e.target.value }));
          }}
          className="text-xs font-mono-accent bg-neutral-50 border border-neutral-200 rounded px-2 py-1 flex-1"
        />
      </div>

      {/* Excerpt */}
      <textarea
        placeholder="Write a short excerpt..."
        value={state.excerpt}
        onChange={(e) =>
          setState((prev) => ({ ...prev, excerpt: e.target.value }))
        }
        rows={2}
        className="w-full text-sm border border-neutral-200 rounded-lg p-3 resize-none focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />

      {/* Tags */}
      <input
        type="text"
        placeholder="Tags (comma-separated)"
        value={state.tags}
        onChange={(e) =>
          setState((prev) => ({ ...prev, tags: e.target.value }))
        }
        className="w-full text-sm border border-neutral-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
      />

      {/* Featured image */}
      <div>
        <label className="text-xs font-medium text-neutral-700 mb-2 block">
          Featured Image
        </label>
        <ImageUpload
          value={state.featuredImage}
          onChange={(url) =>
            setState((prev) => ({ ...prev, featuredImage: url }))
          }
        />
      </div>

      {/* Editor toolbar */}
      <div className="flex items-center gap-1 border border-neutral-200 rounded-t-lg p-2 bg-neutral-50">
        {toolbar.map((item) => (
          <button
            key={item.label}
            onClick={item.action}
            className="p-1.5 rounded hover:bg-neutral-200 transition-colors"
            title={item.label}
          >
            <item.icon className="w-4 h-4 text-neutral-600" />
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={() => setShowPreview(!showPreview)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
            showPreview ? "bg-neutral-200" : "hover:bg-neutral-200"
          }`}
        >
          {showPreview ? (
            <Edit3 className="w-3.5 h-3.5" />
          ) : (
            <Eye className="w-3.5 h-3.5" />
          )}
          {showPreview ? "Edit" : "Preview"}
        </button>
      </div>

      {/* Content area */}
      {showPreview ? (
        <div className="border border-neutral-200 rounded-b-lg p-6 min-h-[400px] bg-white">
          <MarkdownRenderer content={state.content} />
        </div>
      ) : (
        <textarea
          name="content"
          placeholder="Write your post in Markdown..."
          value={state.content}
          onChange={(e) =>
            setState((prev) => ({ ...prev, content: e.target.value }))
          }
          className="w-full font-mono-accent text-sm border border-neutral-200 rounded-b-lg p-4 min-h-[400px] resize-y focus:outline-none focus:ring-2 focus:ring-neutral-900 -mt-6"
        />
      )}

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-neutral-200">
        <button
          onClick={() => handleSave("draft")}
          disabled={saving || !state.title}
          className="px-4 py-2 text-sm border border-neutral-200 rounded-lg hover:border-neutral-300 transition-colors disabled:opacity-50"
        >
          Save Draft
        </button>
        <button
          onClick={() => handleSave("published")}
          disabled={saving || !state.title}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          {saving ? "Saving..." : "Publish"}
        </button>
        {post && (
          <span className="text-xs text-neutral-400 ml-auto">
            Last saved: {new Date(post.updatedAt).toLocaleString()}
          </span>
        )}
      </div>
    </div>
  );
}
