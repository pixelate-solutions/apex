"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Cloud, Gauge, LineChart, Server, ShieldCheck, Video } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { MetricCard } from "@/components/metric-card";
import { RecentShots } from "@/components/recent-shots";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loadSettings } from "@/lib/settings";
import { listShots } from "@/lib/storage/shots";
import type { AppSettings, SavedShot } from "@/lib/types/shot";
import { formatNumber } from "@/lib/utils";

const readiness = [
  { label: "Browser CV", value: "Ready", icon: LineChart },
  { label: "Accounts API", value: "Local JSON", icon: ShieldCheck },
  { label: "Object storage", value: "Local adapter", icon: Cloud },
  { label: "Hardware adapters", value: "Stubbed", icon: Server },
];

export function DashboardOverview() {
  const [shots, setShots] = useState<SavedShot[]>([]);
  const [settings, setSettings] = useState<AppSettings | null>(null);

  useEffect(() => {
    setShots(listShots());
    setSettings(loadSettings());
  }, []);

  const averageConfidence = useMemo(() => {
    if (!shots.length) return 0;
    return shots.reduce((sum, shot) => sum + shot.confidence.score, 0) / shots.length;
  }, [shots]);

  const latest = shots[0];
  const bestSpeed = shots.reduce((max, shot) => Math.max(max, shot.metrics.speedMph), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-black uppercase text-muted-foreground">Apex dashboard</p>
          <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-5xl">Shot analysis workspace</h1>
          <p className="mt-2 max-w-2xl text-muted-foreground">
            Monitor local analyses, confirm system readiness, and jump into the next launch video workflow.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <Button asChild variant="accent">
            <Link href="/analyze">
              Analyze a Shot
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/account">Set up account</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 metric-grid">
        <MetricCard label="Saved shots" value={String(shots.length)} helper="Local browser library" tone="accent" />
        <MetricCard label="Best ball speed" value={bestSpeed ? `${formatNumber(bestSpeed, 1)} mph` : "N/A"} helper="From saved analyses" />
        <MetricCard label="Avg confidence" value={shots.length ? `${formatNumber(averageConfidence, 0)}/100` : "N/A"} helper="Detection and calibration quality" />
        <MetricCard label="Default FPS" value={settings ? String(settings.fps) : "240"} helper="New analysis default" tone="muted" />
      </section>

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <CardHeader>
            <CardTitle>Current workflow status</CardTitle>
            <CardDescription>Operational checklist for the POC stack and the next shot workflow.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            {readiness.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="rounded-3xl border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-secondary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                  </div>
                  <p className="mt-4 font-semibold">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.value}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Latest shot summary</CardTitle>
            <CardDescription>{latest ? "Most recent saved local analysis." : "No saved shot yet."}</CardDescription>
          </CardHeader>
          <CardContent>
            {latest ? (
              <Link href={`/shots/${latest.id}`} className="block rounded-3xl border bg-background p-4 transition-colors hover:bg-muted/50">
                <div className="flex gap-4">
                  {latest.thumbnailDataUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={latest.thumbnailDataUrl} alt="" className="h-24 w-36 rounded-3xl object-cover" />
                  ) : (
                    <span className="flex h-24 w-36 items-center justify-center rounded-3xl bg-secondary">
                      <Video className="h-7 w-7" />
                    </span>
                  )}
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{latest.videoName}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{new Date(latest.createdAt).toLocaleString()}</p>
                    <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                      <span>
                        <strong>{formatNumber(latest.metrics.speedMph, 1)}</strong> mph
                      </span>
                      <span>
                        <strong>{formatNumber(latest.metrics.launchAngleDeg, 1)}</strong> deg
                      </span>
                      <span>
                        <strong>{formatNumber(latest.metrics.estimatedCarryYards, 0)}</strong> yd
                      </span>
                      <span>
                        <strong>{latest.confidence.score}</strong>/100
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="flex min-h-56 flex-col items-center justify-center rounded-3xl border bg-muted/40 text-center">
                <Gauge className="h-9 w-9 text-muted-foreground" />
                <p className="mt-3 font-semibold">Start with a launch clip</p>
                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Upload, calibrate, track, and save your first shot analysis.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </section>

      <RecentShots />
    </div>
  );
}
