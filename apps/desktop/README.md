# Roby Desktop Presence

This is the first runnable shell for the "Roby is a robot/presence" interaction model.

## Current behavior

- opens as a side panel;
- requests microphone permission once;
- keeps a **local** microphone analyser active while sleeping;
- detects two sharp claps and wakes Roby;
- creates a GPT-Live WebRTC session only after wake;
- uses a persistent full-duplex audio connection during the conversation;
- shows live transcript deltas;
- detects natural voice sleep phrases from the transcript;
- "Roby, pode dormir" ends the Live session;
- "Roby, pode fechar" ends the session and hides the panel;
- closing the window hides it rather than killing the local presence process;
- tray menu can reopen or quit the app.

## Run

1. Copy `.env.example` to `.env`.
2. Set `OPENAI_API_KEY`.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start:
   ```bash
   npm run desktop
   ```

Then grant microphone permission when the operating system asks.

## Voice stack

The current runnable path uses:
- local clap trigger;
- GPT-Live over WebRTC;
- Portuguese voice configured with `ROBY_LIVE_VOICE` (default: `tempo`);
- Responses delegation for substantive backend work.

This is intentionally a first runtime. The planned next layer replaces direct Responses delegation with **client delegation into Roby Core**, so Cangaço selection, memory, permissions, research and verification all run through the same core used by text interactions.

## Wake word

The abstraction for a local wake-word engine already exists in `src/voice/wake-engine.ts`. The next implementation target is a local detector trained for "Roby". The clap trigger is deliberately usable without a cloud always-listening stream.

## About secrets

The repository can remain public, but API keys/tokens must stay in `.env`, which is ignored by git.
