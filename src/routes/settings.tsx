import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { getData, updateSettings } from "@/lib/storage";
import type { AppSettings } from "@/lib/storage";

export const Route = createFileRoute("/settings")({
  head: () => ({ meta: [{ title: "Settings — Physics Lab Simulator" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>(() => getData().settings);

  const toggle = (key: keyof AppSettings, value: unknown) => {
    const updated = { ...settings, [key]: value } as AppSettings;
    setSettings(updated);
    updateSettings(updated);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
      </div>

      <div className="px-5 space-y-3">
        {/* Sound */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-card border">
          <div>
            <p className="font-medium text-sm text-foreground">Sound Effects</p>
            <p className="text-xs text-muted-foreground">Play sounds during simulations</p>
          </div>
          <button
            onClick={() => toggle("sound", !settings.sound)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              settings.sound ? "bg-primary" : "bg-muted"
            }`}
          >
            <div
              className={`absolute top-0.5 w-6 h-6 rounded-full bg-card shadow transition-transform ${
                settings.sound ? "left-[calc(100%-1.625rem)]" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Units */}
        <div className="p-4 rounded-2xl bg-card border">
          <p className="font-medium text-sm text-foreground mb-3">Unit System</p>
          <div className="flex gap-2">
            {(["metric", "imperial"] as const).map((u) => (
              <button
                key={u}
                onClick={() => toggle("units", u)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  settings.units === u
                    ? "bg-primary text-primary-foreground shadow"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {u.charAt(0).toUpperCase() + u.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="p-4 rounded-2xl bg-card border">
          <p className="font-medium text-sm text-foreground">About</p>
          <p className="text-xs text-muted-foreground mt-1">Physics Lab Simulator v1.0</p>
          <p className="text-xs text-muted-foreground">Offline-first virtual laboratory for students</p>
        </div>
      </div>
    </div>
  );
}
