"use client";

import { useState, useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createProject, type ProjectFormState } from "@/lib/actions/projects";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const initialState: ProjectFormState = {};

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function ProjectForm() {
  const router = useRouter();
  const [state, formAction, isPending] = useActionState(
    createProject,
    initialState,
  );

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [autoSlug, setAutoSlug] = useState(true);

  // Auto-generate slug from title
  useEffect(() => {
    if (autoSlug && title) {
      setSlug(generateSlug(title));
    }
  }, [autoSlug, title]);

  // Redirect on success
  useEffect(() => {
    if (state.success) {
      router.push("/projects");
    }
  }, [state.success, router]);

  return (
    <form action={formAction} className="space-y-6">
      {/* Error message */}
      {state.message && !state.success && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive">
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
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Project title"
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
            Auto-generate
          </label>
        </div>
        <Input
          id="slug"
          name="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          placeholder="project-slug"
          disabled={autoSlug}
          aria-invalid={!!state.errors?.slug}
        />
        {state.errors?.slug && (
          <p className="text-sm text-destructive">{state.errors.slug[0]}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">Short Description</Label>
        <Textarea
          id="description"
          name="description"
          placeholder="Brief description shown on the project card"
          rows={3}
          aria-invalid={!!state.errors?.description}
        />
        {state.errors?.description && (
          <p className="text-sm text-destructive">
            {state.errors.description[0]}
          </p>
        )}
      </div>

      {/* Long Description */}
      <div className="space-y-2">
        <Label htmlFor="longDescription">
          Detailed Description{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </Label>
        <Textarea
          id="longDescription"
          name="longDescription"
          placeholder="Extended description or case study"
          rows={5}
        />
      </div>

      {/* Technologies */}
      <div className="space-y-2">
        <Label htmlFor="technologies">Technologies</Label>
        <Input
          id="technologies"
          name="technologies"
          placeholder="React, Next.js, MongoDB (comma-separated)"
        />
        <p className="text-xs text-muted-foreground">Separate with commas</p>
      </div>

      {/* Featured Image */}
      <div className="space-y-2">
        <Label htmlFor="featuredImage">Featured Image URL</Label>
        <Input
          id="featuredImage"
          name="featuredImage"
          type="url"
          placeholder="https://example.com/image.jpg"
          aria-invalid={!!state.errors?.featuredImage}
        />
        {state.errors?.featuredImage && (
          <p className="text-sm text-destructive">
            {state.errors.featuredImage[0]}
          </p>
        )}
      </div>

      {/* URLs */}
      <div className="grid sm:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="demoUrl">
            Demo URL{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="demoUrl"
            name="demoUrl"
            type="url"
            placeholder="https://myproject.com"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="sourceUrl">
            Source URL{" "}
            <span className="text-muted-foreground font-normal">
              (optional)
            </span>
          </Label>
          <Input
            id="sourceUrl"
            name="sourceUrl"
            type="url"
            placeholder="https://github.com/user/repo"
          />
        </div>
      </div>

      {/* GitHub Repo */}
      <div className="space-y-2">
        <Label htmlFor="githubRepo">
          GitHub Repo{" "}
          <span className="text-muted-foreground font-normal">
            (optional, for stats)
          </span>
        </Label>
        <Input id="githubRepo" name="githubRepo" placeholder="owner/repo" />
        <p className="text-xs text-muted-foreground">
          Format: owner/repo — used to fetch stars, forks, etc.
        </p>
      </div>

      {/* Toggles */}
      <div className="flex flex-col sm:flex-row gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="published"
            value="true"
            defaultChecked
            className="rounded border-input w-4 h-4"
          />
          <span className="text-sm font-medium">Publish immediately</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            name="featured"
            value="true"
            className="rounded border-input w-4 h-4"
          />
          <span className="text-sm font-medium">Featured project</span>
        </label>
      </div>

      {/* Submit */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Creating..." : "Create Project"}
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
