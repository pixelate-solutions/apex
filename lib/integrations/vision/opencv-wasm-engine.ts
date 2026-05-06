import type { VisionEngine } from "@/lib/integrations/vision/types";

export const opencvWasmVisionEngine: VisionEngine = {
  id: "opencv-wasm",
  async analyze() {
    throw new Error("OpenCV/WASM engine boundary is ready, but the WASM bundle is not installed yet.");
  },
};
