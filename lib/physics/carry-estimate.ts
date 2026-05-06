import { clamp } from "@/lib/utils";

const G = 9.80665;

export function estimateCarryDistance(speedMps: number, launchAngleDeg: number, dragFactor?: number) {
  const theta = (launchAngleDeg * Math.PI) / 180;
  const vacuumRange = Math.max(0, (speedMps * speedMps * Math.sin(2 * theta)) / G);
  const factor = dragFactor ?? clamp(0.55 + speedMps / 180, 0.55, 0.75);
  const estimatedCarryMeters = vacuumRange * factor;

  return {
    estimatedCarryMeters,
    estimatedCarryYards: estimatedCarryMeters * 1.09361,
    dragFactor: factor,
  };
}
