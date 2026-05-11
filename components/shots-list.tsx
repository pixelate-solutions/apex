"use client";

import Link from "next/link";
import { Trash2, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { ConfidenceBadge } from "@/components/confidence-badge";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { deleteShot, listShots } from "@/lib/storage/shots";
import type { SavedShot } from "@/lib/types/shot";
import { formatNumber } from "@/lib/utils";

export function ShotsList() {
  const [shots, setShots] = useState<SavedShot[]>([]);

  function refresh() {
    setShots(listShots());
  }

  useEffect(() => {
    refresh();
  }, []);

  if (!shots.length) {
    return (
      <Card>
        <CardContent className="flex min-h-80 flex-col items-center justify-center text-center">
          <Video className="h-10 w-10 text-muted-foreground" />
          <h2 className="mt-4 text-xl font-bold">No saved shots</h2>
          <p className="mt-2 max-w-md text-muted-foreground">Analyze and save a shot to build a local history in this browser.</p>
          <Button asChild className="mt-5" variant="accent">
            <Link href="/analyze">Analyze a Shot</Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Saved analyzed shots</CardTitle>
        <CardDescription>{shots.length} local shot{shots.length === 1 ? "" : "s"} saved in this browser.</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full min-w-[780px] text-sm">
          <thead className="text-left text-xs uppercase text-muted-foreground">
            <tr className="border-b">
              <th className="py-3 pr-4">Date</th>
              <th className="py-3 pr-4">Ball speed</th>
              <th className="py-3 pr-4">Launch angle</th>
              <th className="py-3 pr-4">Estimated carry</th>
              <th className="py-3 pr-4">Confidence</th>
              <th className="py-3 pr-4">Source video</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {shots.map((shot) => (
              <tr key={shot.id} className="border-b last:border-b-0">
                <td className="py-4 pr-4">{new Date(shot.createdAt).toLocaleString()}</td>
                <td className="py-4 pr-4 font-semibold">{formatNumber(shot.metrics.speedMph, 1)} mph</td>
                <td className="py-4 pr-4">{formatNumber(shot.metrics.launchAngleDeg, 1)}°</td>
                <td className="py-4 pr-4">{formatNumber(shot.metrics.estimatedCarryYards, 0)} yd</td>
                <td className="py-4 pr-4">
                  <ConfidenceBadge confidence={shot.confidence} />
                </td>
                <td className="max-w-60 truncate py-4 pr-4">{shot.videoName}</td>
                <td className="py-4">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/shots/${shot.id}`}>Open</Link>
                    </Button>
                    <ConfirmDialog
                      title="Are you sure you want to delete this shot?"
                      description="This will permanently remove this saved analysis from local storage. This action cannot be undone."
                      confirmLabel="Delete shot"
                      onConfirm={() => {
                        deleteShot(shot.id);
                        refresh();
                      }}
                      trigger={
                        <Button size="icon" variant="ghost" aria-label="Delete shot">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      }
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
