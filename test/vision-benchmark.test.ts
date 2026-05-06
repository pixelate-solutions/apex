import { describe, expect, it } from "vitest";
import { typescriptCanvasVisionEngine } from "@/lib/integrations/vision/typescript-canvas-engine";
import { makeSyntheticLaunchFrames } from "@/test/fixtures/synthetic-launch";

describe("benchmark clips", () => {
  it("processes the synthetic 240fps launch benchmark under the POC budget", async () => {
    const { frames, calibration } = makeSyntheticLaunchFrames(30);
    const startedAt = performance.now();
    const result = await typescriptCanvasVisionEngine.analyze(frames, calibration);
    const elapsedMs = performance.now() - startedAt;

    expect(result.track.filter((point) => point.detected).length).toBeGreaterThan(20);
    expect(elapsedMs).toBeLessThan(750);
  });
});
