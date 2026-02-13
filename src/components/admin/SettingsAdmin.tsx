"use client";

import React, { useState, useTransition } from "react";
import { Save, Plus, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import type {
  SerializedSiteSetting,
  SerializedHomepageHero,
} from "@/models/SiteContent";
import {
  updateSiteMetadata,
  bulkUpdateSectionVisibility,
  updateSocialLinks,
} from "@/lib/actions/admin-settings";

interface Props {
  settings: SerializedSiteSetting[];
  hero: SerializedHomepageHero | null;
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

function getSettingValue(
  settings: SerializedSiteSetting[],
  key: string,
  defaultValue: string = "",
): string {
  const setting = settings.find((s) => s.key === key);
  return setting ? String(setting.value) : defaultValue;
}

function getSectionVisibility(
  settings: SerializedSiteSetting[],
  section: string,
): boolean {
  const setting = settings.find((s) => s.key === `section_visible_${section}`);
  return setting ? Boolean(setting.value) : true;
}

// ─── Site Metadata Section ──────────────────────────────────────────────────

function SiteMetadataSection({
  settings,
}: {
  settings: SerializedSiteSetting[];
}) {
  const [isPending, startTransition] = useTransition();
  const [title, setTitle] = useState(
    getSettingValue(settings, "title", "Zach Lagden"),
  );
  const [description, setDescription] = useState(
    getSettingValue(settings, "description", ""),
  );
  const [ogImage, setOgImage] = useState(
    getSettingValue(settings, "ogImage", ""),
  );
  const [status, setStatus] = useState("");

  function handleSave() {
    startTransition(async () => {
      const result = await updateSiteMetadata({ title, description, ogImage });
      setStatus(result.success ? "Saved" : (result.message ?? "Error"));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="font-heading text-xl font-semibold text-text-primary">
        Site Metadata
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Title, description, and Open Graph image for SEO.
      </p>

      <div className="mt-4 space-y-4">
        <div>
          <Label htmlFor="site-title" className="text-zinc-300">
            Site Title
          </Label>
          <Input
            id="site-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>
        <div>
          <Label htmlFor="site-description" className="text-zinc-300">
            Description
          </Label>
          <Input
            id="site-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="mt-1 border-zinc-700 bg-zinc-800 text-zinc-100"
          />
        </div>
        <div>
          <Label htmlFor="site-og-image" className="text-zinc-300">
            OG Image URL
          </Label>
          <Input
            id="site-og-image"
            value={ogImage}
            onChange={(e) => setOgImage(e.target.value)}
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

// ─── Section Visibility ─────────────────────────────────────────────────────

const HOMEPAGE_SECTIONS = [
  { key: "hero", label: "Hero" },
  { key: "featured_work", label: "Featured Work" },
  { key: "skills_preview", label: "Skills Preview" },
  { key: "testimonials", label: "Testimonials" },
  { key: "latest_posts", label: "Latest Blog Posts" },
  { key: "contact", label: "Contact Strip" },
] as const;

function SectionVisibilitySection({
  settings,
}: {
  settings: SerializedSiteSetting[];
}) {
  const [isPending, startTransition] = useTransition();
  const [sections, setSections] = useState(
    HOMEPAGE_SECTIONS.map((s) => ({
      ...s,
      visible: getSectionVisibility(settings, s.key),
    })),
  );
  const [status, setStatus] = useState("");

  function handleToggle(key: string, visible: boolean) {
    setSections((prev) =>
      prev.map((s) => (s.key === key ? { ...s, visible } : s)),
    );
  }

  function handleSave() {
    startTransition(async () => {
      const data = sections.map((s) => ({
        section: s.key,
        visible: s.visible,
      }));
      const result = await bulkUpdateSectionVisibility(data);
      setStatus(result.success ? "Saved" : (result.message ?? "Error"));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <h2 className="font-heading text-xl font-semibold text-text-primary">
        Section Visibility
      </h2>
      <p className="mt-1 text-sm text-zinc-500">
        Show or hide homepage sections globally.
      </p>

      <div className="mt-4 space-y-3">
        {sections.map((section) => (
          <div
            key={section.key}
            className="flex items-center justify-between rounded-lg border border-zinc-800 bg-zinc-800/50 px-4 py-3"
          >
            <span className="text-sm text-zinc-300">{section.label}</span>
            <Switch
              checked={section.visible}
              onCheckedChange={(checked) => handleToggle(section.key, checked)}
              aria-label={`Toggle ${section.label} visibility`}
            />
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
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
    </section>
  );
}

// ─── Social Links Section ───────────────────────────────────────────────────

function SocialLinksSection({ hero }: { hero: SerializedHomepageHero | null }) {
  const [isPending, startTransition] = useTransition();
  const [links, setLinks] = useState(
    hero?.socialLinks ?? [{ platform: "", url: "", label: "" }],
  );
  const [status, setStatus] = useState("");

  function addLink() {
    setLinks([...links, { platform: "", url: "", label: "" }]);
  }

  function removeLink(index: number) {
    setLinks(links.filter((_, i) => i !== index));
  }

  function updateLink(
    index: number,
    field: "platform" | "url" | "label",
    value: string,
  ) {
    const updated = [...links];
    updated[index] = { ...updated[index], [field]: value };
    setLinks(updated);
  }

  function handleSave() {
    startTransition(async () => {
      const result = await updateSocialLinks({
        socialLinks: links.filter((l) => l.platform && l.url),
      });
      setStatus(result.success ? "Saved" : (result.message ?? "Error"));
    });
  }

  return (
    <section className="rounded-lg border border-zinc-800 bg-zinc-900 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-text-primary">
            Social Links
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Social links shown in the hero and contact sections.
          </p>
        </div>
        <Button onClick={addLink} size="xs" variant="ghost">
          <Plus className="h-3 w-3" />
          Add Link
        </Button>
      </div>

      <div className="mt-4 space-y-2">
        {links.map((link, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              placeholder="Platform"
              value={link.platform}
              onChange={(e) => updateLink(index, "platform", e.target.value)}
              className="w-28 border-zinc-700 bg-zinc-800 text-zinc-100"
            />
            <Input
              placeholder="URL"
              value={link.url}
              onChange={(e) => updateLink(index, "url", e.target.value)}
              className="flex-1 border-zinc-700 bg-zinc-800 text-zinc-100"
            />
            <Input
              placeholder="Label (optional)"
              value={link.label ?? ""}
              onChange={(e) => updateLink(index, "label", e.target.value)}
              className="w-32 border-zinc-700 bg-zinc-800 text-zinc-100"
            />
            <Button
              onClick={() => removeLink(index)}
              size="icon-xs"
              variant="ghost"
              className="text-zinc-500 hover:text-red-400"
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center gap-3">
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
    </section>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export function SettingsAdmin({ settings, hero }: Props) {
  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-8">
        <h1 className="font-heading text-3xl font-bold text-text-primary">
          Settings
        </h1>
        <p className="mt-2 text-zinc-400">
          Site metadata, section visibility, and configuration.
        </p>
      </div>

      <div className="space-y-6">
        <SiteMetadataSection settings={settings} />
        <SectionVisibilitySection settings={settings} />
        <SocialLinksSection hero={hero} />
      </div>
    </div>
  );
}
