import type { Calibration, LaunchMetrics, TrackPoint } from "@/lib/types/shot";
import { estimateCarryDistance } from "@/lib/physics/carry-estimate";
import { clamp } from "@/lib/utils";

type Regression = {
  slope: number;
  intercept: number;
  r2: number;
};

function linearRegression(points: Array<{ t: number; v: number }>): Regression {
  const n = points.length;
  const meanT = points.reduce((sum, p) => sum + p.t, 0) / n;
  const meanV = points.reduce((sum, p) => sum + p.v, 0) / n;
  let numerator = 0;
  let denominator = 0;
  let total = 0;
  let residual = 0;

  for (const point of points) {
    numerator += (point.t - meanT) * (point.v - meanV);
    denominator += (point.t - meanT) ** 2;
  }

  const slope = denominator > 0 ? numerator / denominator : 0;
  const intercept = meanV - slope * meanT;

  for (const point of points) {
    const predicted = slope * point.t + intercept;
    total += (point.v - meanV) ** 2;
    residual += (point.v - predicted) ** 2;
  }

  return {
    slope,
    intercept,
    r2: total > 0 ? clamp(1 - residual / total, 0, 1) : 1,
  };
}

export function calculateLaunchMetrics(track: TrackPoint[], calibration: Calibration): LaunchMetrics {
  const warnings: string[] = [];
  // TODO: Integrate radar velocity and spin inputs when hardware adapters are available.
  // TODO: Add high-speed camera synchronization and stereo calibration for real 3D launch vectors.
  const reliable = track
    .filter((point) => point.detected && point.confidence >= 0.35)
    .sort((a, b) => a.timestampMs - b.timestampMs)
    .slice(0, 8);

  if (calibration.fps < 120) warnings.push("Low FPS reduces speed accuracy for fast ball launches.");
  if (calibration.viewType === "unknown") warnings.push("Camera angle unknown; launch angle is a POC estimate.");
  if (calibration.viewType === "down-the-line") warnings.push("Down-the-line view can understate true horizontal velocity.");
  if (calibration.pixelsPerMeter < 500) warnings.push("Pixel scale is low; move the camera closer or increase resolution.");
  if (reliable.length < 3) warnings.push("Too few reliable detections for stable launch metrics.");

  if (reliable.length < 2) {
    return {
      speedMps: 0,
      speedMph: 0,
      speedKmh: 0,
      launchAngleDeg: 0,
      estimatedCarryYards: 0,
      estimatedCarryMeters: 0,
      fitR2: 0,
      framesUsed: reliable.length,
      warnings,
    };
  }

  const t0 = reliable[0].timestampMs / 1000;
  const xPoints = reliable.map((point) => ({ t: point.timestampMs / 1000 - t0, v: point.x }));
  const yPoints = reliable.map((point) => ({ t: point.timestampMs / 1000 - t0, v: point.y }));
  const xFit = linearRegression(xPoints);
  const yFit = linearRegression(yPoints);

  const velocityXPx = xFit.slope;
  const velocityYPx = yFit.slope;
  const speedPxPerSec = Math.sqrt(velocityXPx ** 2 + velocityYPx ** 2);
  const speedMps = speedPxPerSec / calibration.pixelsPerMeter;
  const horizontal = Math.max(Math.abs(velocityXPx), 0.0001);
  const launchAngleDeg = clamp((Math.atan2(-velocityYPx, horizontal) * 180) / Math.PI, -15, 75);
  const carry = estimateCarryDistance(speedMps, Math.max(0, launchAngleDeg));
  const fitR2 = (xFit.r2 + yFit.r2) / 2;

  if (launchAngleDeg <= 0) warnings.push("Initial trajectory is flat or descending in the selected view.");
  warnings.push("Carry is very rough without spin, aerodynamic drag model, wind, and radar validation.");

  return {
    speedMps,
    speedMph: speedMps * 2.23694,
    speedKmh: speedMps * 3.6,
    launchAngleDeg,
    estimatedCarryYards: carry.estimatedCarryYards,
    estimatedCarryMeters: carry.estimatedCarryMeters,
    fitR2,
    framesUsed: reliable.length,
    warnings,
  };
}
