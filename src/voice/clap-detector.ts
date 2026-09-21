export interface ClapDetectorConfig {
  sampleRate: number;
  minPeak: number;
  minRms: number;
  minCrestFactor: number;
  doubleClapMinMs: number;
  doubleClapMaxMs: number;
  refractoryMs: number;
}

export const DEFAULT_CLAP_CONFIG: ClapDetectorConfig = {
  sampleRate: 16000,
  minPeak: 0.72,
  minRms: 0.035,
  minCrestFactor: 6,
  doubleClapMinMs: 120,
  doubleClapMaxMs: 900,
  refractoryMs: 100,
};

export interface ClapObservation {
  isTransient: boolean;
  isDoubleClap: boolean;
  peak: number;
  rms: number;
  crestFactor: number;
}

function metrics(samples: Float32Array): { peak: number; rms: number; crestFactor: number } {
  if (samples.length === 0) return { peak: 0, rms: 0, crestFactor: 0 };

  let peak = 0;
  let sumSquares = 0;

  for (const value of samples) {
    const magnitude = Math.abs(value);
    if (magnitude > peak) peak = magnitude;
    sumSquares += value * value;
  }

  const rms = Math.sqrt(sumSquares / samples.length);
  const crestFactor = rms > 0 ? peak / rms : 0;
  return { peak, rms, crestFactor };
}

/**
 * Lightweight local transient detector.
 *
 * This is intentionally NOT treated as a biometric or semantic audio model.
 * It only detects two sharp transients close together. It can be replaced by
 * a more advanced local detector later.
 */
export class DoubleClapDetector {
  private lastAcceptedClapMs: number | undefined;
  private previousClapMs: number | undefined;

  constructor(private readonly config: ClapDetectorConfig = DEFAULT_CLAP_CONFIG) {}

  process(samples: Float32Array, nowMs: number): ClapObservation {
    const { peak, rms, crestFactor } = metrics(samples);
    const isTransient =
      peak >= this.config.minPeak &&
      rms >= this.config.minRms &&
      crestFactor >= this.config.minCrestFactor;

    if (!isTransient) {
      return { isTransient: false, isDoubleClap: false, peak, rms, crestFactor };
    }

    if (
      this.lastAcceptedClapMs !== undefined &&
      nowMs - this.lastAcceptedClapMs < this.config.refractoryMs
    ) {
      return { isTransient: true, isDoubleClap: false, peak, rms, crestFactor };
    }

    this.lastAcceptedClapMs = nowMs;

    if (this.previousClapMs === undefined) {
      this.previousClapMs = nowMs;
      return { isTransient: true, isDoubleClap: false, peak, rms, crestFactor };
    }

    const gap = nowMs - this.previousClapMs;
    this.previousClapMs = nowMs;

    const isDoubleClap =
      gap >= this.config.doubleClapMinMs && gap <= this.config.doubleClapMaxMs;

    if (isDoubleClap) {
      this.previousClapMs = undefined;
    }

    return { isTransient: true, isDoubleClap, peak, rms, crestFactor };
  }

  reset(): void {
    this.lastAcceptedClapMs = undefined;
    this.previousClapMs = undefined;
  }
}
