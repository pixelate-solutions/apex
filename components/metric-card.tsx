import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type MetricCardProps = {
  label: string;
  value: string;
  helper?: string;
  tone?: "default" | "accent" | "muted";
};

export function MetricCard({ label, value, helper, tone = "default" }: MetricCardProps) {
  return (
    <Card className={cn(tone === "accent" && "border-primary/30 bg-accent/55", tone === "muted" && "bg-muted/60")}>
      <CardContent className="p-5">
        <p className="text-xs font-bold uppercase text-muted-foreground">{label}</p>
        <p className="mt-3 text-3xl font-black tracking-normal">{value}</p>
        {helper ? <p className="mt-2 text-sm text-muted-foreground">{helper}</p> : null}
      </CardContent>
    </Card>
  );
}
