import type {
  PresenceAction,
  PresenceState,
  PresenceTransition,
  VoiceEvent,
} from "./types.js";

export interface PresenceConfig {
  doubleClapMode: "wake-only" | "toggle";
}

export class PresenceMachine {
  private state: PresenceState = "sleeping";

  constructor(private readonly config: PresenceConfig = { doubleClapMode: "wake-only" }) {}

  getState(): PresenceState {
    return this.state;
  }

  dispatch(event: VoiceEvent): PresenceTransition {
    const previous = this.state;
    const actions: PresenceAction[] = [];

    if (
      event.type === "wake" &&
      event.source === "double-clap" &&
      this.config.doubleClapMode === "toggle" &&
      this.state !== "sleeping"
    ) {
      this.state = "sleeping";
      actions.push({ type: "cancel-assistant-audio" });
      actions.push({ type: "stop-listening" });
      actions.push({ type: "close-live-session" });
      actions.push({ type: "show-state", state: this.state });
      return { previous, current: this.state, event, actions };
    }

    switch (event.type) {
      case "wake":
        if (this.state === "sleeping" || this.state === "muted") {
          this.state = "listening";
          actions.push({ type: "open-live-session" });
          actions.push({ type: "start-listening" });
        }
        break;

      case "speech-start":
        if (this.state === "speaking") {
          actions.push({ type: "cancel-assistant-audio" });
          this.state = "listening";
        } else if (this.state !== "sleeping" && this.state !== "muted") {
          this.state = "listening";
        }
        break;

      case "speech-end":
        if (this.state === "listening") this.state = "thinking";
        break;

      case "assistant-speech-start":
        if (this.state !== "sleeping" && this.state !== "muted") {
          this.state = "speaking";
        }
        break;

      case "assistant-speech-end":
        if (this.state === "speaking") this.state = "listening";
        break;

      case "interrupt":
        if (this.state === "speaking") {
          actions.push({ type: "cancel-assistant-audio" });
          this.state = "listening";
        }
        break;

      case "sleep-command":
        if (this.state !== "sleeping") {
          this.state = "sleeping";
          actions.push({ type: "cancel-assistant-audio" });
          actions.push({ type: "stop-listening" });
          actions.push({ type: "close-live-session" });
        }
        break;

      case "mute":
        if (this.state !== "sleeping") {
          this.state = "muted";
          actions.push({ type: "stop-listening" });
        }
        break;

      case "unmute":
        if (this.state === "muted") {
          this.state = "listening";
          actions.push({ type: "start-listening" });
        }
        break;

      case "session-error":
        this.state = "sleeping";
        actions.push({ type: "cancel-assistant-audio" });
        actions.push({ type: "stop-listening" });
        actions.push({ type: "close-live-session" });
        actions.push({ type: "report-error", message: event.message });
        break;
    }

    if (previous !== this.state) {
      actions.push({ type: "show-state", state: this.state });
    }

    return { previous, current: this.state, event, actions };
  }
}
