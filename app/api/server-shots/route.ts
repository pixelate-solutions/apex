import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { deleteUserShot, listUserShots, upsertShot } from "@/lib/server/db/local-json-db";
import { shotSchema } from "@/lib/types/shot";

const saveServerShotSchema = z.object({
  shot: shotSchema,
  sourceVideoObjectKey: z.string().optional(),
  thumbnailObjectKey: z.string().optional(),
});

export async function GET() {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  return NextResponse.json({ shots: await listUserShots(userId) });
}

export async function POST(request: Request) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });

  const parsed = saveServerShotSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid shot payload." }, { status: 400 });

  const now = new Date().toISOString();
  const record = await upsertShot({
    id: parsed.data.shot.id,
    ownerUserId: userId,
    shot: parsed.data.shot,
    sourceVideoObjectKey: parsed.data.sourceVideoObjectKey,
    thumbnailObjectKey: parsed.data.thumbnailObjectKey,
    createdAt: parsed.data.shot.createdAt,
    updatedAt: now,
  });

  return NextResponse.json({ shot: record });
}

export async function DELETE(request: NextRequest) {
  const { userId } = await auth();
  if (!userId) return NextResponse.json({ error: "Authentication required." }, { status: 401 });
  const id = request.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Shot id is required." }, { status: 400 });
  return NextResponse.json({ deleted: await deleteUserShot(userId, id) });
}
