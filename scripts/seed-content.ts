/**
 * Seed script: migrates public/content.json into MongoDB collections.
 *
 * Usage:
 *   MONGODB_URI="mongodb://..." npx tsx scripts/seed-content.ts
 *
 * Or with dotenv:
 *   npx tsx --require dotenv/config scripts/seed-content.ts
 *
 * The script is idempotent — it drops and recreates each collection on every run.
 */

import { readFileSync } from "fs";
import { resolve } from "path";
import { MongoClient } from "mongodb";

const DB_NAME = "zachlagden-uk";

// ─── Load content.json ──────────────────────────────────────────────────────

const contentPath = resolve(__dirname, "../public/content.json");
const content = JSON.parse(readFileSync(contentPath, "utf-8"));

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI environment variable is required.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.");

    const db = client.db(DB_NAME);

    // ── site_settings ──────────────────────────────────────────────────────

    await dropAndLog(db, "site_settings");
    const siteSettings = [
      { key: "title", value: content.metadata.title },
      { key: "description", value: content.metadata.description },
      { key: "keywords", value: content.metadata.keywords },
      { key: "ogImage", value: content.metadata.ogImage },
      { key: "twitterImage", value: content.metadata.twitterImage },
      { key: "googleAnalyticsId", value: content.metadata.googleAnalyticsId },
      { key: "siteUrl", value: content.metadata.siteUrl },
      { key: "navigation", value: content.navigation },
      { key: "footer", value: content.footer },
      { key: "formspreeId", value: content.contact.formspreeId },
      {
        key: "contactIntroduction",
        value: content.contact.introduction,
      },
      { key: "contactFormFields", value: content.contact.formFields },
      { key: "websites", value: content.personal.websites },
    ];
    await db.collection("site_settings").insertMany(siteSettings);
    console.log(`  Inserted ${siteSettings.length} site_settings.`);

    // ── homepage_hero ──────────────────────────────────────────────────────

    await dropAndLog(db, "homepage_hero");
    const heroSocialLinks = [
      {
        platform: "github",
        url: content.personal.social.github,
        label: "GitHub",
      },
      {
        platform: "linkedin",
        url: content.personal.social.linkedin,
        label: "LinkedIn",
      },
      {
        platform: "instagram",
        url: content.personal.social.instagram,
        label: "Instagram",
      },
      {
        platform: "email",
        url: `mailto:${content.personal.social.email}`,
        label: "Email",
      },
    ];
    await db.collection("homepage_hero").insertOne({
      name: content.personal.name,
      tagline: content.personal.title,
      socialLinks: heroSocialLinks,
    });
    console.log("  Inserted 1 homepage_hero document.");

    // ── featured_work ──────────────────────────────────────────────────────

    await dropAndLog(db, "featured_work");
    const featuredWorkDocs = [
      {
        title: "DigiGrow",
        description:
          "Redefining marketing with comprehensive web development and data-driven strategies.",
        url: content.personal.websites.digigrow,
        order: 0,
        visible: true,
      },
      {
        title: "Lagden Development",
        description:
          "Turning complex technical challenges into elegant, business-driving solutions.",
        url: content.personal.websites.lagdenDev,
        order: 1,
        visible: true,
      },
      {
        title: "Portfolio",
        description:
          "Personal portfolio and CV site built with Next.js, React, and TypeScript.",
        url: content.metadata.siteUrl,
        order: 2,
        visible: true,
      },
    ];
    await db.collection("featured_work").insertMany(featuredWorkDocs);
    console.log(
      `  Inserted ${featuredWorkDocs.length} featured_work documents.`,
    );

    // ── skills_preview ─────────────────────────────────────────────────────

    await dropAndLog(db, "skills_preview");
    // Use first 4 skill categories as preview
    const skillsPreview = content.skills.categories
      .slice(0, 4)
      .map((cat: { name: string; skills: string[] }, index: number) => ({
        category: cat.name,
        skills: cat.skills.slice(0, 4),
        order: index,
        visible: true,
      }));
    if (skillsPreview.length > 0) {
      await db.collection("skills_preview").insertMany(skillsPreview);
    }
    console.log(`  Inserted ${skillsPreview.length} skills_preview documents.`);

    // ── testimonials ───────────────────────────────────────────────────────

    await dropAndLog(db, "testimonials");
    // No testimonials in content.json yet — insert empty collection
    console.log(
      "  No testimonials data in content.json (collection created empty).",
    );

    // ── about_intro ────────────────────────────────────────────────────────

    await dropAndLog(db, "about_intro");
    await db.collection("about_intro").insertOne({
      text: content.about.mainDescription,
    });
    console.log("  Inserted 1 about_intro document.");

    // ── experience ─────────────────────────────────────────────────────────

    await dropAndLog(db, "experience");
    const experienceDocs = content.experience.map(
      (
        exp: {
          title: string;
          company: string;
          companyLink?: string | null;
          startDate: string;
          endDate?: string | null;
          current: boolean;
          location: string;
          description: string;
        },
        index: number,
      ) => {
        const start = exp.startDate;
        const end = exp.current ? "Present" : (exp.endDate ?? "");
        return {
          company: exp.company,
          role: exp.title,
          dateRange: `${start} – ${end}`,
          description: exp.description,
          order: index,
          visible: true,
        };
      },
    );
    if (experienceDocs.length > 0) {
      await db.collection("experience").insertMany(experienceDocs);
    }
    console.log(`  Inserted ${experienceDocs.length} experience documents.`);

    // ── education ──────────────────────────────────────────────────────────

    await dropAndLog(db, "education");
    const educationDocs = content.education.map(
      (
        edu: {
          institution: string;
          degree: string;
          startDate: string;
          endDate?: string | null;
          current: boolean;
          description: string;
        },
        index: number,
      ) => {
        const start = edu.startDate;
        const end = edu.current ? "Present" : (edu.endDate ?? "");
        return {
          institution: edu.institution,
          degree: edu.degree,
          dateRange: `${start} – ${end}`,
          description: edu.description,
          order: index,
          visible: true,
        };
      },
    );
    if (educationDocs.length > 0) {
      await db.collection("education").insertMany(educationDocs);
    }
    console.log(`  Inserted ${educationDocs.length} education documents.`);

    // ── certifications ─────────────────────────────────────────────────────

    await dropAndLog(db, "certifications");
    const certDocs = content.certifications.map(
      (cert: {
        name: string;
        issuer: string;
        issueDate: string;
        credentialUrl?: string | null;
      }) => ({
        name: cert.name,
        issuer: cert.issuer,
        date: cert.issueDate,
        credentialUrl: cert.credentialUrl ?? null,
        visible: true,
      }),
    );
    if (certDocs.length > 0) {
      await db.collection("certifications").insertMany(certDocs);
    }
    console.log(`  Inserted ${certDocs.length} certifications documents.`);

    // ── skills_full ────────────────────────────────────────────────────────

    await dropAndLog(db, "skills_full");
    const skillsFullDocs = content.skills.categories.map(
      (cat: { name: string; skills: string[] }, index: number) => ({
        category: cat.name,
        skills: cat.skills,
        order: index,
      }),
    );
    if (skillsFullDocs.length > 0) {
      await db.collection("skills_full").insertMany(skillsFullDocs);
    }
    console.log(`  Inserted ${skillsFullDocs.length} skills_full documents.`);

    // ── contact_info ───────────────────────────────────────────────────────

    await dropAndLog(db, "contact_info");
    const contactSocialLinks = [
      { platform: "github", url: content.personal.social.github },
      { platform: "linkedin", url: content.personal.social.linkedin },
      { platform: "instagram", url: content.personal.social.instagram },
      {
        platform: "email",
        url: `mailto:${content.personal.social.email}`,
      },
    ];
    await db.collection("contact_info").insertOne({
      email: content.personal.email,
      location: content.personal.location,
      locationMapUrl: content.personal.locationMapUrl,
      socialLinks: contactSocialLinks,
    });
    console.log("  Inserted 1 contact_info document.");

    // ─────────────────────────────────────────────────────────────────────

    console.log("\nSeed complete.");
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB.");
  }
}

async function dropAndLog(
  db: ReturnType<MongoClient["db"]>,
  name: string,
): Promise<void> {
  const collections = await db.listCollections({ name }).toArray();
  if (collections.length > 0) {
    await db.collection(name).drop();
  }
  console.log(`\n[${name}]`);
}

main().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
