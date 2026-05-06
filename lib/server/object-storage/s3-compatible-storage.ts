import "server-only";

import type { ObjectStorageAdapter, PutObjectInput, StoredObject } from "@/lib/server/object-storage/types";

export class S3CompatibleStorageAdapter implements ObjectStorageAdapter {
  async putObject(_input: PutObjectInput): Promise<StoredObject> {
    throw new Error("S3-compatible object storage is not configured yet. Add endpoint, bucket, region, and credentials.");
  }

  async getObject(_key: string): Promise<{ bytes: Buffer; contentType: string; sizeBytes: number } | null> {
    throw new Error("S3-compatible object storage is not configured yet.");
  }

  async deleteObject(_key: string) {
    throw new Error("S3-compatible object storage is not configured yet.");
  }
}
