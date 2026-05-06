import type { HardwareFusionInput, RadarSample } from "@/lib/integrations/hardware/types";
import type { LaunchMetrics } from "@/lib/types/shot";

export function fuseRadarWithVideo(metrics: LaunchMetrics, input: HardwareFusionInput): LaunchMetrics {
  const reliableRadar = input.radarSamples.filter((sample): sample is RadarSample & { speedMps: number } => {
    return typeof sample.speedMps === "number" && sample.confidence >= 0.6;
  });

  if (!reliableRadar.length) return metrics;

  const radarSpeedMps = reliableRadar.reduce((sum, sample) => sum + sample.speedMps, 0) / reliableRadar.length;
  const blendedSpeedMps = metrics.speedMps * 0.35 + radarSpeedMps * 0.65;

  return {
    ...metrics,
    speedMps: blendedSpeedMps,
    speedMph: blendedSpeedMps * 2.23694,
    speedKmh: blendedSpeedMps * 3.6,
    warnings: metrics.warnings.filter((warning) => !warning.toLowerCase().includes("radar")),
  };
}
