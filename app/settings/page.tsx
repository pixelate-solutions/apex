import { SettingsForm } from "@/components/settings-form";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-bold uppercase text-muted-foreground">Settings</p>
        <h1 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">App preferences</h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          Configure local defaults for FPS, units, calibration values, confidence, and POC feature flags.
        </p>
      </div>
      <SettingsForm />
    </div>
  );
}
