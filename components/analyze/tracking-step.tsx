"use client";

import { MousePointer2, RotateCcw, ScanSearch } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { VideoCanvas } from "@/components/analyze/video-canvas";
import { calculateLaunchMetrics } from "@/lib/physics/launch-metrics";
import { typescriptCanvasVisionEngine } from "@/lib/integrations/vision/typescript-canvas-engine";
import { calculateConfidence } from "@/lib/vision/confidence";
import { extractFrames } from "@/lib/vision/frame-extraction";
import { trackBall } from "@/lib/vision/ball-tracking";
import type { Calibration, ConfidenceResult, LaunchMetrics, TrackPoint, VideoFileState, VisionFrame } from "@/lib/types/shot";
import { formatNumber } from "@/lib/utils";

type Props = {
  video: VideoFileState | null;
  calibration: Calibration | null;
  frameCount: 10 | 20 | 30 | 60;
  aggressiveSearch: boolean;
  frames: VisionFrame[];
  track: TrackPoint[];
  metrics: LaunchMetrics | null;
  confidence: ConfidenceResult | null;
  onFrameCountChange: (count: 10 | 20 | 30 | 60) => void;
  onAnalysisReady: (frames: VisionFrame[], track: TrackPoint[], metrics: LaunchMetrics, confidence: ConfidenceResult) => void;
};

export function TrackingStep({
  video,
  calibration,
  frameCount,
  aggressiveSearch,
  frames,
  track,
  metrics,
  confidence,
  onFrameCountChange,
  onAnalysisReady,
}: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState(0);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedOffset, setSelectedOffset] = useState(0);

  const selectedPoint = track[selectedOffset];
  const thumbnail = frames[0]?.dataUrl;
  const reliableCount = useMemo(() => track.filter((point) => point.detected && point.confidence >= 0.35).length, [track]);

  async function runAnalysis() {
    if (!video || !calibration || !videoRef.current) return;
    setError(null);
    setRunning(true);
    setProgress(4);
    try {
      const extracted = await extractFrames(videoRef.current, {
        fps: calibration.fps,
        startFrameIndex: calibration.startFrameIndex,
        frameCount,
        onProgress: (nextProgress) => setProgress(Math.max(4, Math.round(nextProgress * 0.7))),
      });
      const engineResult = aggressiveSearch
        ? { track: trackBall(extracted, calibration, { aggressiveSearch }) }
        : await typescriptCanvasVisionEngine.analyze(extracted, calibration);
      const nextTrack = engineResult.track;
      setProgress(86);
      const nextMetrics = calculateLaunchMetrics(nextTrack, calibration);
      const nextConfidence = calculateConfidence(nextTrack, calibration, nextMetrics);
      onAnalysisReady(extracted, nextTrack, nextMetrics, nextConfidence);
      setProgress(100);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to analyze this video.");
    } finally {
      setRunning(false);
    }
  }

  function correctSelectedPoint(x: number, y: number) {
    if (!calibration || !metrics || !track.length) return;
    const next = track.map((point, index) =>
      index === selectedOffset ? { ...point, x, y, detected: true, confidence: 1, manuallyCorrected: true } : point,
    );
    const nextMetrics = calculateLaunchMetrics(next, calibration);
    const nextConfidence = calculateConfidence(next, calibration, nextMetrics);
    onAnalysisReady(frames, next, nextMetrics, nextConfidence);
  }

  if (!video || !calibration) {
    return (
      <Alert>
        <AlertTitle>Calibration required</AlertTitle>
        <AlertDescription>Upload and calibrate the shot before running tracking.</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
      <Card>
        <CardHeader>
          <CardTitle>Ball tracking</CardTitle>
          <CardDescription>Extract frames, detect the ball from image pixels, then inspect and correct the path.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <video ref={videoRef} src={video.url} muted playsInline preload="auto" className="hidden" />
          <VideoCanvas
            frameDataUrl={thumbnail}
            points={track}
            selectedFrameIndex={selectedPoint?.frameIndex}
            onCanvasClick={correctSelectedPoint}
          />
          {track.length ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Correction frame</span>
                <span className="text-muted-foreground">
                  {selectedPoint ? `Frame ${selectedPoint.frameIndex} (${Math.round(selectedPoint.confidence * 100)}%)` : "None"}
                </span>
              </div>
              <Slider
                value={[selectedOffset]}
                min={0}
                max={Math.max(0, track.length - 1)}
                step={1}
                onValueChange={([value]) => setSelectedOffset(value)}
              />
              <p className="text-xs text-muted-foreground">
                Click the preview to manually correct the selected frame. Metrics update immediately.
              </p>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Analysis controls</CardTitle>
          <CardDescription>Use a short early-flight window for the cleanest launch estimate.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Frames to analyze</Label>
            <Select value={String(frameCount)} onValueChange={(value) => onFrameCountChange(Number(value) as 10 | 20 | 30 | 60)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 frames</SelectItem>
                <SelectItem value="20">20 frames</SelectItem>
                <SelectItem value="30">30 frames</SelectItem>
                <SelectItem value="60">60 frames</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="rounded-3xl border bg-background p-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-muted-foreground">Start frame</p>
                <p className="font-semibold">{calibration.startFrameIndex}</p>
              </div>
              <div>
                <p className="text-muted-foreground">FPS</p>
                <p className="font-semibold">{calibration.fps}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Scale</p>
                <p className="font-semibold">{formatNumber(calibration.pixelsPerMeter, 0)} px/m</p>
              </div>
              <div>
                <p className="text-muted-foreground">Reliable</p>
                <p className="font-semibold">{reliableCount || "N/A"}</p>
              </div>
            </div>
          </div>
          {running ? (
            <div className="space-y-2">
              <Progress value={progress} />
              <p className="text-sm text-muted-foreground">Extracting frames and scoring ball candidates...</p>
            </div>
          ) : null}
          {error ? (
            <Alert className="border-destructive/40">
              <AlertTitle>Tracking failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          ) : null}
          <Button onClick={runAnalysis} disabled={running} className="w-full" variant="accent">
            {track.length ? <RotateCcw className="h-4 w-4" /> : <ScanSearch className="h-4 w-4" />}
            {track.length ? "Run tracking again" : "Track the ball"}
          </Button>
          {confidence ? (
            <Alert>
              <MousePointer2 className="h-4 w-4" />
              <AlertTitle>Manual correction available</AlertTitle>
              <AlertDescription>
                Current confidence is {confidence.score}/100. Correct outlier points in the preview if needed.
              </AlertDescription>
            </Alert>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
