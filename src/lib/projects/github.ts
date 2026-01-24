import { Octokit } from "octokit";
import { unstable_cache } from "next/cache";

// Initialize Octokit with optional auth token
// Using GITHUB_TOKEN env var (if set) increases rate limit from 60/hour to 5000/hour
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

export interface GitHubStats {
  stars: number;
  forks: number;
  lastUpdate: string;
}

/**
 * Fetch repository stats from GitHub API (uncached)
 * @param owner - GitHub username or org
 * @param repo - Repository name
 * @returns Stats object or null if repo not found/private
 */
async function fetchRepoStatsUncached(
  owner: string,
  repo: string
): Promise<GitHubStats | null> {
  try {
    const { data } = await octokit.rest.repos.get({
      owner,
      repo,
    });

    return {
      stars: data.stargazers_count,
      forks: data.forks_count,
      lastUpdate: data.pushed_at,
    };
  } catch (error: unknown) {
    // Handle specific error cases
    if (error && typeof error === "object" && "status" in error) {
      const status = (error as { status: number }).status;
      if (status === 404) {
        // Repo not found or private - expected case
        console.log(`GitHub repo not found: ${owner}/${repo}`);
        return null;
      }
      if (status === 403) {
        // Rate limited - log but don't crash
        console.warn(`GitHub rate limited when fetching ${owner}/${repo}`);
        return null;
      }
    }
    // Unexpected error - log and return null
    console.error(`Failed to fetch GitHub stats for ${owner}/${repo}:`, error);
    return null;
  }
}

/**
 * Get repository stats with caching (10 minute revalidation)
 * Cache key is based on owner/repo to enable per-repo caching
 */
export const getRepoStats = unstable_cache(
  fetchRepoStatsUncached,
  ["github-repo-stats"],
  {
    revalidate: 600, // 10 minutes
    tags: ["github-stats"],
  }
);

/**
 * Parse "owner/repo" format into components
 * @param githubRepo - String in "owner/repo" format
 * @returns Tuple of [owner, repo] or null if invalid format
 */
export function parseGitHubRepo(
  githubRepo: string | null | undefined
): [string, string] | null {
  if (!githubRepo) return null;

  const parts = githubRepo.split("/");
  if (parts.length !== 2) return null;

  const [owner, repo] = parts;
  if (!owner || !repo) return null;

  return [owner, repo];
}

/**
 * Convenience function to get stats from "owner/repo" format
 * @param githubRepo - String in "owner/repo" format
 * @returns Stats or null
 */
export async function getProjectGitHubStats(
  githubRepo: string | null | undefined
): Promise<GitHubStats | null> {
  const parsed = parseGitHubRepo(githubRepo);
  if (!parsed) return null;

  const [owner, repo] = parsed;
  return getRepoStats(owner, repo);
}
