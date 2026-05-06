"use client";

import Link from "next/link";
import { ArrowLeft, Save, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { MetricCard } from "@/components/metric-card";
import { TrajectoryOverlay } from "@/components/analyze/trajectory-overlay";
import { VideoCanvas } from "@/components/analyze/video-canvas";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { deleteShot, getShot, updateShotNotes } from "@/lib/storage/shots";
import type { SavedShot } from "@/lib/types/shot";
import { formatNumber } from "@/lib/utils";

export function ShotDetail({ id }: { id: string }) {
  const [shot, setShot] = useState<SavedShot | null | undefined>(undefined);
  const [notes, setNotes] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const next = getShot(id);
    setShot(next);
    setNotes(next?.notes ?? "");
  }, [id]);

  if (shot === undefined) return null;

  if (!shot) {
    return (
      <Card>
        <CardContent className="flex min-h-72 flex-col items-center justify-center text-center">
          <h1 className="text-2xl font-black">Shot not found</h1>
          <p className="mt-2 text-muted-foreground">This saved shot is not available in local storage.</p>
          <Button asChild className="mt-5">
            <Link href="/shots">Back to shots</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Button asChild variant="ghost" className="-ml-3 mb-3">
            <Link href="/shots">
              <ArrowLeft className="h-4 w-4" />
              Shots
            </Link>
          </Button>
          <p className="text-sm font-bold uppercase text-muted-foreground">{new Date(shot.createdAt).toLocaleString()}</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">{shot.videoName}</h1>
        </div>
        <div className="flex gap-2">
          <ConfidenceBadge confidence={shot.confidence} />
          <Button
            variant="outline"
            onClick={() => {
              deleteShot(shot.id);
              window.location.href = "/shots";
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-4 metric-grid">
        <MetricCard label="Ball Speed" value={`${formatNumber(shot.metrics.speedMph, 1)} mph`} tone="accent" />
        <MetricCard label="Launch Angle" value={`${formatNumber(shot.metrics.launchAngleDeg, 1)}°`} />
        <MetricCard label="Estimated Carry" value={`${formatNumber(shot.metrics.estimatedCarryYards, 0)} yd`} />
        <MetricCard label="Confidence" value={`${shot.confidence.score}/100`} helper={shot.confidence.level} tone="muted" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <Card>
          <CardHeader>
            <CardTitle>Frame preview and path</CardTitle>
            <CardDescription>Stored thumbnail plus tracked center points. Source video is not stored locally.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <VideoCanvas frameDataUrl={shot.thumbnailDataUrl} points={shot.track} metricFrameLimit={shot.metrics.framesUsed} />
            <TrajectoryOverlay points={shot.track} />
          </CardContent>
        </Card>

        <div className="space-y-5">
          <Card>
            <CardHeader>
              <CardTitle>Diagnostics</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
              <Diag label="FPS" value={String(shot.calibration.fps)} />
              <Diag label="Frames" value={String(shot.track.length)} />
              <Diag label="Used" value={String(shot.metrics.framesUsed)} />
              <Diag label="Pixels / meter" value={formatNumber(shot.calibration.pixelsPerMeter, 0)} />
              <Diag label="Fit" value={`${formatNumber(shot.metrics.fitR2 * 100, 0)}%`} />
              <Diag label="View" value={shot.calibration.viewType} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
              <CardDescription>Stored locally with the shot record.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea value={notes} onChange={(event) => setNotes(event.target.value)} />
              <Button
                onClick={() => {
                  updateShotNotes(shot.id, notes);
                  setSaved(true);
                }}
              >
                <Save className="h-4 w-4" />
                {saved ? "Saved" : "Save notes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {shot.metrics.warnings.length ? (
        <Alert>
          <AlertTitle>Warnings</AlertTitle>
          <AlertDescription>{shot.metrics.warnings.join(" ")}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

function Diag({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-3xl border bg-background p-3">
      <p className="text-xs uppercase text-muted-foreground">{label}</p>
      <p className="mt-1 font-semibold">{value}</p>
    </div>
  );
}
