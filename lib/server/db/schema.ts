import type { SavedShot } from "@/lib/types/shot";

export type ServerShotRecord = {
  id: string;
  ownerUserId: string;
  shot: SavedShot;
  sourceVideoObjectKey?: string;
  thumbnailObjectKey?: string;
  createdAt: string;
  updatedAt: string;
};

export type ApexDatabase = {
  shots: ServerShotRecord[];
};
