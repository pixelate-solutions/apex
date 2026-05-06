"use client";

import { useEffect, useRef } from "react";
import type { TrackPoint } from "@/lib/types/shot";

type Props = {
  frameDataUrl?: string;
  points?: TrackPoint[];
  selectedFrameIndex?: number;
  metricFrameLimit?: number;
  onCanvasClick?: (x: number, y: number) => void;
};

export function VideoCanvas({ frameDataUrl, points = [], selectedFrameIndex, metricFrameLimit = 8, onCanvasClick }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d");
    if (!context) return;

    const drawOverlay = () => {
      context.clearRect(0, 0, canvas.width, canvas.height);
      if (frameDataUrl) {
        const image = new Image();
        image.onload = () => {
          canvas.width = image.width;
          canvas.height = image.height;
          context.drawImage(image, 0, 0);
          drawPoints(context, points, selectedFrameIndex, metricFrameLimit);
        };
        image.src = frameDataUrl;
      } else {
        canvas.width = 960;
        canvas.height = 540;
        context.fillStyle = "#101513";
        context.fillRect(0, 0, canvas.width, canvas.height);
        drawPoints(context, points, selectedFrameIndex, metricFrameLimit);
      }
    };

    drawOverlay();
  }, [frameDataUrl, metricFrameLimit, points, selectedFrameIndex]);

  function handleClick(event: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !onCanvasClick) return;
    const rect = canvas.getBoundingClientRect();
    onCanvasClick(((event.clientX - rect.left) / rect.width) * canvas.width, ((event.clientY - rect.top) / rect.height) * canvas.height);
  }

  return <canvas ref={canvasRef} onClick={handleClick} className="aspect-video w-full rounded-3xl border bg-black object-contain" />;
}

function drawPoints(
  context: CanvasRenderingContext2D,
  points: TrackPoint[],
  selectedFrameIndex?: number,
  metricFrameLimit = 8,
) {
  if (!points.length) return;
  context.save();
  context.lineWidth = 3;
  context.strokeStyle = "rgba(217,244,118,0.88)";
  context.beginPath();
  points.forEach((point, index) => {
    if (index === 0) context.moveTo(point.x, point.y);
    else context.lineTo(point.x, point.y);
  });
  context.stroke();

  points.forEach((point, index) => {
    const metricPoint = index < metricFrameLimit;
    context.beginPath();
    context.fillStyle = point.manuallyCorrected ? "#60a5fa" : metricPoint ? "#d9f476" : "rgba(255,255,255,0.82)";
    context.strokeStyle = point.detected ? "rgba(16,21,19,0.9)" : "rgba(216,77,63,0.9)";
    context.lineWidth = point.frameIndex === selectedFrameIndex ? 5 : 2;
    context.arc(point.x, point.y, Math.max(4, point.radiusPx), 0, Math.PI * 2);
    context.fill();
    context.stroke();
  });
  context.restore();
}
