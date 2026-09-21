# RobAgent — AI Radar

RobAgent is a private-by-design intelligence radar for high-signal WhatsApp groups and other feeds.

It captures notifications from an Android device, sends them to a small ingestion API, classifies each item with AI, enriches GitHub links, stores the result in Supabase, and raises an alert only when the item is important enough.

## Flow

```
WhatsApp notification
        ↓
Android NotificationListener
        ↓
POST /v1/ingest/android
        ↓
dedupe → classify → GitHub enrichment
        ↓
Supabase
        ↓
score >= threshold → alert webhook
```

## Implemented

- Android listener for WhatsApp and WhatsApp Business notifications
- authenticated ingestion endpoint
- message deduplication
- AI classification with an OpenAI-compatible endpoint
- heuristic fallback when no model is configured
- automatic GitHub repository enrichment
- Supabase persistence through REST
- configurable high-priority alert webhook
- health endpoint
- privacy and architecture docs

## API quick start

Requirements: Node.js 20+.

```bash
cp .env.example .env
npm install
npm run dev
```

Health check:

```bash
curl http://localhost:8787/health
```

Run `supabase/migrations/001_ai_radar.sql` in Supabase before production use.

## Android collector

Open `apps/android-listener` in Android Studio. Set the API URL and collector secret in `app/build.gradle.kts`, install the app, then tap **Open notification access** and authorize RobAgent.

The collector does not log in to WhatsApp, scrape WhatsApp Web, or use an unofficial WhatsApp client. It receives only notification data Android exposes to the app.

## Environment

See `.env.example`.

- `RADAR_INGEST_SECRET` — secret shared with the Android collector
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`
- `GITHUB_TOKEN` — optional, increases GitHub API limits
- `ALERT_WEBHOOK_URL` — optional, e.g. n8n
- `ALERT_SCORE_MIN` — default 8

## Privacy

Never commit WhatsApp exports, notification dumps, screenshots, model keys, service-role keys or tokens. See `docs/PRIVACY.md`.

## Next layer

An authenticated dashboard/search interface over the stored intelligence: filters by category, score, repo, project and date, plus daily/weekly digests.
