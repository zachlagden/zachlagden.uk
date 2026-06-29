import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import { BlogPost, BlogPostInput } from "@/types/blog";
import readingTime from "reading-time";

let indexesEnsured: Promise<void> | null = null;

async function ensureIndexesOnce(
  col: Awaited<ReturnType<typeof rawPostsCollection>>,
): Promise<void> {
  if (!indexesEnsured) {
    indexesEnsured = (async () => {
      try {
        await Promise.all([
          col.createIndex({ slug: 1 }, { unique: true }),
          col.createIndex({ status: 1, publishedAt: -1 }),
          col.createIndex({ tags: 1 }),
          col.createIndex({ "author.githubUsername": 1 }),
        ]);
      } catch (err) {
        console.warn("[blog] ensureIndexes failed:", err);
        // Indexes are advisory — queries still work without them. Don't
        // rethrow; do reset the cached promise so a future call retries.
        indexesEnsured = null;
      }
    })();
  }
  return indexesEnsured;
}

async function rawPostsCollection() {
  const db = await getDb();
  return db.collection<BlogPost>("posts");
}

async function postsCollection() {
  const col = await rawPostsCollection();
  await ensureIndexesOnce(col);
  return col;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function getPublishedPosts(
  page: number = 1,
  limit: number = 10,
  tag?: string,
  search?: string,
) {
  const col = await postsCollection();
  const filter: Record<string, unknown> = { status: "published" };
  if (tag) filter.tags = tag;
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: "i" } },
      { excerpt: { $regex: search, $options: "i" } },
    ];
  }

  const total = await col.countDocuments(filter);
  const posts = await col
    .find(filter)
    .sort({ publishedAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .toArray();

  return {
    posts: posts as BlogPost[],
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const col = await postsCollection();
  return (await col.findOne({ slug })) as BlogPost | null;
}

export async function getPostById(id: string): Promise<BlogPost | null> {
  const col = await postsCollection();
  return (await col.findOne({ _id: new ObjectId(id) })) as BlogPost | null;
}

export async function createPost(
  input: BlogPostInput,
  author: { name: string; githubUsername: string; avatar?: string },
): Promise<BlogPost> {
  const col = await postsCollection();
  const now = new Date();
  const stats = readingTime(input.content);

  const slug = input.slug || slugify(input.title);

  const doc = {
    ...input,
    slug,
    author,
    readingTime: Math.ceil(stats.minutes),
    createdAt: now,
    updatedAt: now,
    publishedAt: input.status === "published" ? now : undefined,
  };

  const result = await col.insertOne(doc as unknown as BlogPost);
  return { ...doc, _id: result.insertedId } as unknown as BlogPost;
}

export async function updatePost(
  id: string,
  input: Partial<BlogPostInput>,
): Promise<BlogPost | null> {
  const col = await postsCollection();
  const now = new Date();

  const update: Record<string, unknown> = {
    ...input,
    updatedAt: now,
  };

  if (input.content) {
    const stats = readingTime(input.content);
    update.readingTime = Math.ceil(stats.minutes);
  }

  if (input.status === "published") {
    const existing = await col.findOne({ _id: new ObjectId(id) });
    if (existing && !existing.publishedAt) {
      update.publishedAt = now;
    }
  }

  await col.updateOne({ _id: new ObjectId(id) }, { $set: update });
  return (await col.findOne({ _id: new ObjectId(id) })) as BlogPost | null;
}

export async function deletePost(id: string): Promise<boolean> {
  const col = await postsCollection();
  const result = await col.deleteOne({ _id: new ObjectId(id) });
  return result.deletedCount === 1;
}

export async function getAllTags(): Promise<string[]> {
  const col = await postsCollection();
  const tags = await col.distinct("tags", { status: "published" });
  return tags.sort();
}

export async function getLatestPosts(count: number = 3): Promise<BlogPost[]> {
  const col = await postsCollection();
  const posts = await col
    .find({ status: "published" })
    .sort({ publishedAt: -1 })
    .limit(count)
    .toArray();
  return posts as BlogPost[];
}

export async function getAdjacentPosts(publishedAt: Date): Promise<{
  prev: BlogPost | null;
  next: BlogPost | null;
}> {
  const col = await postsCollection();

  const prev = (await col
    .find({ status: "published", publishedAt: { $lt: publishedAt } })
    .sort({ publishedAt: -1 })
    .limit(1)
    .toArray()
    .then((r) => r[0] || null)) as BlogPost | null;

  const next = (await col
    .find({ status: "published", publishedAt: { $gt: publishedAt } })
    .sort({ publishedAt: 1 })
    .limit(1)
    .toArray()
    .then((r) => r[0] || null)) as BlogPost | null;

  return { prev, next };
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const col = await postsCollection();
  const posts = await col
    .find({ status: "published" }, { projection: { slug: 1 } })
    .toArray();
  return posts.map((p) => p.slug);
}

export async function getAllPublishedSlugsWithDates(): Promise<
  Array<{ slug: string; updatedAt: Date }>
> {
  const col = await postsCollection();
  const posts = await col
    .find({ status: "published" }, { projection: { slug: 1, updatedAt: 1 } })
    .toArray();
  return posts.map((p) => ({
    slug: p.slug,
    updatedAt:
      p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt),
  }));
}
