import type { Calibration, TrackPoint, VisionFrame } from "@/lib/types/shot";
import { detectBall } from "@/lib/vision/ball-detection";
import { clamp } from "@/lib/utils";

export type TrackBallOptions = {
  aggressiveSearch?: boolean;
  corrections?: Record<number, { x: number; y: number }>;
};

export function trackBall(frames: VisionFrame[], calibration: Calibration, options: TrackBallOptions = {}): TrackPoint[] {
  if (!frames.length) return [];
  // TODO: Move this adapter boundary to OpenCV/WebAssembly when the POC graduates from browser-only CV.
  const scaleFromCalibration = frames[0].width > 0 ? 1 : 1;
  const initialRadius = Math.max(3, calibration.ballRadiusPx * scaleFromCalibration);
  const points: TrackPoint[] = [];

  for (let index = 0; index < frames.length; index += 1) {
    const frame = frames[index];
    const correction = options.corrections?.[frame.frameIndex];
    if (correction) {
      points.push({
        frameIndex: frame.frameIndex,
        timestampMs: frame.timestampMs,
        x: correction.x,
        y: correction.y,
        radiusPx: initialRadius,
        confidence: 1,
        detected: true,
        manuallyCorrected: true,
      });
      continue;
    }

    if (index === 0) {
      points.push({
        frameIndex: frame.frameIndex,
        timestampMs: frame.timestampMs,
        x: calibration.originPx.x,
        y: calibration.originPx.y,
        radiusPx: initialRadius,
        confidence: 0.95,
        detected: true,
      });
      continue;
    }

    const detectedHistory = points.filter((point) => point.detected).slice(-3);
    const previous = points[points.length - 1];
    let expectedX = previous.x;
    let expectedY = previous.y;

    if (detectedHistory.length >= 2) {
      const a = detectedHistory[detectedHistory.length - 2];
      const b = detectedHistory[detectedHistory.length - 1];
      expectedX = b.x + (b.x - a.x);
      expectedY = b.y + (b.y - a.y);
    }

    const searchRadius = clamp(initialRadius * (options.aggressiveSearch ? 9 : 6) + index * 1.4, 18, 150);
    const detection = detectBall(frame, {
      expectedX,
      expectedY,
      expectedRadiusPx: previous.radiusPx || initialRadius,
      searchRadiusPx: searchRadius,
      aggressive: options.aggressiveSearch,
    });

    points.push({
      frameIndex: frame.frameIndex,
      timestampMs: frame.timestampMs,
      x: detection.detected ? detection.x : expectedX,
      y: detection.detected ? detection.y : expectedY,
      radiusPx: detection.detected ? detection.radiusPx : previous.radiusPx,
      confidence: detection.confidence,
      detected: detection.detected,
    });
  }

  return points;
}
