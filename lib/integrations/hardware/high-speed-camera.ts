import type { HighSpeedCameraAdapter, HighSpeedCameraFrame, HardwareHealth } from "@/lib/integrations/hardware/types";
import type { Calibration } from "@/lib/types/shot";

export class BrowserVideoCameraAdapter implements HighSpeedCameraAdapter {
  id = "browser-video-camera";

  async getHealth(): Promise<HardwareHealth> {
    return {
      connected: true,
      label: "Browser video adapter",
      detail: "Uses uploaded video frames until a physical high-speed camera SDK is connected.",
    };
  }

  async captureFrames(): Promise<HighSpeedCameraFrame[]> {
    throw new Error("Browser uploads are handled by lib/vision/frame-extraction. Hardware capture is not active in this adapter.");
  }

  async calibrate(_calibration: Calibration) {
    // TODO: Send calibration to high-speed camera SDK when hardware integration is added.
  }
}

export class UsbHighSpeedCameraAdapter implements HighSpeedCameraAdapter {
  id = "usb-high-speed-camera";

  async getHealth(): Promise<HardwareHealth> {
    return {
      connected: false,
      label: "USB high-speed camera",
      detail: "Adapter boundary is ready; vendor SDK/WebUSB implementation is pending.",
    };
  }

  async captureFrames(): Promise<HighSpeedCameraFrame[]> {
    throw new Error("USB high-speed camera capture is not implemented yet.");
  }
}
