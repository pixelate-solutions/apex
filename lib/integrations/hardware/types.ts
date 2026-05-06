import type { Calibration, TrackPoint } from "@/lib/types/shot";

export type HardwareTimestamp = {
  capturedAt: string;
  monotonicMs?: number;
};

export type HighSpeedCameraFrame = {
  frameIndex: number;
  timestamp: HardwareTimestamp;
  width: number;
  height: number;
  bytes: ArrayBuffer;
  encoding: "jpeg" | "raw-rgb" | "raw-bayer";
};

export type RadarSample = {
  timestamp: HardwareTimestamp;
  speedMps?: number;
  launchAngleDeg?: number;
  azimuthDeg?: number;
  spinRpm?: number;
  spinAxisDeg?: number;
  confidence: number;
};

export type HardwareHealth = {
  connected: boolean;
  label: string;
  detail: string;
};

export interface HighSpeedCameraAdapter {
  id: string;
  getHealth(): Promise<HardwareHealth>;
  captureFrames(options: { frameCount: number; fps: number }): Promise<HighSpeedCameraFrame[]>;
  calibrate?(calibration: Calibration): Promise<void>;
}

export interface RadarAdapter {
  id: string;
  getHealth(): Promise<HardwareHealth>;
  readLaunchWindow(options: { durationMs: number }): Promise<RadarSample[]>;
}

export type HardwareFusionInput = {
  track: TrackPoint[];
  radarSamples: RadarSample[];
};
