import "server-only";

export type ObjectPurpose = "source-video" | "thumbnail" | "processed-frame" | "benchmark";

export type StoredObject = {
  key: string;
  url: string;
  contentType: string;
  sizeBytes: number;
  purpose: ObjectPurpose;
};

export type PutObjectInput = {
  ownerUserId: string;
  purpose: ObjectPurpose;
  filename: string;
  contentType: string;
  bytes: Buffer;
};

export interface ObjectStorageAdapter {
  putObject(input: PutObjectInput): Promise<StoredObject>;
  getObject(key: string): Promise<{ bytes: Buffer; contentType: string; sizeBytes: number } | null>;
  deleteObject(key: string): Promise<void>;
}
