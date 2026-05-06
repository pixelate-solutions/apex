import { z } from "zod";

export const viewTypeSchema = z.enum(["side", "down-the-line", "unknown"]);
export type ViewType = z.infer<typeof viewTypeSchema>;

export const unitsSchema = z.enum(["imperial", "metric"]);
export type Units = z.infer<typeof unitsSchema>;

export const calibrationSchema = z.object({
  fps: z.number().positive(),
  ballDiameterMm: z.number().positive(),
  pixelsPerMeter: z.number().positive(),
  startFrameIndex: z.number().int().nonnegative(),
  originPx: z.object({ x: z.number(), y: z.number() }),
  ballRadiusPx: z.number().positive(),
  viewType: viewTypeSchema,
});
export type Calibration = z.infer<typeof calibrationSchema>;

export const trackPointSchema = z.object({
  frameIndex: z.number().int().nonnegative(),
  timestampMs: z.number().nonnegative(),
  x: z.number(),
  y: z.number(),
  radiusPx: z.number().positive(),
  confidence: z.number().min(0).max(1),
  detected: z.boolean(),
  manuallyCorrected: z.boolean().optional(),
});
export type TrackPoint = z.infer<typeof trackPointSchema>;

export type VisionFrame = {
  frameIndex: number;
  timestampMs: number;
  width: number;
  height: number;
  imageData: ImageData;
  dataUrl?: string;
};

export const metricsSchema = z.object({
  speedMps: z.number(),
  speedMph: z.number(),
  speedKmh: z.number(),
  launchAngleDeg: z.number(),
  estimatedCarryYards: z.number(),
  estimatedCarryMeters: z.number(),
  fitR2: z.number(),
  framesUsed: z.number().int(),
  warnings: z.array(z.string()),
});
export type LaunchMetrics = z.infer<typeof metricsSchema>;

export const confidenceSchema = z.object({
  score: z.number().min(0).max(100),
  level: z.enum(["low", "medium", "high"]),
  reasons: z.array(z.string()),
});
export type ConfidenceResult = z.infer<typeof confidenceSchema>;

export const shotSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  videoName: z.string(),
  calibration: calibrationSchema,
  track: z.array(trackPointSchema),
  metrics: metricsSchema,
  confidence: confidenceSchema,
  notes: z.string().default(""),
  thumbnailDataUrl: z.string().optional(),
});
export type SavedShot = z.infer<typeof shotSchema>;

export const settingsSchema = z.object({
  fps: z.number().positive().default(240),
  ballDiameterMm: z.number().positive().default(42.67),
  units: unitsSchema.default("imperial"),
  confidenceThreshold: z.number().min(0).max(100).default(70),
  analysisFrameCount: z.union([z.literal(10), z.literal(20), z.literal(30), z.literal(60)]).default(30),
  experimental: z.object({
    aggressiveSearch: z.boolean().default(false),
    retainThumbnails: z.boolean().default(true),
  }),
});
export type AppSettings = z.infer<typeof settingsSchema>;

export type VideoFileState = {
  file: File;
  url: string;
  durationSec?: number;
};
