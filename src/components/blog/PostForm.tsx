"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import Image from "next/image";
import { createPost, updatePost } from "@/lib/actions/posts";
import { generateSlug, type PostFormState } from "@/lib/blog/validation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// Lazy-load the editor to avoid blocking page render
const PostEditor = dynamic(
  () => import("./PostEditor").then((m) => m.PostEditor),
  {
    ssr: false,
    loading: () => <EditorSkeleton />,
  },
);

interface PostFormProps {
  mode: "create" | "edit";
  initialData?: {
    id?: string;
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    categories: string[];
    tags: string[];
    featuredImage: string;
    published: boolean;
  };
  availableCategories: string[];
  availableTags: string[];
}

const initialState: PostFormState = {
  success: undefined,
  message: undefined,
  errors: undefined,
};

export function PostForm({
  mode,
  initialData,
  availableCategories,
  availableTags,
}: PostFormProps) {
  const router = useRouter();

  // Form state using useActionState
  const boundAction =
    mode === "edit" && initialData?.id
      ? updatePost.bind(null, initialData.id)
      : createPost;

  const [state, formAction, isPending] = useActionState(
    boundAction,
    initialState,
  );

  // Local state for editor content (not managed by form directly)
  const [content, setContent] = useState(initialData?.content ?? "");

  // Local state for slug auto-generation
  const [autoSlug, setAutoSlug] = useState(mode === "create");
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [slug, setSlug] = useState(initialData?.slug ?? "");

  // Local state for categories and tags
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    initialData?.categories ?? [],
  );
  const [selectedTags, setSelectedTags] = useState<string[]>(
    initialData?.tags ?? [],
  );
  const [newTag, setNewTag] = useState("");
  const [newCategory, setNewCategory] = useState("");

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [autoSlug, title]);

  // Handle successful form submission
  useEffect(() => {
    if (state.success && slug) {
      router.push(`/blog/${slug}`);
    }
  }, [state.success, slug, router]);

  // Handle title change
  function handleTitleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setTitle(e.target.value);
  }

  // Handle slug change
  function handleSlugChange(e: React.ChangeEvent<HTMLInputElement>) {
    setSlug(e.target.value);
  }

  // Toggle category selection
  function toggleCategory(category: string) {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  }

  // Add new category
  function addCategory() {
    if (
      newCategory.trim() &&
      !selectedCategories.includes(newCategory.trim())
    ) {
      setSelectedCategories((prev) => [...prev, newCategory.trim()]);
      setNewCategory("");
    }
  }

  // Remove tag
  function removeTag(tag: string) {
    setSelectedTags((prev) => prev.filter((t) => t !== tag));
  }

  // Add new tag
  function addTag(tag: string) {
    const trimmedTag = tag.trim();
    if (trimmedTag && !selectedTags.includes(trimmedTag)) {
      setSelectedTags((prev) => [...prev, trimmedTag]);
    }
  }

  // Handle tag input keydown (comma or enter adds tag)
  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(newTag);
      setNewTag("");
    }
  }

  // Check if featured image URL is valid for preview
  function isValidImageUrl(url: string): boolean {
    try {
      new URL(url);
      return url.startsWith("http://") || url.startsWith("https://");
    } catch {
      return false;
    }
  }

  const [featuredImage, setFeaturedImage] = useState(
    initialData?.featuredImage ?? "",
  );

  return (
    <form action={formAction} className="space-y-8">
      {/* General error message */}
      {state.message && !state.success && (
        <div
          role="alert"
          className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive"
        >
          {state.message}
        </div>
      )}

      {/* Title */}
      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          value={title}
          onChange={handleTitleChange}
          placeholder="Enter post title"
          aria-invalid={!!state.errors?.title}
        />
        {state.errors?.title && (
          <p className="text-sm text-destructive">{state.errors.title[0]}</p>
        )}
      </div>

      {/* Slug */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="slug">Slug</Label>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input
              type="checkbox"
              checked={autoSlug}
              onChange={(e) => setAutoSlug(e.target.checked)}
              className="rounded border-input"
            />
            Auto-generate from title
          </label>
        </div>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={handleSlugChange}
          placeholder="url-friendly-slug"
          pattern="[a-z0-9-]+"
          disabled={autoSlug}
          aria-invalid={!!state.errors?.slug}
        />
        <p className="text-xs text-muted-foreground">
          URL: /blog/{slug || "your-slug-here"}
        </p>
        {state.errors?.slug && (
          <p className="text-sm text-destructive">{state.errors.slug[0]}</p>
        )}
      </div>

      {/* Excerpt */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="excerpt">Excerpt</Label>
          <span
            className={cn(
              "text-xs",
              (initialData?.excerpt?.length ?? 0) > 450
                ? "text-amber-500"
                : "text-muted-foreground",
            )}
          >
            {/* Use a key to force re-render on excerpt change */}
            <ExcerptCounter initialValue={initialData?.excerpt ?? ""} />
          </span>
        </div>
        <Textarea
          id="excerpt"
          name="excerpt"
          defaultValue={initialData?.excerpt ?? ""}
          placeholder="A brief summary of the post (2-3 sentences)"
          rows={3}
          maxLength={500}
          aria-invalid={!!state.errors?.excerpt}
        />
        {state.errors?.excerpt && (
          <p className="text-sm text-destructive">{state.errors.excerpt[0]}</p>
        )}
      </div>

      {/* Featured Image */}
      <div className="space-y-2">
        <Label htmlFor="featuredImage">Featured Image URL</Label>
        <Input
          id="featuredImage"
          name="featuredImage"
          type="url"
          value={featuredImage}
          onChange={(e) => setFeaturedImage(e.target.value)}
          placeholder="https://example.com/image.jpg"
          aria-invalid={!!state.errors?.featuredImage}
        />
        {state.errors?.featuredImage && (
          <p className="text-sm text-destructive">
            {state.errors.featuredImage[0]}
          </p>
        )}
        {isValidImageUrl(featuredImage) && (
          <div className="relative aspect-video w-full max-w-md rounded-md overflow-hidden border border-border">
            <Image
              src={featuredImage}
              alt="Featured image preview"
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        )}
      </div>

      {/* Categories */}
      <div className="space-y-2">
        <Label>Categories</Label>
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => toggleCategory(category)}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-colors border",
                selectedCategories.includes(category)
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-muted/50 text-muted-foreground border-border hover:bg-muted",
              )}
            >
              {category}
            </button>
          ))}
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add new category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCategory();
              }
            }}
            className="min-w-0 max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addCategory}
            className="shrink-0"
          >
            Add
          </Button>
        </div>
        {/* Hidden inputs for categories */}
        {selectedCategories.map((category) => (
          <input
            key={category}
            type="hidden"
            name="categories"
            value={category}
          />
        ))}
        {state.errors?.categories && (
          <p className="text-sm text-destructive">
            {state.errors.categories[0]}
          </p>
        )}
      </div>

      {/* Tags */}
      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex flex-wrap gap-2 min-h-[2.5rem]">
          {selectedTags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-secondary text-secondary-foreground text-sm"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                className="ml-1 hover:text-destructive"
                aria-label={`Remove tag ${tag}`}
              >
                x
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add tag (press Enter or comma)"
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="min-w-0 max-w-xs"
          />
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              addTag(newTag);
              setNewTag("");
            }}
            className="shrink-0"
          >
            Add
          </Button>
        </div>
        {availableTags.length > 0 && (
          <div className="text-xs text-muted-foreground">
            Suggestions:{" "}
            {availableTags
              .filter((tag) => !selectedTags.includes(tag))
              .slice(0, 10)
              .map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => addTag(tag)}
                  className="underline hover:text-foreground mr-2"
                >
                  {tag}
                </button>
              ))}
          </div>
        )}
        {/* Hidden inputs for tags */}
        {selectedTags.map((tag) => (
          <input key={tag} type="hidden" name="tags" value={tag} />
        ))}
        {state.errors?.tags && (
          <p className="text-sm text-destructive">{state.errors.tags[0]}</p>
        )}
      </div>

      {/* Content Editor */}
      <div className="space-y-2">
        <Label>Content</Label>
        <PostEditor initialContent={content} onChange={setContent} />
        {/* Hidden input to sync content to FormData */}
        <input type="hidden" name="content" value={content} />
        {state.errors?.content && (
          <p className="text-sm text-destructive">{state.errors.content[0]}</p>
        )}
      </div>

      {/* Published Toggle */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked={initialData?.published ?? false}
            className="rounded border-input w-4 h-4"
          />
          <span className="text-sm font-medium">Publish immediately</span>
        </label>
        <span className="text-xs text-muted-foreground">
          (Uncheck to save as draft)
        </span>
      </div>

      {/* Submit Button */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending
            ? "Saving..."
            : mode === "create"
              ? "Create Post"
              : "Update Post"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isPending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

// Excerpt character counter component
function ExcerptCounter({ initialValue }: { initialValue: string }) {
  const [count, setCount] = useState(initialValue.length);

  useEffect(() => {
    const textarea = document.getElementById("excerpt") as HTMLTextAreaElement;
    if (textarea) {
      const handleInput = () => setCount(textarea.value.length);
      textarea.addEventListener("input", handleInput);
      return () => textarea.removeEventListener("input", handleInput);
    }
  }, []);

  return <span>{count}/500</span>;
}

// Editor skeleton for lazy loading
function EditorSkeleton() {
  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Toolbar skeleton */}
      <div className="p-2 border-b border-border bg-muted/30 flex gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-8" />
        ))}
      </div>
      {/* Editor area skeleton */}
      <div className="p-4 min-h-[400px]">
        <Skeleton className="h-6 w-3/4 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-2/3 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-5/6" />
      </div>
    </div>
  );
}
