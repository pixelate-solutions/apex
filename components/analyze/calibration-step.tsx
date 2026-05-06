"use client";

import { Crosshair, MoveHorizontal } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import type { Calibration, VideoFileState, ViewType } from "@/lib/types/shot";
import { formatNumber } from "@/lib/utils";

type Props = {
  video: VideoFileState | null;
  fps: number;
  ballDiameterMm: number;
  calibration: Calibration | null;
  onCalibrationChange: (calibration: Calibration) => void;
};

export function CalibrationStep({ video, fps, ballDiameterMm, calibration, onCalibrationChange }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [duration, setDuration] = useState(video?.durationSec ?? 0);
  const [time, setTime] = useState(0);
  const [center, setCenter] = useState(calibration?.originPx ?? { x: 160, y: 120 });
  const [radius, setRadius] = useState(calibration?.ballRadiusPx ?? 12);
  const [diameterMm, setDiameterMm] = useState(calibration?.ballDiameterMm ?? ballDiameterMm);
  const [viewType, setViewType] = useState<ViewType>(calibration?.viewType ?? "side");
  const [dragging, setDragging] = useState<"center" | "radius" | null>(null);

  const startFrameIndex = useMemo(() => Math.max(0, Math.round(time * fps)), [fps, time]);
  const pixelsPerMeter = useMemo(() => (radius * 2) / (diameterMm / 1000), [diameterMm, radius]);

  const drawFrame = useCallback(() => {
    const videoEl = videoRef.current;
    const canvas = canvasRef.current;
    if (!videoEl || !canvas || !videoEl.videoWidth || !videoEl.videoHeight) return;
    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;
    const context = canvas.getContext("2d");
    if (!context) return;
    context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    context.save();
    context.strokeStyle = "#d9f476";
    context.fillStyle = "rgba(217,244,118,0.12)";
    context.lineWidth = Math.max(2, canvas.width / 480);
    context.beginPath();
    context.arc(center.x, center.y, radius, 0, Math.PI * 2);
    context.fill();
    context.stroke();
    context.strokeStyle = "rgba(255,255,255,0.9)";
    context.beginPath();
    context.moveTo(center.x - radius * 1.5, center.y);
    context.lineTo(center.x + radius * 1.5, center.y);
    context.moveTo(center.x, center.y - radius * 1.5);
    context.lineTo(center.x, center.y + radius * 1.5);
    context.stroke();
    context.restore();
  }, [center, radius]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !video) return;
    const onLoaded = () => {
      setDuration(videoEl.duration || video.durationSec || 0);
      drawFrame();
    };
    videoEl.addEventListener("loadedmetadata", onLoaded);
    videoEl.addEventListener("seeked", drawFrame);
    return () => {
      videoEl.removeEventListener("loadedmetadata", onLoaded);
      videoEl.removeEventListener("seeked", drawFrame);
    };
  }, [drawFrame, video]);

  useEffect(() => {
    drawFrame();
  }, [drawFrame]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl || !Number.isFinite(time)) return;
    videoEl.currentTime = Math.min(time, Math.max(0, videoEl.duration || time));
  }, [time]);

  function canvasPoint(event: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * canvas.width,
      y: ((event.clientY - rect.top) / rect.height) * canvas.height,
    };
  }

  function commitCalibration() {
    onCalibrationChange({
      fps,
      ballDiameterMm: diameterMm,
      pixelsPerMeter,
      startFrameIndex,
      originPx: center,
      ballRadiusPx: radius,
      viewType,
    });
  }

  if (!video) {
    return (
      <Alert>
        <AlertTitle>Upload required</AlertTitle>
        <AlertDescription>Choose a launch video before calibration.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Calibrate ball scale</CardTitle>
          <CardDescription>Scrub to the first clear post-impact frame, then place the marker over the ball diameter.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <video ref={videoRef} src={video.url} muted playsInline preload="metadata" className="hidden" />
          <canvas
            ref={canvasRef}
            className="aspect-video w-full cursor-crosshair rounded-3xl border bg-black object-contain"
            onPointerDown={(event) => {
              const point = canvasPoint(event);
              const distance = Math.sqrt((point.x - center.x) ** 2 + (point.y - center.y) ** 2);
              setDragging(Math.abs(distance - radius) < radius * 0.5 ? "radius" : "center");
              if (distance >= radius * 1.5) setCenter(point);
            }}
            onPointerMove={(event) => {
              if (!dragging) return;
              const point = canvasPoint(event);
              if (dragging === "center") setCenter(point);
              else setRadius(Math.max(3, Math.sqrt((point.x - center.x) ** 2 + (point.y - center.y) ** 2)));
            }}
            onPointerUp={() => setDragging(null)}
            onPointerLeave={() => setDragging(null)}
          />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Frame {startFrameIndex}</span>
              <span className="text-muted-foreground">{formatNumber(time, 3)}s</span>
            </div>
            <Slider value={[time]} min={0} max={Math.max(0.001, duration)} step={1 / fps} onValueChange={([value]) => setTime(value)} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Calibration inputs</CardTitle>
          <CardDescription>These values control conversion from pixels to launch metrics.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="cal-fps">FPS</Label>
              <Input id="cal-fps" value={fps} readOnly />
            </div>
            <div className="space-y-2">
              <Label htmlFor="diameter">Ball diameter (mm)</Label>
              <Input
                id="diameter"
                type="number"
                min={20}
                step={0.01}
                value={diameterMm}
                onChange={(event) => setDiameterMm(Number(event.target.value))}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Camera view</Label>
            <Select value={viewType} onValueChange={(value) => setViewType(value as ViewType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="side">Side view</SelectItem>
                <SelectItem value="down-the-line">Down-the-line</SelectItem>
                <SelectItem value="unknown">Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 rounded-3xl border bg-background p-4 text-sm">
            <div>
              <p className="text-muted-foreground">Marker radius</p>
              <p className="font-semibold">{formatNumber(radius, 1)} px</p>
            </div>
            <div>
              <p className="text-muted-foreground">Pixels / meter</p>
              <p className="font-semibold">{formatNumber(pixelsPerMeter, 0)}</p>
            </div>
          </div>
          <Alert>
            <Crosshair className="h-4 w-4" />
            <AlertTitle>Canvas controls</AlertTitle>
            <AlertDescription>
              Click the ball center, then drag near the circle edge to match the ball diameter.
            </AlertDescription>
          </Alert>
          <Button onClick={commitCalibration} className="w-full" variant="accent">
            <MoveHorizontal className="h-4 w-4" />
            Use this calibration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
