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
  SerializedAboutIntro,
  SerializedExperience,
  SerializedEducation,
  SerializedCertification,
  SerializedSkillsFull,
} from "@/models/SiteContent";
import {
  updateAboutIntro,
  createExperience,
  updateExperience,
  deleteExperience,
  toggleExperienceVisibility,
  reorderExperience,
  createEducation,
  updateEducation,
  deleteEducation,
  toggleEducationVisibility,
  reorderEducation,
  createCertification,
  updateCertification,
  deleteCertification,
  toggleCertificationVisibility,
  createSkillsFull,
  updateSkillsFull,
  deleteSkillsFull,
  reorderSkillsFull,
} from "@/lib/actions/admin-about";

interface Props {
  intro: SerializedAboutIntro | null;
  experience: SerializedExperience[];
  education: SerializedEducation[];
  certifications: SerializedCertification[];
  skills: SerializedSkillsFull[];
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

// ─── About Intro Section ────────────────────────────────────────────────────

function IntroSection({ intro }: { intro: SerializedAboutIntro | null }) {
  const [isPending, startTransition] = useTransition();
  const [text, setText] = useState(intro?.text ?? "");
  const [status, setStatus] = useState("");

  function handleSave() {
    startTransition(async () => {
      const result = await updateAboutIntro({ text });
      setStatus(result.success ? "Saved" : (result.message ?? "Error"));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="font-heading text-xl font-semibold text-text-primary">
        Introduction
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Opening paragraph on the about page.
      </p>

      <div className="mt-4 space-y-4">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          className="border-zinc-700 bg-zinc-800 text-zinc-100"
        />
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

// ─── Experience Section ─────────────────────────────────────────────────────

function ExperienceSection({
  items: initialItems,
}: {
  items: SerializedExperience[];
}) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    company: "",
    role: "",
    dateRange: "",
    description: "",
  });
  const [status, setStatus] = useState("");

  function startEdit(item: SerializedExperience) {
    setEditing(item._id);
    setForm({
      company: item.company,
      role: item.role,
      dateRange: item.dateRange,
      description: item.description,
    });
    setAdding(false);
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ company: "", role: "", dateRange: "", description: "" });
  }

  function cancelEdit() {
    setEditing(null);
    setAdding(false);
  }

  function handleSave() {
    startTransition(async () => {
      if (adding) {
        const result = await createExperience(form);
        setStatus(result.message ?? "");
        if (result.success) {
          setAdding(false);
          setForm({ company: "", role: "", dateRange: "", description: "" });
        }
      } else if (editing) {
        const result = await updateExperience(editing, form);
        setStatus(result.message ?? "");
        if (result.success) setEditing(null);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteExperience(id);
      setStatus(result.message ?? "");
      if (result.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    });
  }

  function handleToggle(id: string, visible: boolean) {
    startTransition(async () => {
      await toggleExperienceVisibility(id, visible);
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
      await reorderExperience(newItems.map((i) => i._id));
    });
  }

  const formFields = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          className="border-zinc-600 bg-zinc-700 text-zinc-100"
        />
        <Input
          placeholder="Role"
          value={form.role}
          onChange={(e) => setForm({ ...form, role: e.target.value })}
          className="border-zinc-600 bg-zinc-700 text-zinc-100"
        />
      </div>
      <Input
        placeholder="Date range (e.g. Jan 2023 - Present)"
        value={form.dateRange}
        onChange={(e) => setForm({ ...form, dateRange: e.target.value })}
        className="border-zinc-600 bg-zinc-700 text-zinc-100"
      />
      <Textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            Experience
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Work experience entries on the about page.
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
                <p className="font-medium text-zinc-200">{item.company}</p>
                <p className="text-sm text-zinc-400">{item.role}</p>
                <p className="font-mono text-xs text-zinc-500">
                  {item.dateRange}
                </p>
              </div>
            )}

            <Switch
              checked={item.visible}
              onCheckedChange={(checked) => handleToggle(item._id, checked)}
              disabled={isPending}
              aria-label={`Toggle visibility for ${item.company}`}
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
                    Delete &quot;{item.company}&quot; experience?
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
            No experience entries yet.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Education Section ──────────────────────────────────────────────────────

function EducationSection({
  items: initialItems,
}: {
  items: SerializedEducation[];
}) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    institution: "",
    degree: "",
    dateRange: "",
    description: "",
  });
  const [status, setStatus] = useState("");

  function startEdit(item: SerializedEducation) {
    setEditing(item._id);
    setForm({
      institution: item.institution,
      degree: item.degree,
      dateRange: item.dateRange,
      description: item.description,
    });
    setAdding(false);
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ institution: "", degree: "", dateRange: "", description: "" });
  }

  function cancelEdit() {
    setEditing(null);
    setAdding(false);
  }

  function handleSave() {
    startTransition(async () => {
      if (adding) {
        const result = await createEducation(form);
        setStatus(result.message ?? "");
        if (result.success) {
          setAdding(false);
          setForm({
            institution: "",
            degree: "",
            dateRange: "",
            description: "",
          });
        }
      } else if (editing) {
        const result = await updateEducation(editing, form);
        setStatus(result.message ?? "");
        if (result.success) setEditing(null);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteEducation(id);
      setStatus(result.message ?? "");
      if (result.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    });
  }

  function handleToggle(id: string, visible: boolean) {
    startTransition(async () => {
      await toggleEducationVisibility(id, visible);
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
      await reorderEducation(newItems.map((i) => i._id));
    });
  }

  const formFields = (
    <div className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Institution"
          value={form.institution}
          onChange={(e) => setForm({ ...form, institution: e.target.value })}
          className="border-zinc-600 bg-zinc-700 text-zinc-100"
        />
        <Input
          placeholder="Degree / qualification"
          value={form.degree}
          onChange={(e) => setForm({ ...form, degree: e.target.value })}
          className="border-zinc-600 bg-zinc-700 text-zinc-100"
        />
      </div>
      <Input
        placeholder="Date range (e.g. Sep 2020 - Jun 2023)"
        value={form.dateRange}
        onChange={(e) => setForm({ ...form, dateRange: e.target.value })}
        className="border-zinc-600 bg-zinc-700 text-zinc-100"
      />
      <Textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => setForm({ ...form, description: e.target.value })}
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
            Education
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Education entries on the about page.
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
                <p className="font-medium text-zinc-200">{item.institution}</p>
                <p className="text-sm text-zinc-400">{item.degree}</p>
                <p className="font-mono text-xs text-zinc-500">
                  {item.dateRange}
                </p>
              </div>
            )}

            <Switch
              checked={item.visible}
              onCheckedChange={(checked) => handleToggle(item._id, checked)}
              disabled={isPending}
              aria-label={`Toggle visibility for ${item.institution}`}
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
                    Delete &quot;{item.institution}&quot; education?
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
            No education entries yet.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Certifications Section ─────────────────────────────────────────────────

function CertificationsSection({
  items: initialItems,
}: {
  items: SerializedCertification[];
}) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({
    name: "",
    issuer: "",
    date: "",
    credentialUrl: "",
  });
  const [status, setStatus] = useState("");

  function startEdit(item: SerializedCertification) {
    setEditing(item._id);
    setForm({
      name: item.name,
      issuer: item.issuer,
      date: item.date,
      credentialUrl: item.credentialUrl ?? "",
    });
    setAdding(false);
  }

  function startAdd() {
    setAdding(true);
    setEditing(null);
    setForm({ name: "", issuer: "", date: "", credentialUrl: "" });
  }

  function cancelEdit() {
    setEditing(null);
    setAdding(false);
  }

  function handleSave() {
    startTransition(async () => {
      const data = {
        name: form.name,
        issuer: form.issuer,
        date: form.date,
        credentialUrl: form.credentialUrl || null,
      };
      if (adding) {
        const result = await createCertification(data);
        setStatus(result.message ?? "");
        if (result.success) {
          setAdding(false);
          setForm({ name: "", issuer: "", date: "", credentialUrl: "" });
        }
      } else if (editing) {
        const result = await updateCertification(editing, data);
        setStatus(result.message ?? "");
        if (result.success) setEditing(null);
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      const result = await deleteCertification(id);
      setStatus(result.message ?? "");
      if (result.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    });
  }

  function handleToggle(id: string, visible: boolean) {
    startTransition(async () => {
      await toggleCertificationVisibility(id, visible);
      setItems((prev) =>
        prev.map((i) => (i._id === id ? { ...i, visible } : i)),
      );
    });
  }

  const formFields = (
    <div className="space-y-3">
      <Input
        placeholder="Certification name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        className="border-zinc-600 bg-zinc-700 text-zinc-100"
      />
      <div className="grid gap-3 sm:grid-cols-2">
        <Input
          placeholder="Issuer"
          value={form.issuer}
          onChange={(e) => setForm({ ...form, issuer: e.target.value })}
          className="border-zinc-600 bg-zinc-700 text-zinc-100"
        />
        <Input
          placeholder="Date (e.g. Mar 2024)"
          value={form.date}
          onChange={(e) => setForm({ ...form, date: e.target.value })}
          className="border-zinc-600 bg-zinc-700 text-zinc-100"
        />
      </div>
      <Input
        placeholder="Credential URL (optional)"
        value={form.credentialUrl}
        onChange={(e) => setForm({ ...form, credentialUrl: e.target.value })}
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
            Certifications
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Professional certifications on the about page.
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
        {items.map((item) => (
          <div
            key={item._id}
            className="flex items-center gap-3 rounded-lg border border-zinc-800 bg-zinc-800/50 p-3"
          >
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
                <p className="font-medium text-zinc-200">{item.name}</p>
                <p className="text-sm text-zinc-400">
                  {item.issuer}{" "}
                  <span className="font-mono text-zinc-500">{item.date}</span>
                </p>
              </div>
            )}

            <Switch
              checked={item.visible}
              onCheckedChange={(checked) => handleToggle(item._id, checked)}
              disabled={isPending}
              aria-label={`Toggle visibility for ${item.name}`}
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
                    Delete &quot;{item.name}&quot;?
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
            No certifications yet.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Skills Full Section ────────────────────────────────────────────────────

function SkillsFullSection({
  items: initialItems,
}: {
  items: SerializedSkillsFull[];
}) {
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ category: "", skills: "" });
  const [status, setStatus] = useState("");

  function startEdit(item: SerializedSkillsFull) {
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
        const result = await createSkillsFull({
          category: form.category,
          skills,
        });
        setStatus(result.message ?? "");
        if (result.success) {
          setAdding(false);
          setForm({ category: "", skills: "" });
        }
      } else if (editing) {
        const result = await updateSkillsFull(editing, {
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
      const result = await deleteSkillsFull(id);
      setStatus(result.message ?? "");
      if (result.success) {
        setItems((prev) => prev.filter((i) => i._id !== id));
      }
    });
  }

  function handleMove(index: number, direction: "up" | "down") {
    const newItems = [...items];
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= newItems.length) return;
    [newItems[index], newItems[target]] = [newItems[target], newItems[index]];
    setItems(newItems);

    startTransition(async () => {
      await reorderSkillsFull(newItems.map((i) => i._id));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            Skills (Full)
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Full skills list on the about page.
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
            No skill categories yet.
          </p>
        )}
      </div>
    </section>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function AboutAdmin({
  intro,
  experience,
  education,
  certifications,
  skills,
}: Props) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          About
        </h1>
        <p className="mt-2 text-zinc-400">
          Manage the content displayed on your about page.
        </p>
      </div>

      <div className="space-y-6">
        <IntroSection intro={intro} />
        <ExperienceSection items={experience} />
        <EducationSection items={education} />
        <CertificationsSection items={certifications} />
        <SkillsFullSection items={skills} />
      </div>
    </div>
  );
}
