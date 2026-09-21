import { classify } from "./classifier.js";
import { config } from "./config.js";
import { enrichGithubFromText } from "./github.js";
import { extractLinks, secureEqual, sha256 } from "./lib.js";
import { exists, save } from "./store.js";
import { maybeAlert } from "./alerts.js";
import type { CapturedNotification, RadarRecord } from "./types.js";

export function authorized(secret: string | undefined) {
  return Boolean(secret && config.ingestSecret && secureEqual(secret, config.ingestSecret));
}

function parseCapture(input: any): CapturedNotification {
  const text = String(input?.text ?? "").trim();
  if (!text) throw new Error("text_required");

  return {
    eventId: input?.eventId ? String(input.eventId).slice(0, 300) : undefined,
    sourceApp: String(input?.sourceApp ?? "unknown").slice(0, 200),
    title: input?.title ? String(input.title).slice(0, 500) : undefined,
    text: text.slice(0, 30_000),
    subText: input?.subText ? String(input.subText).slice(0, 1000) : undefined,
    postedAt: input?.postedAt ? String(input.postedAt).slice(0, 100) : undefined
  };
}

export async function ingest(input: unknown) {
  const capture = parseCapture(input);
  const fingerprint = [
    capture.sourceApp,
    capture.eventId ?? "",
    capture.title ?? "",
    capture.text,
    capture.postedAt ?? ""
  ].join("\n");
  const dedupeKey = sha256(fingerprint);

  if (await exists(dedupeKey)) return { duplicate: true, dedupeKey };

  const combinedText = `${capture.title ?? ""}\n${capture.text}\n${capture.subText ?? ""}`;
  const [classification, github] = await Promise.all([
    classify(capture),
    enrichGithubFromText(combinedText)
  ]);

  if (github.length && classification.category === "DISCUSSION" && classification.score < 7) {
    classification.category = "REPOSITORY";
    classification.score = 7;
  }
  classification.shouldAlert = classification.score >= config.alertScoreMin;

  const record: RadarRecord = {
    dedupeKey,
    capture,
    classification,
    links: extractLinks(combinedText),
    github,
    receivedAt: new Date().toISOString()
  };

  const storage = await save(record);
  const alert = await maybeAlert(record);

  return {
    duplicate: false,
    dedupeKey,
    classification,
    github: github.map(({ readmeExcerpt, ...repo }) => repo),
    storage,
    alert
  };
}
