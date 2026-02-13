/**
 * Create MongoDB indexes for all collections.
 *
 * Usage:
 *   MONGODB_URI="mongodb://..." npx tsx scripts/create-indexes.ts
 *
 * Or with dotenv:
 *   npx tsx --require dotenv/config scripts/create-indexes.ts
 *
 * Indexes are idempotent — running this multiple times is safe.
 */

import { MongoClient } from "mongodb";

const DB_NAME = "zachlagden-uk";

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error("Error: MONGODB_URI environment variable is required.");
    process.exit(1);
  }

  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected to MongoDB.\n");

    const db = client.db(DB_NAME);

    // ── Posts ──────────────────────────────────────────────────────────────
    console.log("[posts]");
    const posts = db.collection("posts");
    await posts.createIndex({ slug: 1 }, { unique: true });
    await posts.createIndex({ published: 1, publishedAt: -1 });
    await posts.createIndex({ previous_slugs: 1 });
    await posts.createIndex({ categories: 1 });
    await posts.createIndex({ tags: 1 });
    await posts.createIndex(
      { title: "text", excerpt: "text", content: "text" },
      { name: "posts_text_search" },
    );
    console.log("  Created 6 indexes.");

    // ── Projects ──────────────────────────────────────────────────────────
    console.log("[projects]");
    const projects = db.collection("projects");
    await projects.createIndex({ slug: 1 }, { unique: true });
    await projects.createIndex({ published: 1, featured: -1, createdAt: -1 });
    await projects.createIndex({ technologies: 1 });
    console.log("  Created 3 indexes.");

    // ── Comments ──────────────────────────────────────────────────────────
    console.log("[comments]");
    const comments = db.collection("comments");
    await comments.createIndex({ postId: 1, createdAt: 1 });
    console.log("  Created 1 index.");

    // ── Reactions ─────────────────────────────────────────────────────────
    console.log("[reactions]");
    const reactions = db.collection("reactions");
    await reactions.createIndex({ postId: 1, userId: 1 }, { unique: true });
    console.log("  Created 1 index.");

    // ── Featured Work ─────────────────────────────────────────────────────
    console.log("[featured_work]");
    await db.collection("featured_work").createIndex({ visible: 1, order: 1 });
    console.log("  Created 1 index.");

    // ── Skills Preview ────────────────────────────────────────────────────
    console.log("[skills_preview]");
    await db.collection("skills_preview").createIndex({ visible: 1, order: 1 });
    console.log("  Created 1 index.");

    // ── Testimonials ──────────────────────────────────────────────────────
    console.log("[testimonials]");
    await db.collection("testimonials").createIndex({ visible: 1, order: 1 });
    console.log("  Created 1 index.");

    // ── Experience ────────────────────────────────────────────────────────
    console.log("[experience]");
    await db.collection("experience").createIndex({ visible: 1, order: 1 });
    console.log("  Created 1 index.");

    // ── Education ─────────────────────────────────────────────────────────
    console.log("[education]");
    await db.collection("education").createIndex({ visible: 1, order: 1 });
    console.log("  Created 1 index.");

    // ── Certifications ────────────────────────────────────────────────────
    console.log("[certifications]");
    await db.collection("certifications").createIndex({ visible: 1 });
    console.log("  Created 1 index.");

    // ── Skills Full ───────────────────────────────────────────────────────
    console.log("[skills_full]");
    await db.collection("skills_full").createIndex({ order: 1 });
    console.log("  Created 1 index.");

    // ── Site Settings ─────────────────────────────────────────────────────
    console.log("[site_settings]");
    await db
      .collection("site_settings")
      .createIndex({ key: 1 }, { unique: true });
    console.log("  Created 1 index.");

    console.log("\nAll indexes created successfully.");
  } finally {
    await client.close();
    console.log("Disconnected from MongoDB.");
  }
}

main().catch((err) => {
  console.error("Index creation failed:", err);
  process.exit(1);
});
