import "server-only";

import { randomUUID } from "node:crypto";
import { mkdir, readFile, rm, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ObjectStorageAdapter, PutObjectInput, StoredObject } from "@/lib/server/object-storage/types";

const ROOT = path.join(process.cwd(), "data", "object-storage");

function safeSegment(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

function makeObjectKey(input: PutObjectInput) {
  const ext = path.extname(input.filename);
  const base = path.basename(input.filename, ext);
  return [
    safeSegment(input.ownerUserId),
    input.purpose,
    `${Date.now()}-${randomUUID()}-${safeSegment(base)}${safeSegment(ext)}`,
  ].join("/");
}

function absolutePathForKey(key: string) {
  const safeKey = key
    .split("/")
    .map((segment) => safeSegment(segment))
    .join("/");
  return path.join(ROOT, safeKey);
}

export class LocalObjectStorageAdapter implements ObjectStorageAdapter {
  async putObject(input: PutObjectInput): Promise<StoredObject> {
    const key = makeObjectKey(input);
    const filePath = absolutePathForKey(key);
    await mkdir(path.dirname(filePath), { recursive: true });
    await writeFile(filePath, input.bytes);
    return {
      key,
      url: `/api/objects?key=${encodeURIComponent(key)}`,
      contentType: input.contentType,
      sizeBytes: input.bytes.byteLength,
      purpose: input.purpose,
    };
  }

  async getObject(key: string) {
    const filePath = absolutePathForKey(key);
    try {
      const [bytes, info] = await Promise.all([readFile(filePath), stat(filePath)]);
      return {
        bytes,
        contentType: inferContentType(key),
        sizeBytes: info.size,
      };
    } catch {
      return null;
    }
  }

  async deleteObject(key: string) {
    await rm(absolutePathForKey(key), { force: true });
  }
}

function inferContentType(key: string) {
  const lower = key.toLowerCase();
  if (lower.endsWith(".mp4")) return "video/mp4";
  if (lower.endsWith(".mov")) return "video/quicktime";
  if (lower.endsWith(".webm")) return "video/webm";
  if (lower.endsWith(".png")) return "image/png";
  if (lower.endsWith(".jpg") || lower.endsWith(".jpeg")) return "image/jpeg";
  return "application/octet-stream";
}
