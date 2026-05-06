"use client";

import { z } from "zod";
import { type AppSettings, settingsSchema } from "@/lib/types/shot";

const SETTINGS_KEY = "apex.settings.v1";
const LEGACY_SETTINGS_KEY = "launchlab.settings.v1";

export const defaultSettings: AppSettings = {
  fps: 240,
  ballDiameterMm: 42.67,
  units: "imperial",
  confidenceThreshold: 70,
  analysisFrameCount: 30,
  experimental: {
    aggressiveSearch: false,
    retainThumbnails: true,
  },
};

export function loadSettings(): AppSettings {
  if (typeof window === "undefined") return defaultSettings;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY) ?? localStorage.getItem(LEGACY_SETTINGS_KEY);
    if (!raw) return defaultSettings;
    return settingsSchema.parse({ ...defaultSettings, ...JSON.parse(raw) });
  } catch {
    return defaultSettings;
  }
}

export function saveSettings(settings: AppSettings) {
  if (typeof window === "undefined") return;
  const parsed = settingsSchema.parse(settings);
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(parsed));
}

export function parseSettingsPatch(value: unknown) {
  return settingsSchema.partial().catch(defaultSettings as z.infer<typeof settingsSchema>).parse(value);
}
