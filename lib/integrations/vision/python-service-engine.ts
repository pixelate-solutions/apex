import type { VisionEngine } from "@/lib/integrations/vision/types";

export function createPythonServiceVisionEngine(endpoint = process.env.APEX_PYTHON_VISION_URL): VisionEngine {
  return {
    id: "python-service",
    async analyze() {
      if (!endpoint) throw new Error("APEX_PYTHON_VISION_URL is not configured.");
      throw new Error("Python vision service request serialization is pending benchmark-video contract finalization.");
    },
  };
}
