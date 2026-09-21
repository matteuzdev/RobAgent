export const categories = [
  "REPOSITORY","AI_AGENT","SKILL","MCP","AUTOMATION","MODEL",
  "PROMPT","PAPER","NEWS","DISCUSSION","DISCARD"
] as const;

export type Category = (typeof categories)[number];

export type CapturedNotification = {
  eventId?: string;
  sourceApp: string;
  title?: string;
  text: string;
  subText?: string;
  postedAt?: string;
};

export type Classification = {
  category: Category;
  score: number;
  summary: string;
  reason: string;
  tags: string[];
  relatedProjects: string[];
  shouldAlert: boolean;
};

export type GithubRepoInfo = {
  url: string;
  fullName: string;
  description: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  language: string | null;
  license: string | null;
  defaultBranch: string;
  pushedAt: string | null;
  archived: boolean;
  readmeExcerpt?: string;
};

export type RadarRecord = {
  dedupeKey: string;
  capture: CapturedNotification;
  classification: Classification;
  links: string[];
  github: GithubRepoInfo[];
  receivedAt: string;
};
