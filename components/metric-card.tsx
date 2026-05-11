import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "accent" | "muted";
};

export function MetricCard({ label, value, helper, tone = "default" }: MetricCardProps) {
  const [primaryValue, ...unitParts] = value.split(" ");
  const unit = unitParts.join(" ");

  return (
    <Card className={cn("apex-stat-panel min-w-0", tone === "accent" && "border-primary/30 bg-accent/10", tone === "muted" && "bg-muted/60")}>
      <CardContent className="min-w-0 p-5">
        <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
        <p className={cn("apex-stat-value mt-3 text-3xl font-black tracking-normal", tone === "accent" && "text-accent")}>
          <span>{primaryValue}</span>
          {unit ? <span className="apex-stat-unit">{unit}</span> : null}
        </p>
        {helper ? <p className="mt-2 text-sm text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
