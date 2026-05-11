import { ShotDetail } from "@/components/shot-detail";

export default async function ShotDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <ShotDetail id={id} />;
}
