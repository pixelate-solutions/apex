import type { HardwareHealth, RadarAdapter, RadarSample } from "@/lib/integrations/hardware/types";

export class NoopRadarAdapter implements RadarAdapter {
  id = "noop-radar";

  async getHealth(): Promise<HardwareHealth> {
    return {
      connected: false,
      label: "Radar adapter",
      detail: "No radar device is connected. Video-only POC metrics are active.",
    };
  }

  async readLaunchWindow(): Promise<RadarSample[]> {
    return [];
  }
}

export class SerialRadarAdapter implements RadarAdapter {
  id = "serial-radar";

  async getHealth(): Promise<HardwareHealth> {
    return {
      connected: false,
      label: "Serial radar",
      detail: "Adapter boundary is ready; Web Serial or native bridge implementation is pending.",
    };
  }

  async readLaunchWindow(): Promise<RadarSample[]> {
    throw new Error("Serial radar reads are not implemented yet.");
  }
}
