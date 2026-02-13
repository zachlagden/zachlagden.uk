"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ExternalLink, Github, Star, GitFork } from "lucide-react";
import type { SerializedProject } from "@/models/Project";
import { TechnologyBadge } from "./TechnologyBadge";

interface GitHubStats {
  stars: number;
  forks: number;
  lastUpdate: string;
}

interface ProjectCardProps {
  project: SerializedProject;
  stats?: GitHubStats | null;
  index?: number;
}

export function ProjectCard({ project, stats, index = 0 }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
      className="group"
    >
      <div className="flex h-full flex-col overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900 transition-colors hover:border-cyan-500/20">
        {/* Featured Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-zinc-800">
          <Image
            src={project.featuredImage}
            alt={project.title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
          {/* Featured badge */}
          {project.featured && (
            <span className="absolute left-3 top-3 rounded bg-cyan-500 px-2 py-1 text-xs font-medium text-zinc-950">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-1 flex-col p-6">
          {/* Title */}
          <h2 className="font-heading text-xl font-semibold text-zinc-100 line-clamp-2">
            {project.title}
          </h2>

          {/* Description */}
          <p className="mt-2 flex-1 text-sm leading-relaxed text-zinc-400 line-clamp-3">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="mt-4 flex flex-wrap gap-1.5">
            {project.technologies.slice(0, 5).map((tech) => (
              <TechnologyBadge key={tech} technology={tech} />
            ))}
            {project.technologies.length > 5 && (
              <span className="self-center text-xs text-zinc-500">
                +{project.technologies.length - 5} more
              </span>
            )}
          </div>

          {/* GitHub Stats */}
          {stats && (
            <div className="mt-4 flex items-center gap-4 font-mono text-sm text-zinc-500">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" aria-hidden="true" />
                {stats.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" aria-hidden="true" />
                {stats.forks.toLocaleString()}
              </span>
            </div>
          )}

          {/* Links */}
          <div className="mt-4 flex items-center gap-4 border-t border-zinc-800 pt-4">
            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-cyan-500"
              >
                <ExternalLink className="h-4 w-4" aria-hidden="true" />
                Demo
              </Link>
            )}
            {project.sourceUrl && (
              <Link
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm text-zinc-400 transition-colors hover:text-cyan-500"
              >
                <Github className="h-4 w-4" aria-hidden="true" />
                Source
              </Link>
            )}
            {!project.demoUrl && !project.sourceUrl && (
              <span className="text-sm text-zinc-500">Coming soon</span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
