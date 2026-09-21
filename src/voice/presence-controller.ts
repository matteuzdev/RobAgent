import { VoiceCommandDetector } from "./commands.js";
import type { LiveVoiceProvider, LiveVoiceSession } from "./live-session.js";
import { PresenceMachine } from "./presence-machine.js";
import type { PresenceTransition, WakeSource } from "./types.js";

export interface PresenceControllerEvents {
  onTransition?: (transition: PresenceTransition) => void;
  onTranscript?: (role: "user" | "assistant", delta: string) => void;
}

export class PresenceController {
  private readonly machine: PresenceMachine;
  private readonly commands: VoiceCommandDetector;
  private session: LiveVoiceSession | undefined;

  constructor(
    private readonly provider: LiveVoiceProvider,
    private readonly events: PresenceControllerEvents = {},
    options: {
      doubleClapMode?: "wake-only" | "toggle";
      sleepPhrases?: string[];
    } = {}
  ) {
    this.machine = new PresenceMachine({
      doubleClapMode: options.doubleClapMode ?? "wake-only",
    });
    this.commands = new VoiceCommandDetector(options.sleepPhrases);
  }

  getState() {
    return this.machine.getState();
  }

  async wake(source: WakeSource): Promise<void> {
    const transition = this.machine.dispatch({ type: "wake", source });
    this.events.onTransition?.(transition);
    await this.apply(transition);
  }

  async acceptUserTranscript(delta: string): Promise<void> {
    this.events.onTranscript?.("user", delta);
    if (this.commands.isSleepCommand(delta)) {
      const transition = this.machine.dispatch({
        type: "sleep-command",
        transcript: delta,
      });
      this.events.onTransition?.(transition);
      await this.apply(transition);
    }
  }

  async sleep(reason = "explicit sleep"): Promise<void> {
    const transition = this.machine.dispatch({
      type: "sleep-command",
      transcript: reason,
    });
    this.events.onTransition?.(transition);
    await this.apply(transition);
  }

  private async apply(transition: PresenceTransition): Promise<void> {
    for (const action of transition.actions) {
      if (action.type === "open-live-session") {
        if (!this.session) {
          this.session = await this.provider.createSession();
          await this.session.connect({
            onUserSpeechStart: () => this.dispatch({ type: "speech-start" }),
            onUserSpeechEnd: () => this.dispatch({ type: "speech-end" }),
            onAssistantSpeechStart: () =>
              this.dispatch({ type: "assistant-speech-start" }),
            onAssistantSpeechEnd: () =>
              this.dispatch({ type: "assistant-speech-end" }),
            onTranscript: (role, delta) => {
              this.events.onTranscript?.(role, delta);
              if (role === "user") void this.acceptUserTranscript(delta);
            },
            onError: (error) =>
              this.dispatch({ type: "session-error", message: error.message }),
          });
        }
      }

      if (action.type === "close-live-session") {
        if (this.session) {
          await this.session.disconnect();
          this.session = undefined;
        }
      }

      if (action.type === "cancel-assistant-audio") {
        await this.session?.interrupt();
      }
    }
  }

  private dispatch(event: Parameters<PresenceMachine["dispatch"]>[0]): void {
    const transition = this.machine.dispatch(event);
    this.events.onTransition?.(transition);
    void this.apply(transition);
  }
}
