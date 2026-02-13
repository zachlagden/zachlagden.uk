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
}

export function ProjectCard({ project, stats }: ProjectCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="group"
    >
      <div className="h-full border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-300 transition-colors">
        {/* Featured Image */}
        <div className="relative aspect-[16/9] overflow-hidden bg-neutral-100">
          <Image
            src={project.featuredImage}
            alt={project.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          {/* Featured badge */}
          {project.featured && (
            <span className="absolute top-3 left-3 px-2 py-1 text-xs font-medium bg-yellow-500 text-yellow-950 rounded">
              Featured
            </span>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Title */}
          <h2 className="text-xl font-semibold mb-2 text-neutral-900 line-clamp-2">
            {project.title}
          </h2>

          {/* Description */}
          <p className="text-neutral-600 text-sm leading-relaxed mb-4 line-clamp-3">
            {project.description}
          </p>

          {/* Technologies */}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {project.technologies.slice(0, 5).map((tech) => (
              <TechnologyBadge key={tech} technology={tech} />
            ))}
            {project.technologies.length > 5 && (
              <span className="text-xs text-neutral-500 self-center">
                +{project.technologies.length - 5} more
              </span>
            )}
          </div>

          {/* GitHub Stats (optional) */}
          {stats && (
            <div className="flex items-center gap-4 text-sm text-neutral-600 mb-4">
              <span className="flex items-center gap-1">
                <Star className="h-4 w-4" />
                {stats.stars.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <GitFork className="h-4 w-4" />
                {stats.forks.toLocaleString()}
              </span>
            </div>
          )}

          {/* Links */}
          <div className="flex items-center gap-3 pt-4 border-t border-neutral-100">
            {project.demoUrl && (
              <Link
                href={project.demoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <ExternalLink className="h-4 w-4" />
                Demo
              </Link>
            )}
            {project.sourceUrl && (
              <Link
                href={project.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-neutral-700 hover:text-neutral-900 transition-colors"
              >
                <Github className="h-4 w-4" />
                Source
              </Link>
            )}
            {!project.demoUrl && !project.sourceUrl && (
              <span className="text-sm text-neutral-500">
                Coming soon
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
