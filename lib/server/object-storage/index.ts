import "server-only";

import { LocalObjectStorageAdapter } from "@/lib/server/object-storage/local-object-storage";
import { S3CompatibleStorageAdapter } from "@/lib/server/object-storage/s3-compatible-storage";
import type { ObjectStorageAdapter } from "@/lib/server/object-storage/types";

export function getObjectStorageAdapter(): ObjectStorageAdapter {
  if (process.env.APEX_OBJECT_STORAGE_DRIVER === "s3") {
    return new S3CompatibleStorageAdapter();
  }
  return new LocalObjectStorageAdapter();
}
