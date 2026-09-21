# Agent instructions

## Product
RobAgent is an AI intelligence radar. Current priority: reliable capture, filtering, enrichment and retrieval of high-signal technical information.

## Rules
1. Never commit captured messages, secrets or tokens.
2. Prefer official APIs and local/device capabilities over brittle scraping.
3. Treat ingestion as idempotent.
4. External integrations fail soft: an AI, GitHub or alert outage must not discard the original item.
5. Keep AI providers replaceable through OpenAI-compatible configuration.
6. High-impact outbound actions remain explicit and auditable.
7. Add infrastructure only when it reduces operating complexity.

## Current architecture
Android NotificationListener → API → classifier/GitHub enrichment → Supabase → optional high-score webhook.

## Definition of done
A change builds, configuration is documented, and failure paths do not silently discard captured data.
