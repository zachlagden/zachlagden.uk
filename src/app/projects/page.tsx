import { Suspense } from "react";
import type { Metadata } from "next";
import { getProjects, getAllTechnologies } from "@/lib/projects/projects";
import { getProjectGitHubStats, GitHubStats } from "@/lib/projects/github";
import { ProjectCard } from "@/components/projects/ProjectCard";
import { TechnologyFilters } from "@/components/projects/TechnologyFilters";
import { EmptyState } from "@/components/projects/EmptyState";

// Force dynamic rendering - projects come from database
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Projects",
  description:
    "Explore my portfolio of projects, from web applications to open-source contributions. Filter by technology to find what interests you.",
};

interface ProjectsPageProps {
  searchParams: Promise<{
    tech?: string;
  }>;
}

export default async function ProjectsPage({
  searchParams,
}: ProjectsPageProps) {
  // Await searchParams (Next.js 15 Promise-based API)
  const params = await searchParams;

  // Parse technology filter from URL
  const technologies = params.tech?.split(",").filter(Boolean) || [];

  // Fetch filtered projects and all technologies for filter UI
  const [projects, allTechnologies] = await Promise.all([
    getProjects({
      technologies: technologies.length > 0 ? technologies : undefined,
    }),
    getAllTechnologies(),
  ]);

  // Fetch GitHub stats for all projects with githubRepo (parallel)
  const statsPromises = projects.map((project) =>
    project.githubRepo
      ? getProjectGitHubStats(project.githubRepo)
      : Promise.resolve(null),
  );
  const allStats = await Promise.all(statsPromises);

  // Create a map of project ID to stats
  const statsMap = new Map<string, GitHubStats | null>();
  projects.forEach((project, index) => {
    statsMap.set(project._id, allStats[index]);
  });

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="py-24 sm:py-32">
        <h1 className="font-heading text-5xl font-bold text-text-primary sm:text-6xl">
          Projects
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-zinc-400">
          A collection of projects I&apos;ve built, from full-stack applications
          to open-source contributions. Filter by technology to explore.
        </p>
      </div>

      {/* Filters */}
      {allTechnologies.length > 0 && (
        <div className="mb-10">
          <Suspense
            fallback={
              <div className="h-10 animate-pulse rounded-lg bg-zinc-900" />
            }
          >
            <TechnologyFilters technologies={allTechnologies} />
          </Suspense>
        </div>
      )}

      {/* Projects Grid */}
      {projects.length > 0 ? (
        <div className="grid gap-8 pb-24 sm:grid-cols-2">
          {projects.map((project, index) => (
            <ProjectCard
              key={project._id}
              project={project}
              stats={statsMap.get(project._id)}
              index={index}
            />
          ))}
        </div>
      ) : (
        <div className="pb-24">
          <EmptyState technologies={technologies} />
        </div>
      )}
    </div>
  );
}
