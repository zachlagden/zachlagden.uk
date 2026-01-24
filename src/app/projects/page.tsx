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

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  // Await searchParams (Next.js 15 Promise-based API)
  const params = await searchParams;

  // Parse technology filter from URL
  const technologies = params.tech?.split(",").filter(Boolean) || [];

  // Fetch filtered projects and all technologies for filter UI
  const [projects, allTechnologies] = await Promise.all([
    getProjects({ technologies: technologies.length > 0 ? technologies : undefined }),
    getAllTechnologies(),
  ]);

  // Fetch GitHub stats for all projects with githubRepo (parallel)
  const statsPromises = projects.map((project) =>
    project.githubRepo ? getProjectGitHubStats(project.githubRepo) : Promise.resolve(null)
  );
  const allStats = await Promise.all(statsPromises);

  // Create a map of project ID to stats
  const statsMap = new Map<string, GitHubStats | null>();
  projects.forEach((project, index) => {
    statsMap.set(project._id, allStats[index]);
  });

  return (
    <div className="min-h-screen bg-white dark:bg-neutral-950">
      {/* Header */}
      <div className="border-b border-neutral-200 dark:border-neutral-800">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h1 className="text-4xl font-bold mb-4 text-neutral-900 dark:text-neutral-100">
            Projects
          </h1>
          <p className="text-lg text-neutral-600 dark:text-neutral-400 max-w-2xl">
            A collection of projects I&apos;ve built, from full-stack applications to
            open-source contributions. Filter by technology to explore.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        {allTechnologies.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3">
              Filter by technology
            </h2>
            <Suspense
              fallback={
                <div className="h-10 bg-neutral-100 dark:bg-neutral-800 rounded-lg animate-pulse" />
              }
            >
              <TechnologyFilters technologies={allTechnologies} />
            </Suspense>
          </div>
        )}

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project._id}
                project={project}
                stats={statsMap.get(project._id)}
              />
            ))}
          </div>
        ) : (
          <EmptyState technologies={technologies} />
        )}
      </div>
    </div>
  );
}
