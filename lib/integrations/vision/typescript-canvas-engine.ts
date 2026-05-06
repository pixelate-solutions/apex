import { trackBall } from "@/lib/vision/ball-tracking";
import type { VisionEngine } from "@/lib/integrations/vision/types";

export const typescriptCanvasVisionEngine: VisionEngine = {
  id: "typescript-canvas",
  async analyze(frames, calibration) {
    return {
      track: trackBall(frames, calibration),
      diagnostics: {
        engine: "typescript-canvas",
        version: "poc-1",
        warnings: ["Heuristic browser CV engine. Upgrade to OpenCV/WASM or Python service for richer tracking."],
      },
    };
  },
};
