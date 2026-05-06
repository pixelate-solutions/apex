import { describe, expect, it } from "vitest";
import { calculateLaunchMetrics } from "@/lib/physics/launch-metrics";
import { makeSyntheticLaunchFrames } from "@/test/fixtures/synthetic-launch";
import { calculateConfidence } from "@/lib/vision/confidence";
import { trackBall } from "@/lib/vision/ball-tracking";

describe("vision pipeline", () => {
  it("tracks a synthetic bright golf ball across actual pixel data", () => {
    const { frames, calibration } = makeSyntheticLaunchFrames();
    const track = trackBall(frames, calibration);

    expect(track).toHaveLength(frames.length);
    expect(track.filter((point) => point.detected).length).toBeGreaterThanOrEqual(10);
    expect(track[5].x).toBeGreaterThan(track[1].x);
    expect(track[5].y).toBeLessThan(track[1].y);
  });

  it("calculates launch metrics and confidence from the tracked path", () => {
    const { frames, calibration } = makeSyntheticLaunchFrames();
    const track = trackBall(frames, calibration);
    const metrics = calculateLaunchMetrics(track, calibration);
    const confidence = calculateConfidence(track, calibration, metrics);

    expect(metrics.speedMph).toBeGreaterThan(30);
    expect(metrics.launchAngleDeg).toBeGreaterThan(5);
    expect(metrics.estimatedCarryYards).toBeGreaterThan(5);
    expect(confidence.score).toBeGreaterThan(50);
  });
});
