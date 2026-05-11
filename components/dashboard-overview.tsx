"use client";

import Link from "next/link";
import { ArrowRight, CheckCircle2, Cloud, LineChart, Server, ShieldCheck } from "lucide-react";
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
            <Link href="/settings">Review settings</Link>
          </Button>
        </div>
      </div>

      <section className="grid gap-4 metric-grid">
        <MetricCard label="Saved shots" value={String(shots.length)} helper="Local browser library" tone="accent" />
        <MetricCard label="Best ball speed" value={bestSpeed ? `${formatNumber(bestSpeed, 1)} mph` : "N/A"} helper="From saved analyses" />
        <MetricCard label="Avg confidence" value={shots.length ? `${formatNumber(averageConfidence, 0)}/100` : "N/A"} helper="Detection and calibration quality" />
        <MetricCard label="Default FPS" value={settings ? String(settings.fps) : "240"} helper="New analysis default" tone="muted" />
      </section>

      <section className="grid min-w-0 gap-5 xl:grid-cols-[minmax(280px,0.55fr)_minmax(0,1.45fr)]">
        <Card className="min-w-0">
          <CardHeader>
            <CardTitle>Current workflow status</CardTitle>
            <CardDescription>Operational checklist for the next shot workflow.</CardDescription>
          </CardHeader>
          <CardContent className="dashboard-readiness-grid grid gap-3">
            {readiness.map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="min-w-0 rounded-3xl border bg-background p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                  </div>
                  <p className="mt-4 text-sm font-semibold leading-snug">{item.label}</p>
                  <p className="mt-1 text-sm leading-snug text-muted-foreground">{item.value}</p>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <RecentShots />
      </section>
    </div>
  );
}
