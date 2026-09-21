export interface LiveSessionEvents {
  onUserSpeechStart?: () => void;
  onUserSpeechEnd?: () => void;
  onAssistantSpeechStart?: () => void;
  onAssistantSpeechEnd?: () => void;
  onTranscript?: (role: "user" | "assistant", delta: string) => void;
  onError?: (error: Error) => void;
}

export interface LiveVoiceSession {
  connect(events: LiveSessionEvents): Promise<void>;
  disconnect(): Promise<void>;
  interrupt(): Promise<void>;
  isConnected(): boolean;
}

/**
 * The first production target is a WebRTC full-duplex provider with client
 * delegation to Roby Core. The interface stays provider-agnostic so voice
 * transport can change without replacing Roby's memory or intelligence.
 */
export interface LiveVoiceProvider {
  readonly name: string;
  createSession(): Promise<LiveVoiceSession>;
}
