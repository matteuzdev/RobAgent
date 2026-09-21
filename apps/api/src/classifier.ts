import { config } from "./config.js";
import { clampScore } from "./lib.js";
import type { CapturedNotification, Classification, Category } from "./types.js";
import { categories } from "./types.js";

const categorySet = new Set<string>(categories);

function heuristic(capture: CapturedNotification): Classification {
  const text = `${capture.title ?? ""} ${capture.text}`.toLowerCase();
  let category: Category = "DISCUSSION";
  let score = 4;
  const tags: string[] = [];

  if (/github\.com\//.test(text)) {
    category = "REPOSITORY"; score = 8; tags.push("github");
  } else if (/\bmcp\b|model context protocol/.test(text)) {
    category = "MCP"; score = 7; tags.push("mcp");
  } else if (/agent|agente|multi-agent|multiagente/.test(text)) {
    category = "AI_AGENT"; score = 6; tags.push("agents");
  } else if (/automação|automation|n8n|workflow/.test(text)) {
    category = "AUTOMATION"; score = 6; tags.push("automation");
  }

  return {
    category,
    score,
    summary: capture.text.slice(0, 280),
    reason: "Heuristic classification because no AI provider is configured or the provider failed.",
    tags,
    relatedProjects: [],
    shouldAlert: score >= config.alertScoreMin
  };
}

function normalize(raw: any): Classification {
  const category: Category = categorySet.has(raw?.category) ? raw.category : "DISCUSSION";
  const score = clampScore(Number(raw?.score ?? 0));
  return {
    category,
    score,
    summary: String(raw?.summary ?? "").slice(0, 700),
    reason: String(raw?.reason ?? "").slice(0, 700),
    tags: Array.isArray(raw?.tags) ? raw.tags.map(String).slice(0, 12) : [],
    relatedProjects: Array.isArray(raw?.relatedProjects) ? raw.relatedProjects.map(String).slice(0, 8) : [],
    shouldAlert: score >= config.alertScoreMin
  };
}

export async function classify(capture: CapturedNotification): Promise<Classification> {
  if (!config.aiApiKey || !config.aiModel) return heuristic(capture);

  try {
    const response = await fetch(`${config.aiBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${config.aiApiKey}`
      },
      body: JSON.stringify({
        model: config.aiModel,
        temperature: 0.1,
        messages: [
          {
            role: "system",
            content:
              "Return only JSON with category, score, summary, reason, tags, relatedProjects. " +
              "category must be one of REPOSITORY, AI_AGENT, SKILL, MCP, AUTOMATION, MODEL, PROMPT, PAPER, NEWS, DISCUSSION, DISCARD. " +
              "score is 0-10. Score 8-10 only for unusually actionable/high-signal material. Be strict and concise."
          },
          {
            role: "user",
            content: JSON.stringify({
              sourceApp: capture.sourceApp,
              title: capture.title ?? "",
              text: capture.text
            })
          }
        ]
      })
    });

    if (!response.ok) throw new Error(`ai_http_${response.status}`);
    const body: any = await response.json();
    const content = body?.choices?.[0]?.message?.content;
    if (typeof content !== "string") throw new Error("ai_missing_content");
    const start = content.indexOf("{");
    const end = content.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("ai_invalid_json");
    return normalize(JSON.parse(content.slice(start, end + 1)));
  } catch (error) {
    console.error("[classifier] falling back to heuristic", error);
    return heuristic(capture);
  }
}
