import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, ChevronRight } from "lucide-react";
import { getData } from "@/lib/storage";
import { labModules } from "@/lib/labData";

export const Route = createFileRoute("/labs")({
  head: () => ({
    meta: [
      { title: "Labs Library — Physics Lab Simulator" },
      { name: "description", content: "Browse all physics lab modules" },
    ],
  }),
  component: LabsPage,
});

function LabsPage() {
  const data = getData();

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Labs Library</h1>
        <p className="text-sm text-muted-foreground mt-1">Choose a lab to explore</p>
      </div>

      <div className="px-5 space-y-3">
        {labModules.map((lab) => {
          const Icon = lab.icon;
          const isUnlocked = data.unlockedLabs.includes(lab.id);
          const labExps = lab.experiments.map((e) => e.id);
          const completed = labExps.filter((e) => data.completedExperiments.includes(e)).length;
          const progress = Math.round((completed / labExps.length) * 100);

          return (
            <Link
              key={lab.id}
              to={isUnlocked ? "/lab/$labId" : "/labs"}
              params={{ labId: lab.id }}
              className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                isUnlocked ? "bg-card lab-card-shadow hover:scale-[1.01] active:scale-[0.99]" : "bg-muted/40 opacity-50"
              }`}
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `color-mix(in oklch, ${lab.colorVar}, transparent 85%)` }}
              >
                <Icon className="w-6 h-6" style={{ color: lab.colorVar }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-foreground">{lab.name}</h3>
                  {!isUnlocked && <Lock className="w-3.5 h-3.5 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5">{lab.description}</p>
                {isUnlocked && (
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{ width: `${progress}%`, backgroundColor: lab.colorVar }}
                      />
                    </div>
                    <span className="text-[10px] text-muted-foreground font-medium">{completed}/{labExps.length}</span>
                  </div>
                )}
              </div>
              {isUnlocked && <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
