import { createFileRoute } from "@tanstack/react-router";
import { Trophy, Beaker, Star } from "lucide-react";
import { getData } from "@/lib/storage";
import { achievements as allAchievements, labModules } from "@/lib/labData";

export const Route = createFileRoute("/progress")({
  head: () => ({
    meta: [
      { title: "Progress — Physics Lab Simulator" },
    ],
  }),
  component: ProgressPage,
});

function ProgressPage() {
  const data = getData();
  const totalExperiments = labModules.reduce((s, l) => s + l.experiments.length, 0);
  const overallProgress = Math.round((data.completedExperiments.length / totalExperiments) * 100);

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Progress</h1>
      </div>

      {/* Overall */}
      <div className="px-5 mb-6">
        <div className="p-5 rounded-2xl bg-card border lab-card-shadow text-center">
          <div className="relative w-20 h-20 mx-auto mb-3">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--muted)"
                strokeWidth="3"
              />
              <path
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                stroke="var(--primary)"
                strokeWidth="3"
                strokeDasharray={`${overallProgress}, 100`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg font-bold text-foreground">{overallProgress}%</span>
            </div>
          </div>
          <p className="font-semibold text-foreground">{data.completedExperiments.length} / {totalExperiments} experiments</p>
          <p className="text-xs text-muted-foreground">Overall completion</p>
        </div>
      </div>

      {/* Per-lab progress */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Lab Progress</h2>
        <div className="space-y-2">
          {labModules.map((lab) => {
            const completed = lab.experiments.filter((e) => data.completedExperiments.includes(e.id)).length;
            const pct = Math.round((completed / lab.experiments.length) * 100);
            const Icon = lab.icon;
            return (
              <div key={lab.id} className="flex items-center gap-3 p-3 rounded-xl bg-card border">
                <Icon className="w-5 h-5 shrink-0" style={{ color: lab.colorVar }} />
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <p className="text-sm font-medium text-foreground">{lab.name}</p>
                    <p className="text-xs text-muted-foreground">{completed}/{lab.experiments.length}</p>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: lab.colorVar }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-foreground flex items-center gap-2">
          <Trophy className="w-5 h-5 text-accent" /> Achievements
        </h2>
        <div className="grid grid-cols-2 gap-3">
          {allAchievements.map((ach) => {
            const unlocked = data.achievements.some((a) => a.id === ach.id);
            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  unlocked ? "bg-card lab-card-shadow" : "bg-muted/40 opacity-50"
                }`}
              >
                <span className="text-2xl">{ach.icon}</span>
                <p className="text-xs font-semibold text-foreground mt-1">{ach.name}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{ach.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
