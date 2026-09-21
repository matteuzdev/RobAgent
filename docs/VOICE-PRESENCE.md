# Roby Voice Presence — no-button interaction

Roby is designed to feel like a robot/presence, not a push-to-talk chatbot.

## Interaction model

Default state: **sleeping locally**.

Ways to wake Roby:
1. Say the configured wake phrase (target: "Roby") using a local wake-word engine.
2. Make **two claps** within the configured timing window.
3. Optional keyboard/system shortcut exists only as a recovery fallback, not as the normal interaction.

Once awake, Roby enters a full-duplex conversation:
- the microphone remains open for natural turn-taking;
- voice activity detection determines when the user starts/stops speaking;
- the user can interrupt Roby while it is talking;
- Roby can continue speaking while its backend is working on delegated tasks;
- there is no requirement to click a microphone button for every turn.

Ways to sleep/close:
- say "Roby, pode dormir";
- say "Roby, encerra a conversa";
- say "Tchau, Roby";
- optional double-clap toggle can be enabled, but wake-only is the safer default.

## Architecture decision

```text
Always-on local microphone listener
        |
        +--> local Wake Word ("Roby")
        |
        +--> local Double-Clap Detector
        |
        v
Presence State Machine
        |
        v
Voice Session (WebRTC, full duplex)
        |
        v
GPT-Live / voice transport
        |
        +--> natural speech / interruption
        |
        +--> client delegation
                  |
                  v
             Roby Core
        memory / research / Cangaço / tools / verification
```

### Why this architecture

The wake detector remains local, so sleeping mode does not need to continuously stream room audio to a cloud model.

For the live conversation layer, the preferred implementation is a WebRTC full-duplex voice transport. The backend remains model-agnostic: the voice layer can delegate actual reasoning and tool work to Roby Core.

This prevents the voice persona from becoming the system of record. Roby's memory, permissions, tools and verification remain in the backend.

## Voice cutting / chopped audio

The design explicitly avoids a naive sequential loop:

`record -> stop -> speech-to-text -> wait -> LLM -> text-to-speech -> play`

That pipeline commonly feels robotic and creates long gaps.

The preferred live path uses:
- continuous media track;
- server or model VAD;
- interruption / barge-in support;
- streamed audio playback;
- a single persistent voice session;
- delegated backend work rather than closing/reopening audio turns.

We will still measure:
- time to first audible response;
- unexpected silence;
- overlap;
- interruptions;
- session drops;
- truncated playback.

## Desktop-first

A normal browser tab is not the final shell. Roby should become a desktop app that can:
- live in the system tray;
- keep the wake listener alive while the UI is hidden;
- open a side panel when needed;
- show an unmistakable microphone/camera state;
- keep voice presence separate from the dashboard.

On first use, Windows/macOS/browser security may require one explicit microphone permission grant. That operating-system permission cannot and should not be bypassed.

## Privacy defaults

- microphone wake processing: local-first;
- camera: OFF by default;
- raw audio: not persisted by default;
- raw camera frames: not persisted by default;
- API keys: never committed;
- active listening / camera indicators: always visible somewhere in the desktop shell.

## Configuration

Suggested runtime config:

```env
ROBY_WAKE_MODE=hybrid
ROBY_WAKE_PHRASE=Roby
ROBY_DOUBLE_CLAP_MODE=wake-only
ROBY_SLEEP_PHRASES=roby pode dormir|roby encerra a conversa|tchau roby
ROBY_VOICE_TRANSPORT=gpt-live
ROBY_VISION_MODE=off
```
