import { config } from "./config.js";
import type { RadarRecord } from "./types.js";

const memoryDedupe = new Set<string>();

function supabaseHeaders() {
  return {
    apikey: config.supabaseServiceRoleKey,
    authorization: `Bearer ${config.supabaseServiceRoleKey}`,
    "content-type": "application/json"
  };
}

export async function exists(dedupeKey: string): Promise<boolean> {
  if (memoryDedupe.has(dedupeKey)) return true;
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) return false;

  const url = new URL("/rest/v1/radar_items", config.supabaseUrl);
  url.searchParams.set("dedupe_key", `eq.${dedupeKey}`);
  url.searchParams.set("select", "dedupe_key");
  url.searchParams.set("limit", "1");

  try {
    const response = await fetch(url, { headers: supabaseHeaders() });
    if (!response.ok) throw new Error(`supabase_http_${response.status}`);
    const rows: unknown[] = await response.json();
    return rows.length > 0;
  } catch (error) {
    console.error("[store] dedupe lookup failed; continuing", error);
    return false;
  }
}

export async function save(record: RadarRecord) {
  memoryDedupe.add(record.dedupeKey);

  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    console.log("[store] Supabase not configured; process-level dedupe only", record.dedupeKey);
    return { persisted: false };
  }

  const response = await fetch(new URL("/rest/v1/radar_items", config.supabaseUrl), {
    method: "POST",
    headers: {
      ...supabaseHeaders(),
      Prefer: "return=minimal,resolution=ignore-duplicates"
    },
    body: JSON.stringify({
      dedupe_key: record.dedupeKey,
      source_app: record.capture.sourceApp,
      source_title: record.capture.title ?? null,
      message_text: record.capture.text,
      message_subtext: record.capture.subText ?? null,
      posted_at: record.capture.postedAt ?? null,
      received_at: record.receivedAt,
      category: record.classification.category,
      score: record.classification.score,
      summary: record.classification.summary,
      reason: record.classification.reason,
      tags: record.classification.tags,
      related_projects: record.classification.relatedProjects,
      links: record.links,
      github_data: record.github
    })
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`supabase_insert_${response.status}: ${body.slice(0, 500)}`);
  }

  return { persisted: true };
}
