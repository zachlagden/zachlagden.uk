import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

const SKILL_CATEGORIES = [
  {
    label: "Languages",
    skills: ["Python", "TypeScript", "JavaScript", "HTML/CSS", "Rust", "SQL"],
  },
  {
    label: "Web Frameworks",
    skills: ["React", "Next.js", "Flask", "FastAPI", "Express.js"],
  },
  {
    label: "Databases",
    skills: ["MongoDB", "PostgreSQL", "Redis", "SQLite"],
  },
  {
    label: "Infrastructure",
    skills: ["Docker", "Linux", "Nginx", "Coolify", "Cloudflare"],
  },
];

export default function SkillsPreviewSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <h2 className="font-heading text-3xl font-semibold text-text-primary">
        Skills
      </h2>

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        {SKILL_CATEGORIES.map((category) => (
          <div key={category.label}>
            <span className="font-mono text-sm text-zinc-500">
              {category.label}
            </span>
            <div className="mt-3 flex flex-wrap gap-2">
              {category.skills.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-sm text-zinc-300"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10">
        <Link
          href="/about"
          className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-cyan-500"
        >
          View all skills
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
