import { ShotsList } from "@/components/shots-list";

export default function ShotsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-muted-foreground">Shot library</p>
        <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">Saved analyses</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Local shot records are stored in your browser and can be replaced later with database-backed persistence.
        </p>
      </div>
      <ShotsList />
    </div>
  );
}
