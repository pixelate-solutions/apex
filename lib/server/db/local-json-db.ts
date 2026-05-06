import "server-only";

import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ApexDatabase, ServerShotRecord } from "@/lib/server/db/schema";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "apex-db.json");

const emptyDb: ApexDatabase = {
  shots: [],
};

async function ensureDataDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

export async function readDatabase(): Promise<ApexDatabase> {
  await ensureDataDir();
  try {
    const raw = await readFile(DB_PATH, "utf8");
    const parsed = JSON.parse(raw) as Partial<ApexDatabase>;
    return {
      shots: Array.isArray(parsed.shots) ? parsed.shots : [],
    };
  } catch {
    return emptyDb;
  }
}

export async function writeDatabase(db: ApexDatabase) {
  await ensureDataDir();
  const tmpPath = `${DB_PATH}.${process.pid}.tmp`;
  await writeFile(tmpPath, JSON.stringify(db, null, 2), "utf8");
  await rename(tmpPath, DB_PATH);
}

export async function upsertShot(record: ServerShotRecord) {
  const db = await readDatabase();
  const index = db.shots.findIndex((shot) => shot.id === record.id && shot.ownerUserId === record.ownerUserId);
  if (index >= 0) db.shots[index] = record;
  else db.shots.push(record);
  await writeDatabase(db);
  return record;
}

export async function listUserShots(ownerUserId: string) {
  const db = await readDatabase();
  return db.shots
    .filter((shot) => shot.ownerUserId === ownerUserId)
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
}

export async function deleteUserShot(ownerUserId: string, id: string) {
  const db = await readDatabase();
  const next = db.shots.filter((shot) => !(shot.ownerUserId === ownerUserId && shot.id === id));
  const deleted = next.length !== db.shots.length;
  db.shots = next;
  await writeDatabase(db);
  return deleted;
}
