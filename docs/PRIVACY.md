# Privacy and operating rules

RobAgent may process private group notifications. Treat that data as sensitive.

## Required
- Get appropriate permission/consent for groups where collection is enabled.
- Keep Supabase service-role keys, AI keys, GitHub tokens and collector secrets out of Git.
- Use HTTPS outside local development.
- Store only what is necessary.
- Define a retention policy.
- Never expose the service-role key to Android or browser clients.
- Rotate the collector secret if the phone is lost or configuration is shared.

## Design choice
The Android collector uses notification access instead of logging into WhatsApp through an unofficial client.

## Public repository warning
This repository is public. Captured messages, exports, screenshots, database dumps and personal configuration must never be committed.
