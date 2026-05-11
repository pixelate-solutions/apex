"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowUpRight, Gauge } from "lucide-react";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { listShots } from "@/lib/storage/shots";
import type { SavedShot } from "@/lib/types/shot";
import { formatNumber } from "@/lib/utils";

export function RecentShots({ limit = 3 }: { limit?: number }) {
  const [shots, setShots] = useState<SavedShot[]>([]);

  useEffect(() => {
    setShots(listShots().slice(0, limit));
  }, [limit]);

  if (!shots.length) {
    return (
      <Card className="min-w-0">
        <CardHeader>
          <CardTitle>Recent analyzed shots</CardTitle>
          <CardDescription>Your local shot history will appear here.</CardDescription>
        </CardHeader>
        <CardContent className="flex min-h-40 flex-col items-center justify-center rounded-b-lg bg-muted/40 text-center">
          <Gauge className="h-8 w-8 text-muted-foreground" />
          <p className="mt-3 font-semibold">No analyzed shots yet</p>
          <p className="mt-1 max-w-md text-sm text-muted-foreground">Run the guided workflow to save your first local POC analysis.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="min-w-0">
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <CardTitle>Recent analyzed shots</CardTitle>
          <CardDescription>Saved locally in this browser.</CardDescription>
        </div>
        <Button asChild variant="outline" size="sm" className="w-full sm:w-auto">
          <Link href="/shots">View all</Link>
        </Button>
      </CardHeader>
      <CardContent className="grid gap-3">
        {shots.map((shot) => (
          <Link
            key={shot.id}
            href={`/shots/${shot.id}`}
            className="grid min-w-0 cursor-pointer gap-3 rounded-3xl border bg-background p-3 transition-colors hover:bg-muted/50 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
          >
            <div className="flex min-w-0 items-center gap-3">
              {shot.thumbnailDataUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={shot.thumbnailDataUrl} alt="" className="h-14 w-20 shrink-0 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-14 w-20 shrink-0 items-center justify-center rounded-2xl bg-secondary">
                  <Gauge className="h-5 w-5" />
                </span>
              )}
              <div className="min-w-0">
                <p className="truncate font-semibold">{shot.videoName}</p>
                <p className="text-sm text-muted-foreground">{new Date(shot.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-wrap items-center gap-3 pl-[5.75rem] md:flex-nowrap md:justify-end md:pl-0">
              <span className="text-sm font-semibold">{formatNumber(shot.metrics.speedMph, 1)} mph</span>
              <ConfidenceBadge confidence={shot.confidence} />
              <ArrowUpRight className="h-4 w-4 shrink-0" />
            </div>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
