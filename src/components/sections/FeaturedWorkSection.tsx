import React from "react";
import { ArrowUpRight } from "lucide-react";

const FEATURED_WORK = [
  {
    name: "DigiGrow",
    description: "Digital agency built from zero. If it runs, I built it.",
    url: "https://digigrow.uk",
  },
  {
    name: "Donna",
    description:
      "Multi-agent AI systems handling operations, legal, and infrastructure.",
    url: "https://donna.fyi",
  },
  {
    name: "Lagden Development",
    description: "Open-source projects and developer tools.",
    url: "https://lagden.dev",
  },
];

export default function FeaturedWorkSection() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-24 sm:px-6 lg:px-8">
      <h2 className="font-heading text-3xl font-semibold text-text-primary">
        What I&apos;m Building
      </h2>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURED_WORK.map((project) => (
          <a
            key={project.name}
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border border-zinc-800 bg-zinc-900 p-6 transition-colors hover:border-cyan-500/20"
          >
            <div className="flex items-start justify-between">
              <h3 className="font-heading text-lg font-medium text-zinc-100">
                {project.name}
              </h3>
              <ArrowUpRight
                className="h-5 w-5 flex-shrink-0 text-zinc-600 transition-colors group-hover:text-cyan-500"
                aria-hidden="true"
              />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {project.description}
            </p>
          </a>
        ))}
      </div>
    </section>
  );
}
