import { config } from "./config.js";
import type { RadarRecord } from "./types.js";

export async function maybeAlert(record: RadarRecord) {
  if (!record.classification.shouldAlert || !config.alertWebhookUrl) return { sent: false };

  try {
    const response = await fetch(config.alertWebhookUrl, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        type: "robagent.radar.high_signal",
        score: record.classification.score,
        category: record.classification.category,
        summary: record.classification.summary,
        reason: record.classification.reason,
        tags: record.classification.tags,
        links: record.links,
        github: record.github.map(({ readmeExcerpt, ...repo }) => repo),
        receivedAt: record.receivedAt
      })
    });

    if (!response.ok) throw new Error(`alert_http_${response.status}`);
    return { sent: true };
  } catch (error) {
    console.error("[alerts] webhook failed", error);
    return { sent: false };
  }
}
