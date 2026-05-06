import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { getObjectStorageAdapter } from "@/lib/server/object-storage";

const purposeSchema = z.enum(["source-video", "thumbnail", "processed-frame", "benchmark"]);

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  const purpose = purposeSchema.safeParse(form.get("purpose"));
  if (!(file instanceof File) || !purpose.success) {
    return NextResponse.json({ error: "Upload requires a file and valid purpose." }, { status: 400 });
  }

  const adapter = getObjectStorageAdapter();
  const bytes = Buffer.from(await file.arrayBuffer());
  const stored = await adapter.putObject({
    ownerUserId: userId,
    purpose: purpose.data,
    filename: file.name,
    contentType: file.type || "application/octet-stream",
    bytes,
  });

  return NextResponse.json({ object: stored }, { status: 201 });
}

export async function GET(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const key = request.nextUrl.searchParams.get("key");
  if (!key || !key.startsWith(`${userId}/`)) return NextResponse.json({ error: "Object not found." }, { status: 404 });

  const object = await getObjectStorageAdapter().getObject(key);
  if (!object) return NextResponse.json({ error: "Object not found." }, { status: 404 });

  return new NextResponse(new Uint8Array(object.bytes), {
    headers: {
      "content-type": object.contentType,
      "content-length": String(object.sizeBytes),
      "cache-control": "private, max-age=3600",
    },
  });
}
