import { config } from "./config.js";
import type { GithubRepoInfo } from "./types.js";

const repoRegex = /https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\/[^\s]*)?/gi;

export function extractGithubRepos(text: string) {
  const repos = new Set<string>();
  for (const match of text.matchAll(repoRegex)) {
    const owner = match[1];
    const rawRepo = match[2];
    if (!owner || !rawRepo) continue;
    repos.add(`${owner}/${rawRepo.replace(/\.git$/, "")}`);
  }
  return [...repos];
}

function headers(accept = "application/vnd.github+json") {
  return {
    Accept: accept,
    "User-Agent": "RobAgent-AI-Radar",
    ...(config.githubToken ? { Authorization: `Bearer ${config.githubToken}` } : {})
  };
}

export async function enrichGithubRepo(fullName: string): Promise<GithubRepoInfo | null> {
  try {
    const repoResponse = await fetch(`https://api.github.com/repos/${fullName}`, { headers: headers() });
    if (!repoResponse.ok) throw new Error(`github_repo_http_${repoResponse.status}`);
    const repo: any = await repoResponse.json();

    let readmeExcerpt: string | undefined;
    const readmeResponse = await fetch(`https://api.github.com/repos/${fullName}/readme`, {
      headers: headers("application/vnd.github.raw+json")
    });
    if (readmeResponse.ok) readmeExcerpt = (await readmeResponse.text()).slice(0, 6000);

    return {
      url: repo.html_url,
      fullName: repo.full_name,
      description: repo.description ?? null,
      stars: repo.stargazers_count ?? 0,
      forks: repo.forks_count ?? 0,
      openIssues: repo.open_issues_count ?? 0,
      language: repo.language ?? null,
      license: repo.license?.spdx_id ?? null,
      defaultBranch: repo.default_branch ?? "main",
      pushedAt: repo.pushed_at ?? null,
      archived: Boolean(repo.archived),
      readmeExcerpt
    };
  } catch (error) {
    console.error("[github] enrichment failed", fullName, error);
    return null;
  }
}

export async function enrichGithubFromText(text: string) {
  const results = await Promise.all(extractGithubRepos(text).slice(0, 5).map(enrichGithubRepo));
  return results.filter((item): item is GithubRepoInfo => Boolean(item));
}
