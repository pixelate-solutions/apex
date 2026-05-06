import type { TrackPoint } from "@/lib/types/shot";

export type SpinEstimate = {
  spinRpm?: number;
  spinAxisDeg?: number;
  confidence: number;
  warnings: string[];
};

export function estimateSpinFromVideo(_track: TrackPoint[]): SpinEstimate {
  return {
    confidence: 0,
    warnings: [
      "Spin detection is not available from plain center-point tracking. Add marked-ball texture tracking or radar spin samples.",
    ],
  };
}
