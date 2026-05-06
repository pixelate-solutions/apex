"use client";

import type { TrackPoint } from "@/lib/types/shot";

export function TrajectoryOverlay({ points }: { points: TrackPoint[] }) {
  if (!points.length) return null;
  const width = 360;
  const height = 120;
  const minX = Math.min(...points.map((p) => p.x));
  const maxX = Math.max(...points.map((p) => p.x));
  const minY = Math.min(...points.map((p) => p.y));
  const maxY = Math.max(...points.map((p) => p.y));
  const toX = (x: number) => ((x - minX) / Math.max(1, maxX - minX)) * (width - 32) + 16;
  const toY = (y: number) => ((y - minY) / Math.max(1, maxY - minY)) * (height - 32) + 16;
  const d = points.map((point, index) => `${index === 0 ? "M" : "L"} ${toX(point.x).toFixed(1)} ${toY(point.y).toFixed(1)}`).join(" ");

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="h-28 w-full rounded-3xl border bg-background">
      <path d={d} fill="none" stroke="currentColor" strokeWidth="3" className="text-primary" />
      {points.map((point) => (
        <circle key={point.frameIndex} cx={toX(point.x)} cy={toY(point.y)} r="4" className={point.detected ? "fill-accent" : "fill-destructive"} />
      ))}
    </svg>
  );
}
