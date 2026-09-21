import type { WakeSource } from "./types.js";

export interface WakeDetection {
  source: WakeSource;
  confidence?: number;
  occurredAt: string;
}

export interface WakeEngine {
  readonly name: string;
  start(onWake: (event: WakeDetection) => void): Promise<void>;
  stop(): Promise<void>;
}

export class CompositeWakeEngine implements WakeEngine {
  readonly name = "composite";

  constructor(private readonly engines: WakeEngine[]) {}

  async start(onWake: (event: WakeDetection) => void): Promise<void> {
    await Promise.all(this.engines.map((engine) => engine.start(onWake)));
  }

  async stop(): Promise<void> {
    await Promise.allSettled(this.engines.map((engine) => engine.stop()));
  }
}

/**
 * Adapter boundary for a future local custom wake-word engine.
 *
 * Preferred implementation target: Porcupine or another local wake-word
 * engine trained for the phrase "Roby". The Roby Core never depends on a
 * specific vendor.
 */
export abstract class LocalWakeWordEngine implements WakeEngine {
  abstract readonly name: string;
  abstract start(onWake: (event: WakeDetection) => void): Promise<void>;
  abstract stop(): Promise<void>;
}
