import { createFileRoute, Link } from "@tanstack/react-router";
import { Play, Lock, Beaker, Trophy, ChevronRight } from "lucide-react";
import { getData } from "@/lib/storage";
import { labModules } from "@/lib/labData";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Physics Lab Simulator" },
      { name: "description", content: "Interactive physics experiments for students — fully offline" },
      { property: "og:title", content: "Physics Lab Simulator" },
      { property: "og:description", content: "Interactive physics experiments for students" },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const data = getData();
  const completedCount = data.completedExperiments.length;
  const achievementCount = data.achievements.length;
  const hasLast = data.lastOpenedLab && data.lastOpenedExperiment;

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-5 pt-8 pb-6">
        <div className="flex items-center gap-3 mb-1">
          <Beaker className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Physics Lab Simulator</h1>
        </div>
        <p className="text-muted-foreground text-sm ml-11">Your virtual laboratory</p>
      </div>

      {/* Continue button */}
      {hasLast && (
        <div className="px-5 mb-6 animate-slide-up">
          <Link
            to="/experiment/$labId/$expId"
            params={{ labId: data.lastOpenedLab!, expId: data.lastOpenedExperiment! }}
            className="flex items-center gap-3 w-full p-4 rounded-2xl bg-primary text-primary-foreground lab-card-shadow"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-foreground/20 flex items-center justify-center">
              <Play className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">Continue Last Experiment</p>
              <p className="text-xs opacity-80">Pick up where you left off</p>
            </div>
            <ChevronRight className="w-5 h-5 opacity-60" />
          </Link>
        </div>
      )}

      {/* Lab Categories */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Lab Categories</h2>
        <div className="grid grid-cols-2 gap-3">
          {labModules.map((lab, i) => {
            const Icon = lab.icon;
            const isUnlocked = data.unlockedLabs.includes(lab.id);
            const labExps = lab.experiments.map((e) => e.id);
            const completed = labExps.filter((e) => data.completedExperiments.includes(e)).length;
            const progress = Math.round((completed / labExps.length) * 100);

            return (
              <Link
                key={lab.id}
                to={isUnlocked ? "/lab/$labId" : "/"}
                params={{ labId: lab.id }}
                className={`relative p-4 rounded-2xl border transition-all duration-300 ${
                  isUnlocked
                    ? "bg-card lab-card-shadow hover:scale-[1.02] active:scale-[0.98]"
                    : "bg-muted/50 opacity-60"
                }`}
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {!isUnlocked && (
                  <div className="absolute top-3 right-3">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                )}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ backgroundColor: `color-mix(in oklch, ${lab.colorVar}, transparent 85%)` }}
                >
                  <Icon className="w-5 h-5" style={{ color: lab.colorVar }} />
                </div>
                <h3 className="font-semibold text-sm text-foreground">{lab.name}</h3>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-tight">{lab.description}</p>
                {isUnlocked && (
                  <div className="mt-3">
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${progress}%`,
                          backgroundColor: lab.colorVar,
                        }}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">{progress}% complete</p>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Progress Summary */}
      <div className="px-5 mb-6">
        <h2 className="text-lg font-semibold mb-3 text-foreground">Your Progress</h2>
        <div className="grid grid-cols-2 gap-3">
          <div className="p-4 rounded-2xl bg-card border">
            <Beaker className="w-5 h-5 text-primary mb-2" />
            <p className="text-2xl font-bold text-foreground">{completedCount}</p>
            <p className="text-xs text-muted-foreground">Experiments done</p>
          </div>
          <div className="p-4 rounded-2xl bg-card border">
            <Trophy className="w-5 h-5 text-accent mb-2" />
            <p className="text-2xl font-bold text-foreground">{achievementCount}</p>
            <p className="text-xs text-muted-foreground">Achievements</p>
          </div>
        </div>
      </div>
    </div>
  );
}
