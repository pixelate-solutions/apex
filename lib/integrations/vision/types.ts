import type { Calibration, TrackPoint, VisionFrame } from "@/lib/types/shot";

export type VisionEngineDiagnostics = {
  engine: "typescript-canvas" | "opencv-wasm" | "python-service";
  version: string;
  warnings: string[];
};

export type VisionEngineResult = {
  track: TrackPoint[];
  diagnostics: VisionEngineDiagnostics;
};

export interface VisionEngine {
  id: string;
  analyze(frames: VisionFrame[], calibration: Calibration): Promise<VisionEngineResult>;
}
