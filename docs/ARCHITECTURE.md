# Architecture

## Goal
Capture high-signal technical intelligence continuously while minimizing manual reading and avoiding an unofficial WhatsApp client.

## Components

### Android collector
Uses Android `NotificationListenerService` and filters:
- `com.whatsapp`
- `com.whatsapp.w4b`

It sends only notification fields exposed by Android.

### Ingestion API
Pipeline:
1. shared-secret authentication
2. payload validation
3. deterministic dedupe
4. AI classification
5. GitHub enrichment
6. storage
7. optional alert webhook

### AI classification
Uses an OpenAI-compatible chat-completions endpoint. Without a configured provider, deterministic heuristics keep the pipeline operational.

Categories:
`REPOSITORY, AI_AGENT, SKILL, MCP, AUTOMATION, MODEL, PROMPT, PAPER, NEWS, DISCUSSION, DISCARD`.

### GitHub enrichment
Repository links are resolved against GitHub metadata plus a README excerpt. A token is optional but recommended for rate limits.

### Storage
Supabase/Postgres stores raw captured text plus structured intelligence.

### Alerts
Items at or above `ALERT_SCORE_MIN` can be forwarded to a generic webhook, keeping n8n/Make/Telegram replaceable.

## Next
- authenticated web dashboard
- search
- digest jobs
- project-aware relevance
- group/source allowlist
- useful/not-useful feedback loop
- durable Android outbox/retry
