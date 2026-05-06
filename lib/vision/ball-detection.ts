import type { VisionFrame } from "@/lib/types/shot";
import { clamp } from "@/lib/utils";

export type BallDetectionOptions = {
  expectedX: number;
  expectedY: number;
  expectedRadiusPx: number;
  searchRadiusPx: number;
  aggressive?: boolean;
};

export type BallDetection = {
  x: number;
  y: number;
  radiusPx: number;
  confidence: number;
  detected: boolean;
  diagnostics: {
    candidateCount: number;
    bestScore: number;
    roi: { x: number; y: number; width: number; height: number };
  };
};

type Component = {
  area: number;
  sumX: number;
  sumY: number;
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  perimeter: number;
  brightnessSum: number;
  ringSum: number;
  ringCount: number;
};

function luminance(data: Uint8ClampedArray, index: number) {
  return 0.2126 * data[index] + 0.7152 * data[index + 1] + 0.0722 * data[index + 2];
}

function pixelIndex(x: number, y: number, width: number) {
  return (y * width + x) * 4;
}

export function detectBall(frame: VisionFrame, options: BallDetectionOptions): BallDetection {
  const { width, height, imageData } = frame;
  const data = imageData.data;
  const roiX = Math.max(0, Math.floor(options.expectedX - options.searchRadiusPx));
  const roiY = Math.max(0, Math.floor(options.expectedY - options.searchRadiusPx));
  const roiMaxX = Math.min(width - 1, Math.ceil(options.expectedX + options.searchRadiusPx));
  const roiMaxY = Math.min(height - 1, Math.ceil(options.expectedY + options.searchRadiusPx));
  const roiWidth = roiMaxX - roiX + 1;
  const roiHeight = roiMaxY - roiY + 1;
  const total = roiWidth * roiHeight;
  const mask = new Uint8Array(total);
  const visited = new Uint8Array(total);

  let mean = 0;
  let variance = 0;
  for (let y = roiY; y <= roiMaxY; y += 1) {
    for (let x = roiX; x <= roiMaxX; x += 1) {
      mean += luminance(data, pixelIndex(x, y, width));
    }
  }
  mean /= total;
  for (let y = roiY; y <= roiMaxY; y += 1) {
    for (let x = roiX; x <= roiMaxX; x += 1) {
      const delta = luminance(data, pixelIndex(x, y, width)) - mean;
      variance += delta * delta;
    }
  }
  const std = Math.sqrt(variance / total);
  const threshold = Math.max(options.aggressive ? 128 : 145, mean + std * (options.aggressive ? 0.45 : 0.7));

  for (let y = roiY; y <= roiMaxY; y += 1) {
    for (let x = roiX; x <= roiMaxX; x += 1) {
      const idx = pixelIndex(x, y, width);
      const lum = luminance(data, idx);
      const saturation = Math.max(data[idx], data[idx + 1], data[idx + 2]) - Math.min(data[idx], data[idx + 1], data[idx + 2]);
      const local = (y - roiY) * roiWidth + (x - roiX);
      if (lum >= threshold && saturation < 95) mask[local] = 1;
    }
  }

  const components: Component[] = [];
  const queue: Array<[number, number]> = [];
  const minArea = Math.max(5, Math.floor(Math.PI * (options.expectedRadiusPx * 0.35) ** 2));
  const maxArea = Math.max(minArea + 1, Math.ceil(Math.PI * (options.expectedRadiusPx * 2.6) ** 2));

  for (let ry = 0; ry < roiHeight; ry += 1) {
    for (let rx = 0; rx < roiWidth; rx += 1) {
      const start = ry * roiWidth + rx;
      if (!mask[start] || visited[start]) continue;
      const component: Component = {
        area: 0,
        sumX: 0,
        sumY: 0,
        minX: Number.POSITIVE_INFINITY,
        minY: Number.POSITIVE_INFINITY,
        maxX: 0,
        maxY: 0,
        perimeter: 0,
        brightnessSum: 0,
        ringSum: 0,
        ringCount: 0,
      };

      visited[start] = 1;
      queue.push([rx, ry]);
      while (queue.length) {
        const [cx, cy] = queue.pop()!;
        const x = roiX + cx;
        const y = roiY + cy;
        const globalIdx = pixelIndex(x, y, width);
        component.area += 1;
        component.sumX += x;
        component.sumY += y;
        component.minX = Math.min(component.minX, x);
        component.minY = Math.min(component.minY, y);
        component.maxX = Math.max(component.maxX, x);
        component.maxY = Math.max(component.maxY, y);
        component.brightnessSum += luminance(data, globalIdx);

        for (const [dx, dy] of [
          [1, 0],
          [-1, 0],
          [0, 1],
          [0, -1],
        ] as const) {
          const nx = cx + dx;
          const ny = cy + dy;
          if (nx < 0 || ny < 0 || nx >= roiWidth || ny >= roiHeight) {
            component.perimeter += 1;
            continue;
          }
          const next = ny * roiWidth + nx;
          if (!mask[next]) {
            component.perimeter += 1;
            const gx = roiX + nx;
            const gy = roiY + ny;
            component.ringSum += luminance(data, pixelIndex(gx, gy, width));
            component.ringCount += 1;
          } else if (!visited[next]) {
            visited[next] = 1;
            queue.push([nx, ny]);
          }
        }
      }

      if (component.area >= minArea && component.area <= maxArea) components.push(component);
    }
  }

  let best: { component: Component; score: number; x: number; y: number; radius: number } | null = null;
  for (const component of components) {
    const cx = component.sumX / component.area;
    const cy = component.sumY / component.area;
    const radius = Math.sqrt(component.area / Math.PI);
    const distance = Math.sqrt((cx - options.expectedX) ** 2 + (cy - options.expectedY) ** 2);
    const distanceScore = clamp(1 - distance / Math.max(1, options.searchRadiusPx), 0, 1);
    const sizeScore = clamp(1 - Math.abs(radius - options.expectedRadiusPx) / Math.max(1, options.expectedRadiusPx * 1.3), 0, 1);
    const circularity = clamp((4 * Math.PI * component.area) / Math.max(1, component.perimeter * component.perimeter), 0, 1);
    const boxRatio =
      Math.min(component.maxX - component.minX + 1, component.maxY - component.minY + 1) /
      Math.max(component.maxX - component.minX + 1, component.maxY - component.minY + 1);
    const inside = component.brightnessSum / component.area;
    const ring = component.ringCount ? component.ringSum / component.ringCount : mean;
    const contrastScore = clamp((inside - ring) / 80, 0, 1);
    const score = distanceScore * 0.26 + sizeScore * 0.24 + circularity * 0.2 + boxRatio * 0.12 + contrastScore * 0.18;
    if (!best || score > best.score) best = { component, score, x: cx, y: cy, radius };
  }

  if (!best || best.score < (options.aggressive ? 0.27 : 0.33)) {
    return {
      x: options.expectedX,
      y: options.expectedY,
      radiusPx: options.expectedRadiusPx,
      confidence: 0,
      detected: false,
      diagnostics: {
        candidateCount: components.length,
        bestScore: best?.score ?? 0,
        roi: { x: roiX, y: roiY, width: roiWidth, height: roiHeight },
      },
    };
  }

  return {
    x: best.x,
    y: best.y,
    radiusPx: best.radius,
    confidence: clamp(best.score, 0, 1),
    detected: true,
    diagnostics: {
      candidateCount: components.length,
      bestScore: best.score,
      roi: { x: roiX, y: roiY, width: roiWidth, height: roiHeight },
    },
  };
}
