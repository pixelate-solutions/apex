import { Badge } from "@/components/ui/badge";
import type { ConfidenceResult } from "@/lib/types/shot";

export function ConfidenceBadge({ confidence }: { confidence: ConfidenceResult }) {
  const variant = confidence.level === "high" ? "accent" : confidence.level === "medium" ? "secondary" : "destructive";
  return <Badge variant={variant}>{confidence.score}/100 {confidence.level}</Badge>;
}
