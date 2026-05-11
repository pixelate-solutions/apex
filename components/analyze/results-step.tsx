"use client";

import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Check, Save, TriangleAlert } from "lucide-react";
import { useState } from "react";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { MetricCard } from "@/components/metric-card";
import { TrajectoryOverlay } from "@/components/analyze/trajectory-overlay";
import { VideoCanvas } from "@/components/analyze/video-canvas";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { makeShotId, saveShot } from "@/lib/storage/shots";
import type { Calibration, ConfidenceResult, LaunchMetrics, TrackPoint, Units, VideoFileState, VisionFrame } from "@/lib/types/shot";
import { formatNumber } from "@/lib/utils";

type Props = {
  video: VideoFileState | null;
  calibration: Calibration | null;
  frames: VisionFrame[];
  track: TrackPoint[];
  metrics: LaunchMetrics | null;
  confidence: ConfidenceResult | null;
  units: Units;
  retainThumbnails?: boolean;
};

export function ResultsStep({ video, calibration, frames, track, metrics, confidence, units, retainThumbnails = true }: Props) {
  const { isSignedIn } = useUser();
  const [notes, setNotes] = useState("");
  const [savedId, setSavedId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);

  if (!video || !calibration || !metrics || !confidence) {
    return (
      <Alert>
        <AlertTitle>Analysis required</AlertTitle>
        <AlertDescription>Run tracking before reviewing results.</AlertDescription>
      </Alert>
    );
  }

  async function handleSave() {
    if (!video || !calibration || !metrics || !confidence) return;
    const id = savedId ?? makeShotId();
    const shot = {
      id,
      createdAt: new Date().toISOString(),
      videoName: video.file.name,
      calibration,
      track,
      metrics,
      confidence,
      notes,
      thumbnailDataUrl: retainThumbnails ? frames[0]?.dataUrl : undefined,
    };
    const result = saveShot({
      ...shot,
    });
    if (result.ok) {
      setSavedId(id);
      setSaveError(null);
      setSyncStatus("Saved locally.");
      await trySyncToBackend(shot, video.file, retainThumbnails ? frames[0]?.dataUrl : undefined);
    } else {
      setSaveError(result.message);
    }
  }

  async function trySyncToBackend(shot: NonNullable<Parameters<typeof saveShot>[0]>, sourceFile: File, thumbnailDataUrl?: string) {
    try {
      if (!isSignedIn) {
        setSyncStatus("Saved locally. Sign in to sync source video and shot records to the backend.");
        return;
      }

      setSyncStatus("Uploading source video...");
      const sourceVideoObjectKey = await uploadObject(sourceFile, "source-video");
      let thumbnailObjectKey: string | undefined;
      if (thumbnailDataUrl) {
        setSyncStatus("Uploading thumbnail...");
        thumbnailObjectKey = await uploadObject(dataUrlToFile(thumbnailDataUrl, `${shot.id}.jpg`), "thumbnail");
      }

      setSyncStatus("Syncing shot record...");
      const response = await fetch("/api/server-shots", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ shot, sourceVideoObjectKey, thumbnailObjectKey }),
      });
      if (!response.ok) throw new Error("Server shot sync failed.");
      setSyncStatus("Saved locally and synced to backend storage.");
    } catch (error) {
      setSyncStatus(error instanceof Error ? error.message : "Local save succeeded; backend sync failed.");
    }
  }

  const speed = units === "imperial" ? `${formatNumber(metrics.speedMph, 1)} mph` : `${formatNumber(metrics.speedKmh, 1)} km/h`;
  const carry =
    units === "imperial"
      ? `${formatNumber(metrics.estimatedCarryYards, 0)} yd`
      : `${formatNumber(metrics.estimatedCarryMeters, 0)} m`;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 border border-border bg-card p-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="inline-flex border border-accent/45 px-2 py-1 text-xs font-black uppercase tracking-[0.18em] text-accent">
            Analysis complete · 1.84 s
          </p>
          <h2 className="mt-5 text-4xl font-black tracking-normal">SHOT_4912</h2>
          <p className="mt-2 text-sm font-bold uppercase tracking-[0.18em] text-muted-foreground">
            {new Date().toLocaleDateString()} · local browser · {calibration.fps} fps
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            Re-run
          </Button>
          <Button onClick={handleSave} variant="accent">
            {savedId ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
            {savedId ? "Saved" : "Save shot"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 metric-grid">
        <MetricCard label="Ball Speed" value={speed} helper="POC estimate from early frame displacement" tone="accent" />
        <MetricCard label="Launch Angle" value={`${formatNumber(metrics.launchAngleDeg, 1)}°`} helper="Side-view image trajectory" />
        <MetricCard label="Estimated Carry" value={carry} helper="Projectile model with conservative drag factor" />
        <MetricCard label="Confidence" value={`${confidence.score}/100`} helper={confidence.level} tone="muted" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader className="flex-row items-start justify-between gap-3">
            <div>
              <CardTitle>Tracking visualization</CardTitle>
              <CardDescription>Highlighted early points are used for speed and angle regression.</CardDescription>
            </div>
            <ConfidenceBadge confidence={confidence} />
          </CardHeader>
          <CardContent className="space-y-4">
            <VideoCanvas frameDataUrl={frames[0]?.dataUrl} points={track} metricFrameLimit={metrics.framesUsed} />
            <TrajectoryOverlay points={track} />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics</CardTitle>
              <CardDescription>Use these values to decide whether to re-calibrate or correct points.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Diag label="FPS" value={String(calibration.fps)} />
              <Diag label="Frames analyzed" value={String(track.length)} />
              <Diag label="Detections used" value={String(metrics.framesUsed)} />
              <Diag label="Pixels / meter" value={formatNumber(calibration.pixelsPerMeter, 0)} />
              <Diag label="Trajectory fit" value={`${formatNumber(metrics.fitR2 * 100, 0)}%`} />
              <Diag label="View" value={calibration.viewType} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Warnings</CardTitle>
              <CardDescription>Review before using this local proof-of-concept estimate.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {metrics.warnings.length ? (
                metrics.warnings.map((warning) => (
                  <Alert key={warning} className="py-3">
                    <TriangleAlert className="h-4 w-4" />
                    <AlertDescription>{warning}</AlertDescription>
                  </Alert>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No major warnings for this analysis.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Save shot locally</CardTitle>
          <CardDescription>Only shot metadata, track points, metrics, notes, and a small thumbnail are saved.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <Input
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleSave();
                }
              }}
              placeholder="Notes about setup, club, strike, or calibration quality..."
              className="h-12 flex-1"
            />
            <Button onClick={handleSave} variant="accent" className="h-12 shrink-0 px-6">
              {savedId ? <Check className="h-4 w-4" /> : <Save className="h-4 w-4" />}
              {savedId ? "Saved" : "Save analyzed shot"}
            </Button>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            {savedId ? (
              <Button asChild variant="outline">
                <Link href={`/shots/${savedId}`}>Open shot detail</Link>
              </Button>
            ) : null}
          </div>
          {saveError ? <p className="text-sm text-destructive">{saveError}</p> : null}
          {syncStatus ? <p className="text-sm text-muted-foreground">{syncStatus}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

async function uploadObject(file: File, purpose: "source-video" | "thumbnail") {
  const form = new FormData();
  form.set("file", file);
  form.set("purpose", purpose);
  const response = await fetch("/api/objects", { method: "POST", body: form });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error ?? "Object upload failed.");
  return data.object.key as string;
}

function dataUrlToFile(dataUrl: string, filename: string) {
  const [metadata, payload] = dataUrl.split(",");
  const contentType = metadata.match(/data:(.*?);base64/)?.[1] ?? "image/jpeg";
  const bytes = Uint8Array.from(atob(payload), (char) => char.charCodeAt(0));
  return new File([bytes], filename, { type: contentType });
}

function Diag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-background p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
