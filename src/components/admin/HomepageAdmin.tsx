"use client";

import React, { useState, useTransition } from "react";
import {
  Save,
  Plus,
  Trash2,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
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
import type {
  SerializedHomepageHero,
  SerializedFeaturedWork,
  SerializedSkillsPreview,
  SerializedTestimonial,
  SerializedContactInfo,
} from "@/models/SiteContent";
import {
  updateHero,
  createFeaturedWork,
  updateFeaturedWork,
  deleteFeaturedWork,
  toggleFeaturedWorkVisibility,
  reorderFeaturedWork,
  createSkillsPreview,
  updateSkillsPreview,
  deleteSkillsPreview,
  toggleSkillsPreviewVisibility,
  reorderSkillsPreview,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
  toggleTestimonialVisibility,
  reorderTestimonials,
  updateContactInfo,
} from "@/lib/actions/admin-homepage";

interface Props {
  hero: SerializedHomepageHero | null;
  featuredWork: SerializedFeaturedWork[];
  skillsPreview: SerializedSkillsPreview[];
  testimonials: SerializedTestimonial[];
  contactInfo: SerializedContactInfo | null;
}

function StatusMessage({
  message,
  isError,
}: {
  message: string;
  isError?: boolean;
}) {
  if (!message) return null;
  return (
    <p
      className={`text-sm ${isError ? "text-red-400" : "text-emerald-400"}`}
      role="status"
    >
      {message}
    </p>
  );
}

// ─── Hero Section ───────────────────────────────────────────────────────────

function HeroSection({ hero }: { hero: SerializedHomepageHero | null }) {
  const [isPending, startTransition] = useTransition();
  const [name, setName] = useState(hero?.name ?? "");
  const [tagline, setTagline] = useState(hero?.tagline ?? "");
  const [status, setStatus] = useState("");

  function handleSave() {
    startTransition(async () => {
      const result = await updateHero({ name, tagline });
      setStatus(result.success ? "Saved" : (result.message ?? "Error"));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="font-heading text-xl font-semibold text-text-primary">
        Hero
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Name and tagline shown in the homepage hero section.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="hero-name" className="text-zinc-300">
            Name
          </Label>
          <Input
            id="hero-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>
        <div>
          <Label htmlFor="hero-tagline" className="text-zinc-300">
            Tagline
          </Label>
          <Input
            id="hero-tagline"
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isPending} size="sm">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
          <StatusMessage message={status} isError={status === "Error"} />
        </div>
      </div>
    </section>
  );
}

// ─── Featured Work Section ──────────────────────────────────────────────────

function FeaturedWorkSection({
  items: initialItems,
}: {
  items: SerializedFeaturedWork[];
}) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", url: "" });
  const [status, setStatus] = useState("");

  function startEdit(item: SerializedFeaturedWork) {
    setEditing(item._id);
    setForm({
      title: item.title,
      description: item.description,
      url: item.url,
    });
    setAdding(false);
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ title: "", description: "", url: "" });
  }

  function cancelEdit() {
    setEditing(null);
    setAdding(false);
    setForm({ title: "", description: "", url: "" });
  }

  function handleSave() {
    startTransition(async () => {
      if (adding) {
        const result = await createFeaturedWork(form);
        setStatus(result.message ?? "");
        if (result.success) {
          setAdding(false);
          setForm({ title: "", description: "", url: "" });
        }
      } else if (editing) {
        const result = await updateFeaturedWork(editing, form);
        setStatus(result.message ?? "");
        if (result.success) setEditing(null);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteFeaturedWork(id);
      setStatus(result.message ?? "");
      if (result.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    });
  }

  function handleToggle(id: string, visible: boolean) {
    startTransition(async () => {
      await toggleFeaturedWorkVisibility(id, visible);
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, visible } : i)),
      );
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setItems(newItems);

    startTransition(async () => {
      await reorderFeaturedWork(newItems.map((i) => i._id));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            Featured Work
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Projects highlighted on the homepage.
          </p>
        </div>
        <Button onClick={startAdd} size="sm" variant="outline">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <StatusMessage message={status} />

      {adding && (
        <div className="mt-4 space-y-3 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
          <Input
            placeholder="Title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="border-zinc-600 bg-zinc-700 text-zinc-100"
          />
          <Textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="border-zinc-600 bg-zinc-700 text-zinc-100"
          />
          <Input
            placeholder="URL"
            value={form.url}
            onChange={(e) => setForm({ ...form, url: e.target.value })}
            className="border-zinc-600 bg-zinc-700 text-zinc-100"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isPending} size="sm">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Create
            </Button>
            <Button onClick={cancelEdit} size="sm" variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3"
          >
            <div className="flex flex-col">
              <button
                onClick={() => handleMove(index, "up")}
                disabled={index === 0 || isPending}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleMove(index, "down")}
                disabled={index === items.length - 1 || isPending}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <GripVertical
              className="h-4 w-4 shrink-0 text-zinc-600"
              aria-hidden="true"
            />

            {editing === item._id ? (
              <div className="flex-1 space-y-2">
                <Input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="border-zinc-600 bg-zinc-700 text-zinc-100"
                />
                <Textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="border-zinc-600 bg-zinc-700 text-zinc-100"
                />
                <Input
                  value={form.url}
                  onChange={(e) => setForm({ ...form, url: e.target.value })}
                  className="border-zinc-600 bg-zinc-700 text-zinc-100"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isPending} size="sm">
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button onClick={cancelEdit} size="sm" variant="ghost">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => startEdit(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && startEdit(item)}
              >
                <p className="truncate font-medium text-zinc-200">
                  {item.title}
                </p>
                <p className="truncate text-sm text-zinc-500">
                  {item.description}
                </p>
              </div>
            )}

            <Switch
              checked={item.visible}
              onCheckedChange={(checked) => handleToggle(item._id, checked)}
              disabled={isPending}
              aria-label={`Toggle visibility for ${item.title}`}
            />

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
                    Delete &quot;{item.title}&quot;?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
        {items.length === 0 && !adding && (
          <p className="py-4 text-center text-sm text-zinc-600">
            No featured work items yet.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Skills Preview Section ─────────────────────────────────────────────────

function SkillsPreviewSection({
  items: initialItems,
}: {
  items: SerializedSkillsPreview[];
}) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ category: "", skills: "" });
  const [status, setStatus] = useState("");

  function startEdit(item: SerializedSkillsPreview) {
    setEditing(item._id);
    setForm({ category: item.category, skills: item.skills.join(", ") });
    setAdding(false);
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ category: "", skills: "" });
  }

  function cancelEdit() {
    setEditing(null);
    setAdding(false);
  }

  function parseSkills(s: string): string[] {
    return s
      .split(",")
      .map((sk) => sk.trim())
      .filter(Boolean);
  }

  function handleSave() {
    startTransition(async () => {
      const skills = parseSkills(form.skills);
      if (adding) {
        const result = await createSkillsPreview({
          category: form.category,
          skills,
        });
        setStatus(result.message ?? "");
        if (result.success) {
          setAdding(false);
          setForm({ category: "", skills: "" });
        }
      } else if (editing) {
        const result = await updateSkillsPreview(editing, {
          category: form.category,
          skills,
        });
        setStatus(result.message ?? "");
        if (result.success) setEditing(null);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteSkillsPreview(id);
      setStatus(result.message ?? "");
      if (result.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    });
  }

  function handleToggle(id: string, visible: boolean) {
    startTransition(async () => {
      await toggleSkillsPreviewVisibility(id, visible);
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, visible } : i)),
      );
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setItems(newItems);

    startTransition(async () => {
      await reorderSkillsPreview(newItems.map((i) => i._id));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            Skills Preview
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Skill categories shown on the homepage.
          </p>
        </div>
        <Button onClick={startAdd} size="sm" variant="outline">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <StatusMessage message={status} />

      {adding && (
        <div className="mt-4 space-y-3 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
          <Input
            placeholder="Category name"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            className="border-zinc-600 bg-zinc-700 text-zinc-100"
          />
          <Textarea
            placeholder="Skills (comma-separated)"
            value={form.skills}
            onChange={(e) => setForm({ ...form, skills: e.target.value })}
            className="border-zinc-600 bg-zinc-700 text-zinc-100"
          />
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={isPending} size="sm">
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Create
            </Button>
            <Button onClick={cancelEdit} size="sm" variant="ghost">
              Cancel
            </Button>
          </div>
        </div>
      )}

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3"
          >
            <div className="flex flex-col">
              <button
                onClick={() => handleMove(index, "up")}
                disabled={index === 0 || isPending}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleMove(index, "down")}
                disabled={index === items.length - 1 || isPending}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <GripVertical
              className="h-4 w-4 shrink-0 text-zinc-600"
              aria-hidden="true"
            />

            {editing === item._id ? (
              <div className="flex-1 space-y-2">
                <Input
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  className="border-zinc-600 bg-zinc-700 text-zinc-100"
                />
                <Textarea
                  value={form.skills}
                  onChange={(e) => setForm({ ...form, skills: e.target.value })}
                  className="border-zinc-600 bg-zinc-700 text-zinc-100"
                  placeholder="Skills (comma-separated)"
                />
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={isPending} size="sm">
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    Save
                  </Button>
                  <Button onClick={cancelEdit} size="sm" variant="ghost">
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => startEdit(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && startEdit(item)}
              >
                <p className="font-medium text-zinc-200">{item.category}</p>
                <p className="truncate text-sm text-zinc-500">
                  {item.skills.join(", ")}
                </p>
              </div>
            )}

            <Switch
              checked={item.visible}
              onCheckedChange={(checked) => handleToggle(item._id, checked)}
              disabled={isPending}
              aria-label={`Toggle visibility for ${item.category}`}
            />

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
                    Delete &quot;{item.category}&quot;?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
        {items.length === 0 && !adding && (
          <p className="py-4 text-center text-sm text-zinc-600">
            No skills preview categories yet.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Testimonials Section ───────────────────────────────────────────────────

function TestimonialsSection({
  items: initialItems,
}: {
  items: SerializedTestimonial[];
}) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    quote: "",
    personName: "",
    personRole: "",
    avatarUrl: "",
  });
  const [status, setStatus] = useState("");

  function startEdit(item: SerializedTestimonial) {
    setEditing(item._id);
    setForm({
      quote: item.quote,
      personName: item.personName,
      personRole: item.personRole,
      avatarUrl: item.avatarUrl ?? "",
    });
    setAdding(false);
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ quote: "", personName: "", personRole: "", avatarUrl: "" });
  }

  function cancelEdit() {
    setEditing(null);
    setAdding(false);
  }

  function handleSave() {
    startTransition(async () => {
      const data = {
        quote: form.quote,
        personName: form.personName,
        personRole: form.personRole,
        avatarUrl: form.avatarUrl || null,
      };
      if (adding) {
        const result = await createTestimonial(data);
        setStatus(result.message ?? "");
        if (result.success) {
          setAdding(false);
          setForm({
            quote: "",
            personName: "",
            personRole: "",
            avatarUrl: "",
          });
        }
      } else if (editing) {
        const result = await updateTestimonial(editing, data);
        setStatus(result.message ?? "");
        if (result.success) setEditing(null);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteTestimonial(id);
      setStatus(result.message ?? "");
      if (result.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    });
  }

  function handleToggle(id: string, visible: boolean) {
    startTransition(async () => {
      await toggleTestimonialVisibility(id, visible);
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, visible } : i)),
      );
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setItems(newItems);

    startTransition(async () => {
      await reorderTestimonials(newItems.map((i) => i._id));
    });
  }

  const formFields = (
    <div className="space-y-3">
      <Textarea
        placeholder="Quote"
        value={form.quote}
        onChange={(e) => setForm({ ...form, quote: e.target.value })}
        className="border-zinc-600 bg-zinc-700 text-zinc-100"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Person name"
          value={form.personName}
          onChange={(e) => setForm({ ...form, personName: e.target.value })}
          className="border-zinc-600 bg-zinc-700 text-zinc-100"
        />
        <Input
          placeholder="Role / company"
          value={form.personRole}
          onChange={(e) => setForm({ ...form, personRole: e.target.value })}
          className="border-zinc-600 bg-zinc-700 text-zinc-100"
        />
      </div>
      <Input
        placeholder="Avatar URL (optional)"
        value={form.avatarUrl}
        onChange={(e) => setForm({ ...form, avatarUrl: e.target.value })}
        className="border-zinc-600 bg-zinc-700 text-zinc-100"
      />
      <div className="flex gap-2">
        <Button onClick={handleSave} disabled={isPending} size="sm">
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {adding ? "Create" : "Save"}
        </Button>
        <Button onClick={cancelEdit} size="sm" variant="ghost">
          Cancel
        </Button>
      </div>
    </div>
  );

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            Testimonials
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Client/colleague quotes shown on the homepage.
          </p>
        </div>
        <Button onClick={startAdd} size="sm" variant="outline">
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      <StatusMessage message={status} />

      {adding && (
        <div className="mt-4 rounded-lg border border-zinc-700 bg-zinc-800 p-4">
          {formFields}
        </div>
      )}

      <div className="mt-4 space-y-2">
        {items.map((item, index) => (
          <div
            key={item._id}
            className="flex items-start gap-3 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3"
          >
            <div className="mt-1 flex flex-col">
              <button
                onClick={() => handleMove(index, "up")}
                disabled={index === 0 || isPending}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                aria-label="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <button
                onClick={() => handleMove(index, "down")}
                disabled={index === items.length - 1 || isPending}
                className="text-zinc-500 hover:text-zinc-300 disabled:opacity-30"
                aria-label="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </button>
            </div>

            <GripVertical
              className="mt-1 h-4 w-4 shrink-0 text-zinc-600"
              aria-hidden="true"
            />

            {editing === item._id ? (
              <div className="flex-1">{formFields}</div>
            ) : (
              <div
                className="min-w-0 flex-1 cursor-pointer"
                onClick={() => startEdit(item)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && startEdit(item)}
              >
                <p className="text-sm text-zinc-300">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <p className="mt-1 text-xs text-zinc-500">
                  {item.personName} &mdash; {item.personRole}
                </p>
              </div>
            )}

            <Switch
              checked={item.visible}
              onCheckedChange={(checked) => handleToggle(item._id, checked)}
              disabled={isPending}
              aria-label={`Toggle visibility for ${item.personName}`}
            />

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
                    Delete testimonial from {item.personName}?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={() => handleDelete(item._id)}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
        {items.length === 0 && !adding && (
          <p className="py-4 text-center text-sm text-zinc-600">
            No testimonials yet.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Contact Info Section ───────────────────────────────────────────────────

function ContactInfoSection({
  contactInfo,
}: {
  contactInfo: SerializedContactInfo | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState(contactInfo?.email ?? "");
  const [location, setLocation] = useState(contactInfo?.location ?? "");
  const [locationMapUrl, setLocationMapUrl] = useState(
    contactInfo?.locationMapUrl ?? "",
  );
  const [socialLinks, setSocialLinks] = useState(
    contactInfo?.socialLinks ?? [],
  );
  const [status, setStatus] = useState("");

  function addSocialLink() {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  }

  function removeSocialLink(index: number) {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  }

  function updateSocialLink(
    index: number,
    field: "platform" | "url",
    value: string,
  ) {
    const updated = [...socialLinks];
    updated[index] = { ...updated[index], [field]: value };
    setSocialLinks(updated);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateContactInfo({
        email,
        location,
        locationMapUrl,
        socialLinks,
      });
      setStatus(result.success ? "Saved" : (result.message ?? "Error saving"));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="font-heading text-xl font-semibold text-text-primary">
        Contact Info
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Contact details and social links for the homepage.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="contact-email" className="text-zinc-300">
            Email
          </Label>
          <Input
            id="contact-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="contact-location" className="text-zinc-300">
              Location
            </Label>
            <Input
              id="contact-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
            />
          </div>
          <div>
            <Label htmlFor="contact-map-url" className="text-zinc-300">
              Location Map URL
            </Label>
            <Input
              id="contact-map-url"
              value={locationMapUrl}
              onChange={(e) => setLocationMapUrl(e.target.value)}
              className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between">
            <Label className="text-zinc-300">Social Links</Label>
            <Button onClick={addSocialLink} size="xs" variant="ghost">
              <Plus className="h-3 w-3" />
              Add Link
            </Button>
          </div>
          <div className="mt-2 space-y-2">
            {socialLinks.map((link, index) => (
              <div key={index} className="flex items-center gap-2">
                <Input
                  placeholder="Platform"
                  value={link.platform}
                  onChange={(e) =>
                    updateSocialLink(index, "platform", e.target.value)
                  }
                  className="w-32 border-zinc-700 bg-zinc-800 text-zinc-100"
                />
                <Input
                  placeholder="URL"
                  value={link.url}
                  onChange={(e) =>
                    updateSocialLink(index, "url", e.target.value)
                  }
                  className="flex-1 border-zinc-700 bg-zinc-800 text-zinc-100"
                />
                <Button
                  onClick={() => removeSocialLink(index)}
                  size="icon-xs"
                  variant="ghost"
                  className="text-zinc-500 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave} disabled={isPending} size="sm">
            {isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save
          </Button>
          <StatusMessage message={status} isError={!status.includes("Saved")} />
        </div>
      </div>
    </section>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function HomepageAdmin({
  hero,
  featuredWork,
  skillsPreview,
  testimonials,
  contactInfo,
}: Props) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Homepage
        </h1>
        <p className="mt-2 text-zinc-400">
          Manage the content displayed on your homepage.
        </p>
      </div>

      <div className="space-y-6">
        <HeroSection hero={hero} />
        <FeaturedWorkSection items={featuredWork} />
        <SkillsPreviewSection items={skillsPreview} />
        <TestimonialsSection items={testimonials} />
        <ContactInfoSection contactInfo={contactInfo} />
      </div>
    </div>
  );
}
