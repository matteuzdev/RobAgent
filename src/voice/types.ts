export type PresenceState =
  | "sleeping"
  | "listening"
  | "thinking"
  | "speaking"
  | "muted";

export type WakeSource = "wake-word" | "double-clap" | "system-shortcut";

export type VoiceEvent =
  | { type: "wake"; source: WakeSource }
  | { type: "speech-start" }
  | { type: "speech-end" }
  | { type: "assistant-speech-start" }
  | { type: "assistant-speech-end" }
  | { type: "interrupt" }
  | { type: "sleep-command"; transcript: string }
  | { type: "mute" }
  | { type: "unmute" }
  | { type: "session-error"; message: string };

export interface PresenceTransition {
  previous: PresenceState;
  current: PresenceState;
  event: VoiceEvent;
  actions: PresenceAction[];
}

export type PresenceAction =
  | { type: "open-live-session" }
  | { type: "close-live-session" }
  | { type: "start-listening" }
  | { type: "stop-listening" }
  | { type: "cancel-assistant-audio" }
  | { type: "show-state"; state: PresenceState }
  | { type: "report-error"; message: string };
