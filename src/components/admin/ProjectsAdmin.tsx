"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Search, Plus, ExternalLink, Trash2, Star, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { SerializedProject } from "@/models/Project";
import {
  deleteProject,
  toggleProjectVisibility,
  toggleProjectFeatured,
} from "@/lib/actions/projects";

interface Props {
  projects: SerializedProject[];
}

export function ProjectsAdmin({ projects: initialProjects }: Props) {
  const [isPending, startTransition] = useTransition();
  const [projects, setProjects] = useState(initialProjects);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "published" | "draft">("all");

  const filtered = projects.filter((project) => {
    const matchesSearch =
      !search ||
      project.title.toLowerCase().includes(search.toLowerCase()) ||
      project.description.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all" ||
      (filter === "published" && project.published) ||
      (filter === "draft" && !project.published);
    return matchesSearch && matchesFilter;
  });

  function handleToggleVisibility(projectId: string, published: boolean) {
    startTransition(async () => {
      const result = await toggleProjectVisibility(projectId, published);
      if (result.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, published } : p)),
        );
      }
    });
  }

  function handleToggleFeatured(projectId: string, featured: boolean) {
    startTransition(async () => {
      const result = await toggleProjectFeatured(projectId, featured);
      if (result.success) {
        setProjects((prev) =>
          prev.map((p) => (p._id === projectId ? { ...p, featured } : p)),
        );
      }
    });
  }

  function handleDelete(projectId: string) {
    startTransition(async () => {
      const result = await deleteProject(projectId);
      if (result.success) {
        setProjects((prev) => prev.filter((p) => p._id !== projectId));
      }
    });
  }

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-text-primary">
            Projects
          </h1>
          <p className="mt-2 text-zinc-400">
            Manage portfolio projects and visibility.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/projects/new">
            <Plus className="h-4 w-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Search and filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            placeholder="Search projects..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-zinc-700 bg-zinc-800 pl-10 text-zinc-100"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <div className="flex gap-1">
          {(["all", "published", "draft"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                filter === f
                  ? "bg-cyan-500/10 text-cyan-400"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Project list */}
      <div className="space-y-2">
        {filtered.map((project) => (
          <div
            key={project._id}
            className="flex items-center gap-4 rounded-lg border border-zinc-800 bg-zinc-900 p-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium text-zinc-200">
                  {project.title}
                </p>
                {project.featured && (
                  <Star className="h-3.5 w-3.5 shrink-0 fill-cyan-500 text-cyan-500" />
                )}
                {!project.published && (
                  <span className="shrink-0 rounded bg-zinc-700 px-1.5 py-0.5 text-xs text-zinc-400">
                    Draft
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-zinc-500">
                <span className="font-mono">
                  {new Date(project.updatedAt).toLocaleDateString()}
                </span>
                {project.technologies.length > 0 && (
                  <span className="truncate">
                    {project.technologies.join(", ")}
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() =>
                  handleToggleFeatured(project._id, !project.featured)
                }
                disabled={isPending}
                className={`rounded p-1 transition-colors ${
                  project.featured
                    ? "text-cyan-500 hover:text-cyan-400"
                    : "text-zinc-600 hover:text-zinc-400"
                }`}
                aria-label={`${project.featured ? "Unfeature" : "Feature"} ${project.title}`}
                title={project.featured ? "Unfeature" : "Feature"}
              >
                <Star
                  className={`h-4 w-4 ${project.featured ? "fill-current" : ""}`}
                />
              </button>

              <Switch
                checked={project.published}
                onCheckedChange={(checked) =>
                  handleToggleVisibility(project._id, checked)
                }
                disabled={isPending}
                aria-label={`${project.published ? "Unpublish" : "Publish"} ${project.title}`}
              />

              {project.demoUrl && (
                <Button asChild size="icon-xs" variant="ghost">
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-zinc-500 hover:text-zinc-300"
                  >
                    <ExternalLink className="h-4 w-4" />
                  </a>
                </Button>
              )}

              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="icon-xs"
                    variant="ghost"
                    className="text-zinc-500 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Delete &ldquo;{project.title}&rdquo;?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete the project. This action
                      cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => handleDelete(project._id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900 py-12 text-center">
            <p className="text-zinc-500">
              {search || filter !== "all"
                ? "No projects match your filters."
                : "No projects yet."}
            </p>
            {!search && filter === "all" && (
              <Button asChild size="sm" className="mt-4">
                <Link href="/projects/new">Add your first project</Link>
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Summary */}
      {projects.length > 0 && (
        <p className="mt-4 text-sm text-zinc-600">
          {projects.filter((p) => p.published).length} published,{" "}
          {projects.filter((p) => !p.published).length} drafts,{" "}
          {projects.filter((p) => p.featured).length} featured &mdash;{" "}
          {projects.length} total
        </p>
      )}
    </div>
  );
}
