"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import clientPromise from "@/lib/db";
import { requireAdmin } from "@/lib/dal";
import type { SiteSetting } from "@/models/SiteContent";

const DB_NAME = "zachlagden-uk";

export type ActionResult = {
  success: boolean;
  message?: string;
  errors?: Record<string, string[]>;
};

// ─── Site Metadata ──────────────────────────────────────────────────────────

const siteMetadataSchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().min(1, "Description is required").max(500),
  ogImage: z.string().min(1, "OG image is required"),
});

export async function updateSiteMetadata(data: {
  title: string;
  description: string;
  ogImage: string;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = siteMetadataSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SiteSetting>("site_settings");

  const updates = [
    { key: "title", value: validated.data.title },
    { key: "description", value: validated.data.description },
    { key: "ogImage", value: validated.data.ogImage },
  ];

  for (const { key, value } of updates) {
    await collection.updateOne(
      { key },
      { $set: { key, value } },
      { upsert: true },
    );
  }

  revalidatePath("/");
  return { success: true, message: "Site metadata updated" };
}

// ─── Section Visibility ─────────────────────────────────────────────────────

const sectionVisibilitySchema = z.object({
  section: z.string().min(1, "Section key is required"),
  visible: z.boolean(),
});

export async function updateSectionVisibility(data: {
  section: string;
  visible: boolean;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = sectionVisibilitySchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const key = `section_visible_${validated.data.section}`;

  await db
    .collection<SiteSetting>("site_settings")
    .updateOne(
      { key },
      { $set: { key, value: validated.data.visible } },
      { upsert: true },
    );

  revalidatePath("/");
  return { success: true, message: "Section visibility updated" };
}

export async function bulkUpdateSectionVisibility(
  sections: { section: string; visible: boolean }[],
): Promise<ActionResult> {
  await requireAdmin();

  const arraySchema = z.array(sectionVisibilitySchema);
  const validated = arraySchema.safeParse(sections);
  if (!validated.success) {
    return { success: false, message: "Validation failed" };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  const collection = db.collection<SiteSetting>("site_settings");

  const bulkOps = validated.data.map(({ section, visible }) => {
    const key = `section_visible_${section}`;
    return {
      updateOne: {
        filter: { key },
        update: { $set: { key, value: visible } },
        upsert: true,
      },
    };
  });

  await collection.bulkWrite(bulkOps);

  revalidatePath("/");
  return { success: true, message: "Section visibility updated" };
}

// ─── Social Links ───────────────────────────────────────────────────────────

const socialLinkSchema = z.object({
  platform: z.string().min(1),
  url: z.string().url("Must be a valid URL"),
  label: z.string().optional(),
});

const socialLinksSchema = z.object({
  socialLinks: z.array(socialLinkSchema).min(1, "At least one link required"),
});

export async function updateSocialLinks(data: {
  socialLinks: { platform: string; url: string; label?: string }[];
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = socialLinksSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);

  // Update social links in homepage_hero
  await db
    .collection("homepage_hero")
    .updateOne(
      {},
      { $set: { socialLinks: validated.data.socialLinks } },
      { upsert: true },
    );

  // Also update contact_info social links (without label)
  const contactSocialLinks = validated.data.socialLinks.map(
    ({ platform, url }) => ({ platform, url }),
  );
  await db
    .collection("contact_info")
    .updateOne(
      {},
      { $set: { socialLinks: contactSocialLinks } },
      { upsert: true },
    );

  revalidatePath("/");
  return { success: true, message: "Social links updated" };
}

// ─── Generic setting update ─────────────────────────────────────────────────

const settingSchema = z.object({
  key: z.string().min(1, "Key is required"),
  value: z.unknown(),
});

export async function updateSiteSetting(data: {
  key: string;
  value: unknown;
}): Promise<ActionResult> {
  await requireAdmin();

  const validated = settingSchema.safeParse(data);
  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const client = await clientPromise;
  const db = client.db(DB_NAME);
  await db
    .collection<SiteSetting>("site_settings")
    .updateOne(
      { key: validated.data.key },
      { $set: { key: validated.data.key, value: validated.data.value } },
      { upsert: true },
    );

  revalidatePath("/");
  return { success: true, message: "Setting updated" };
}
