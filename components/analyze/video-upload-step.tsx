"use client";

import { CheckCircle2, CircleAlert, Upload, Video } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatBytes, formatNumber } from "@/lib/utils";
import type { VideoFileState } from "@/lib/types/shot";

type Props = {
  video: VideoFileState | null;
  fps: number;
  onFpsChange: (fps: number) => void;
  onVideoChange: (video: VideoFileState | null) => void;
};

export function VideoUploadStep({ video, fps, onFpsChange, onVideoChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [duration, setDuration] = useState<number | undefined>(video?.durationSec);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    setDuration(video?.durationSec);
  }, [video]);

  function handleFile(file: File | undefined) {
    if (!file) return;
    if (!["video/mp4", "video/quicktime", "video/webm"].includes(file.type) && !/\.(mp4|mov|webm)$/i.test(file.name)) {
      alert("Use an MP4, MOV, or WebM video.");
      return;
    }
    if (video?.url) URL.revokeObjectURL(video.url);
    onVideoChange({ file, url: URL.createObjectURL(file) });
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>Upload launch video</CardTitle>
          <CardDescription>Use a slow-motion clip with the ball visible for the first few frames after impact.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            onDragEnter={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(event) => {
              event.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setIsDragging(false);
              handleFile(event.dataTransfer.files[0]);
            }}
            className={`flex min-h-56 w-full flex-col items-center justify-center rounded-3xl border border-dashed p-8 text-center transition-colors ${
              isDragging ? "border-primary bg-accent/35" : "bg-muted/50 hover:bg-muted"
            }`}
          >
            <Upload className="h-10 w-10" />
            <span className="mt-4 text-lg font-bold">Drop in a shot video</span>
            <span className="mt-1 text-sm text-muted-foreground">MP4, MOV, or WebM. Processing stays local.</span>
          </button>
          <Input
            ref={inputRef}
            type="file"
            accept=".mp4,.mov,.webm,video/mp4,video/quicktime,video/webm"
            className="hidden"
            onChange={(event) => handleFile(event.target.files?.[0])}
          />
          {video ? (
            <video
              ref={videoRef}
              src={video.url}
              controls
              playsInline
              className="aspect-video w-full rounded-3xl border bg-black object-contain"
              onLoadedMetadata={(event) => {
                const nextDuration = event.currentTarget.duration;
                setDuration(nextDuration);
                onVideoChange({ ...video, durationSec: nextDuration });
              }}
            />
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Video metadata</CardTitle>
          <CardDescription>FPS is often missing from browser metadata, so confirm it before calibration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-3xl border bg-background p-4">
            {video ? (
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-secondary">
                    <Video className="h-4 w-4" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{video.file.name}</p>
                    <p className="text-muted-foreground">{formatBytes(video.file.size)}</p>
                  </div>
                </div>
                <dl className="grid grid-cols-2 gap-3">
                  <div>
                    <dt className="text-muted-foreground">Duration</dt>
                    <dd className="font-semibold">{duration ? `${formatNumber(duration, 2)}s` : "Reading..."}</dd>
                  </div>
                  <div>
                    <dt className="text-muted-foreground">Source</dt>
                    <dd className="font-semibold">Local browser</dd>
                  </div>
                </dl>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No video selected yet.</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="fps">Estimated video FPS</Label>
            <Input
              id="fps"
              type="number"
              min={24}
              max={1000}
              value={fps}
              onChange={(event) => onFpsChange(Number(event.target.value))}
            />
            <p className="text-xs text-muted-foreground">Common slow-motion values are 120, 240, and 480 FPS.</p>
          </div>

          <div
            className={`rounded-3xl border p-4 ${
              video ? "border-emerald-300 bg-emerald-50 text-emerald-950" : "border-red-200 bg-red-50 text-red-950"
            }`}
          >
            <div className="flex items-center gap-3">
              {video ? <CheckCircle2 className="h-5 w-5" /> : <CircleAlert className="h-5 w-5" />}
              <div>
                <p className="font-semibold">{video ? "Ready for calibration" : "Waiting for video"}</p>
                <p className="text-sm opacity-75">
                  {video ? "Video metadata is available. Continue to the calibration step." : "Upload or drop a video to unlock calibration."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
