import type { Calibration, ConfidenceResult, LaunchMetrics, TrackPoint } from "@/lib/types/shot";
import { clamp } from "@/lib/utils";

export function calculateConfidence(
  track: TrackPoint[],
  calibration: Calibration,
  metrics: LaunchMetrics,
): ConfidenceResult {
  const reliable = track.filter((point) => point.detected && point.confidence >= 0.35);
  const avgDetection = reliable.length
    ? reliable.reduce((sum, point) => sum + point.confidence, 0) / reliable.length
    : 0;
  const manualCount = track.filter((point) => point.manuallyCorrected).length;
  const frameScore = clamp(reliable.length / Math.min(8, Math.max(1, track.length)), 0, 1);
  const fitScore = clamp(metrics.fitR2, 0, 1);
  const calibrationScore = clamp((calibration.ballRadiusPx - 4) / 16, 0.25, 1);
  const viewPenalty = calibration.viewType === "unknown" ? 0.08 : calibration.viewType === "down-the-line" ? 0.05 : 0;
  const warningPenalty = Math.min(0.22, metrics.warnings.length * 0.035);
  const manualAdjustment = manualCount ? clamp(manualCount / Math.max(1, track.length), 0, 0.18) : 0;

  const raw =
    frameScore * 0.28 +
    avgDetection * 0.24 +
    fitScore * 0.24 +
    calibrationScore * 0.14 +
    (1 - manualAdjustment) * 0.1 -
    viewPenalty -
    warningPenalty;

  const score = Math.round(clamp(raw, 0, 1) * 100);
  const reasons: string[] = [];
  reasons.push(`${reliable.length}/${track.length} reliable frame detections`);
  reasons.push(`Average detection confidence ${Math.round(avgDetection * 100)}%`);
  reasons.push(`Trajectory fit R2 ${Math.round(fitScore * 100)}%`);
  if (manualCount) reasons.push(`${manualCount} manually corrected point${manualCount === 1 ? "" : "s"}`);
  if (calibration.viewType === "unknown") reasons.push("Camera view was not confirmed");
  if (calibration.ballRadiusPx < 5) reasons.push("Calibration marker is very small");

  return {
    score,
    level: score >= 75 ? "high" : score >= 50 ? "medium" : "low",
    reasons,
  };
}
