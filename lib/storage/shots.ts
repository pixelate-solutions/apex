"use client";

import { type SavedShot, shotSchema } from "@/lib/types/shot";

const SHOTS_KEY = "apex.shots.v1";
const LEGACY_SHOTS_KEY = "launchlab.shots.v1";
const MAX_THUMBNAIL_LENGTH = 450_000;

// Browser-first repository. Signed-in saves can also sync through /api/server-shots and /api/objects.
function readRawShots(): unknown[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(SHOTS_KEY);
    if (raw) return JSON.parse(raw);
    const legacy = localStorage.getItem(LEGACY_SHOTS_KEY);
    return legacy ? JSON.parse(legacy) : [];
  } catch {
    return [];
  }
}

function writeRawShots(shots: SavedShot[]) {
  localStorage.setItem(SHOTS_KEY, JSON.stringify(shots));
}

export function listShots(): SavedShot[] {
  return readRawShots()
    .map((shot) => shotSchema.safeParse(shot))
    .filter((result) => result.success)
    .map((result) => result.data)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export function getShot(id: string): SavedShot | null {
  return listShots().find((shot) => shot.id === id) ?? null;
}

export function saveShot(shot: SavedShot): { ok: true } | { ok: false; message: string } {
  if (typeof window === "undefined") return { ok: false, message: "Local storage is not available." };
  const normalized: SavedShot = {
    ...shot,
    thumbnailDataUrl:
      shot.thumbnailDataUrl && shot.thumbnailDataUrl.length <= MAX_THUMBNAIL_LENGTH ? shot.thumbnailDataUrl : undefined,
  };
  const existing = listShots().filter((item) => item.id !== normalized.id);
  const next = [normalized, ...existing].slice(0, 50);
  try {
    writeRawShots(next);
    return { ok: true };
  } catch {
    try {
      writeRawShots(next.map((item) => ({ ...item, thumbnailDataUrl: undefined })));
      return { ok: true };
    } catch {
      return { ok: false, message: "Browser storage is full. Delete older shots or disable thumbnails." };
    }
  }
}

export function updateShotNotes(id: string, notes: string) {
  const next = listShots().map((shot) => (shot.id === id ? { ...shot, notes } : shot));
  writeRawShots(next);
}

export function deleteShot(id: string) {
  writeRawShots(listShots().filter((shot) => shot.id !== id));
}

export function makeShotId() {
  return `shot_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}
