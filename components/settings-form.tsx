"use client";

import { FlaskConical, Save } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { defaultSettings, loadSettings, saveSettings } from "@/lib/settings";
import type { AppSettings, Units } from "@/lib/types/shot";

export function SettingsForm() {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setSettings(loadSettings());
  }, []);

  function patch(next: Partial<AppSettings>) {
    setSaved(false);
    setSettings((value) => ({ ...value, ...next }));
  }

  return (
    <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Defaults</CardTitle>
          <CardDescription>These values seed new analyses. Existing saved shots are not changed.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="default-fps">Default FPS</Label>
              <Input id="default-fps" type="number" min={24} value={settings.fps} onChange={(event) => patch({ fps: Number(event.target.value) })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="default-diameter">Default ball diameter (mm)</Label>
              <Input
                id="default-diameter"
                type="number"
                step={0.01}
                min={20}
                value={settings.ballDiameterMm}
                onChange={(event) => patch({ ballDiameterMm: Number(event.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label>Preferred units</Label>
              <Select value={settings.units} onValueChange={(value) => patch({ units: value as Units })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="imperial">mph / yards</SelectItem>
                  <SelectItem value="metric">km/h / meters</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Analysis frame count</Label>
              <Select
                value={String(settings.analysisFrameCount)}
                onValueChange={(value) => patch({ analysisFrameCount: Number(value) as 10 | 20 | 30 | 60 })}
              >
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
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="threshold">Confidence threshold</Label>
              <Input
                id="threshold"
                type="number"
                min={0}
                max={100}
                value={settings.confidenceThreshold}
                onChange={(event) => patch({ confidenceThreshold: Number(event.target.value) })}
              />
            </div>
          </div>
          <Button
            variant="accent"
            onClick={() => {
              saveSettings(settings);
              setSaved(true);
            }}
          >
            <Save className="h-4 w-4" />
            {saved ? "Settings saved" : "Save settings"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5" />
            Experimental flags
          </CardTitle>
          <CardDescription>POC-only switches for local analysis behavior.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center justify-between gap-4 rounded-3xl border bg-background p-4">
            <div>
              <p className="font-semibold">Aggressive ball search</p>
              <p className="text-sm text-muted-foreground">Lowers thresholding and expands candidate matching for harder videos.</p>
            </div>
            <Switch
              checked={settings.experimental.aggressiveSearch}
              onCheckedChange={(checked) => patch({ experimental: { ...settings.experimental, aggressiveSearch: checked } })}
            />
          </div>
          <div className="flex items-center justify-between gap-4 rounded-3xl border bg-background p-4">
            <div>
              <p className="font-semibold">Retain thumbnails</p>
              <p className="text-sm text-muted-foreground">Save a small first-frame JPEG with each shot when browser storage allows.</p>
            </div>
            <Switch
              checked={settings.experimental.retainThumbnails}
              onCheckedChange={(checked) => patch({ experimental: { ...settings.experimental, retainThumbnails: checked } })}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
