"use client";

import { ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { CalibrationStep } from "@/components/analyze/calibration-step";
import { ResultsStep } from "@/components/analyze/results-step";
import { TrackingStep } from "@/components/analyze/tracking-step";
import { VideoUploadStep } from "@/components/analyze/video-upload-step";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { loadSettings } from "@/lib/settings";
import type { AppSettings, Calibration, ConfidenceResult, LaunchMetrics, TrackPoint, VideoFileState, VisionFrame } from "@/lib/types/shot";
import { cn } from "@/lib/utils";

const steps = ["Upload video", "Calibration", "Ball tracking", "Results"] as const;

export function AnalyzeWorkflow() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [step, setStep] = useState(0);
  const [video, setVideo] = useState<VideoFileState | null>(null);
  const [fps, setFps] = useState(240);
  const [calibration, setCalibration] = useState<Calibration | null>(null);
  const [frames, setFrames] = useState<VisionFrame[]>([]);
  const [track, setTrack] = useState<TrackPoint[]>([]);
  const [metrics, setMetrics] = useState<LaunchMetrics | null>(null);
  const [confidence, setConfidence] = useState<ConfidenceResult | null>(null);
  const [frameCount, setFrameCount] = useState<10 | 20 | 30 | 60>(30);

  useEffect(() => {
    const loaded = loadSettings();
    setSettings(loaded);
    setFps(loaded.fps);
    setFrameCount(loaded.analysisFrameCount);
  }, []);

  useEffect(() => {
    return () => {
      if (video?.url) URL.revokeObjectURL(video.url);
    };
  }, [video?.url]);

  const canAdvance = useMemo(() => {
    if (step === 0) return Boolean(video);
    if (step === 1) return Boolean(calibration);
    if (step === 2) return Boolean(metrics && confidence);
    return true;
  }, [calibration, confidence, metrics, step, video]);

  function resetAnalysisAfterCalibration(nextCalibration: Calibration) {
    setCalibration(nextCalibration);
    setFrames([]);
    setTrack([]);
    setMetrics(null);
    setConfidence(null);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-bold uppercase text-muted-foreground">Analyze</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">Guided launch analysis</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Upload a slow-motion launch clip, calibrate the ball scale, track actual frame pixels, and save a POC estimate.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <Button disabled={!canAdvance || step === steps.length - 1} onClick={() => setStep((value) => Math.min(steps.length - 1, value + 1))}>
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-3 sm:grid-cols-4">
          {steps.map((item, index) => (
            <button
              key={item}
              type="button"
              onClick={() => setStep(index)}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-full px-3 py-3 text-left text-sm transition-colors",
                index === step ? "bg-primary text-primary-foreground" : "bg-muted/60 text-muted-foreground hover:bg-muted",
              )}
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-background/20 font-bold">
                {index < step ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
              </span>
              <span className="font-semibold">{item}</span>
            </button>
          ))}
        </CardContent>
      </Card>

      {step === 0 ? (
        <VideoUploadStep
          video={video}
          fps={fps}
          onFpsChange={(next) => {
            setFps(next);
            if (calibration) setCalibration({ ...calibration, fps: next });
          }}
          onVideoChange={(next) => {
            setVideo(next);
            setCalibration(null);
            setFrames([]);
            setTrack([]);
            setMetrics(null);
            setConfidence(null);
          }}
        />
      ) : null}
      {step === 1 ? (
        <CalibrationStep
          video={video}
          fps={fps}
          ballDiameterMm={settings?.ballDiameterMm ?? 42.67}
          calibration={calibration}
          onCalibrationChange={(next) => {
            resetAnalysisAfterCalibration(next);
            setStep(2);
          }}
        />
      ) : null}
      {step === 2 ? (
        <TrackingStep
          video={video}
          calibration={calibration}
          frameCount={frameCount}
          aggressiveSearch={settings?.experimental.aggressiveSearch ?? false}
          frames={frames}
          track={track}
          metrics={metrics}
          confidence={confidence}
          onFrameCountChange={setFrameCount}
          onAnalysisReady={(nextFrames, nextTrack, nextMetrics, nextConfidence) => {
            setFrames(nextFrames);
            setTrack(nextTrack);
            setMetrics(nextMetrics);
            setConfidence(nextConfidence);
          }}
        />
      ) : null}
      {step === 3 ? (
        <ResultsStep
          video={video}
          calibration={calibration}
          frames={frames}
          track={track}
          metrics={metrics}
          confidence={confidence}
          units={settings?.units ?? "imperial"}
          retainThumbnails={settings?.experimental.retainThumbnails ?? true}
        />
      ) : null}
    </div>
  );
}
