function numberEnv(name: string, fallback: number): number {
  const value = Number(process.env[name]);
  return Number.isFinite(value) ? value : fallback;
}

export const config = {
  port: numberEnv("PORT", 8787),
  ingestSecret: process.env.RADAR_INGEST_SECRET ?? "",
  supabaseUrl: process.env.SUPABASE_URL ?? "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",
  aiBaseUrl: (process.env.AI_BASE_URL ?? "https://api.openai.com/v1").replace(/\/$/, ""),
  aiApiKey: process.env.AI_API_KEY ?? "",
  aiModel: process.env.AI_MODEL ?? "",
  githubToken: process.env.GITHUB_TOKEN ?? "",
  alertWebhookUrl: process.env.ALERT_WEBHOOK_URL ?? "",
  alertScoreMin: numberEnv("ALERT_SCORE_MIN", 8)
};

export function assertRuntimeConfig() {
  if (!config.ingestSecret) {
    console.warn("[config] RADAR_INGEST_SECRET is empty. Ingestion will reject every request until configured.");
  }
}
