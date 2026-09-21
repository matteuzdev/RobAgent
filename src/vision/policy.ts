export type VisionMode = "off" | "on-demand" | "ambient";

export interface VisionPolicy {
  mode: VisionMode;
  persistRawFrames: boolean;
  localFirst: boolean;
  visibleIndicatorRequired: boolean;
}

export const DEFAULT_VISION_POLICY: VisionPolicy = {
  mode: "off",
  persistRawFrames: false,
  localFirst: true,
  visibleIndicatorRequired: true,
};

export function canCaptureFrame(policy: VisionPolicy, explicitRequest: boolean): boolean {
  if (policy.mode === "off") return false;
  if (policy.mode === "on-demand") return explicitRequest;
  return true;
}
