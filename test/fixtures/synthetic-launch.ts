import type { Calibration, VisionFrame } from "@/lib/types/shot";

export function makeSyntheticLaunchFrames(frameCount = 12) {
  const width = 640;
  const height = 180;
  const radius = 6;
  const start = { x: 42, y: 132 };
  const frames: VisionFrame[] = [];

  for (let frame = 0; frame < frameCount; frame += 1) {
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 52;
      data[i + 1] = 72;
      data[i + 2] = 55;
      data[i + 3] = 255;
    }

    const cx = start.x + frame * 18;
    const cy = start.y - frame * 5;
    drawBall(data, width, height, cx, cy, radius);

    frames.push({
      frameIndex: frame,
      timestampMs: (frame / 240) * 1000,
      width,
      height,
      imageData: { data, width, height, colorSpace: "srgb" } as ImageData,
    });
  }

  const calibration: Calibration = {
    fps: 240,
    ballDiameterMm: 42.67,
    pixelsPerMeter: (radius * 2) / 0.04267,
    startFrameIndex: 0,
    originPx: start,
    ballRadiusPx: radius,
    viewType: "side",
  };

  return { frames, calibration };
}

function drawBall(data: Uint8ClampedArray, width: number, height: number, cx: number, cy: number, radius: number) {
  for (let y = Math.max(0, cy - radius - 1); y <= Math.min(height - 1, cy + radius + 1); y += 1) {
    for (let x = Math.max(0, cx - radius - 1); x <= Math.min(width - 1, cx + radius + 1); x += 1) {
      const distance = Math.sqrt((x - cx) ** 2 + (y - cy) ** 2);
      if (distance > radius) continue;
      const idx = (y * width + x) * 4;
      const shade = distance < radius * 0.45 ? 252 : 228;
      data[idx] = shade;
      data[idx + 1] = shade;
      data[idx + 2] = shade - 6;
      data[idx + 3] = 255;
    }
  }
}
