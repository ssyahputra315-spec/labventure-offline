import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, CheckCircle, ChevronRight, Play } from "lucide-react";
import { getData } from "@/lib/storage";
import { getLabById } from "@/lib/labData";

export const Route = createFileRoute("/lab/$labId")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.labId} Lab — Physics Lab Simulator` },
    ],
  }),
  component: LabDetailPage,
});

function LabDetailPage() {
  const { labId } = Route.useParams();
  const navigate = useNavigate();
  const lab = getLabById(labId);
  const data = getData();

  if (!lab) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Lab not found</p>
      </div>
    );
  }

  const Icon = lab.icon;

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-6 pb-4">
        <button onClick={() => navigate({ to: "/labs" })} className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to Labs
        </button>
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: `color-mix(in oklch, ${lab.colorVar}, transparent 85%)` }}
          >
            <Icon className="w-6 h-6" style={{ color: lab.colorVar }} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground">{lab.name}</h1>
            <p className="text-sm text-muted-foreground">{lab.description}</p>
          </div>
        </div>
      </div>

      <div className="px-5 space-y-3">
        {lab.experiments.map((exp) => {
          const isCompleted = data.completedExperiments.includes(exp.id);
          return (
            <Link
              key={exp.id}
              to="/experiment/$labId/$expId"
              params={{ labId, expId: exp.id }}
              className="flex items-center gap-4 p-4 rounded-2xl bg-card border lab-card-shadow hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                isCompleted ? "bg-success/15" : "bg-primary/10"
              }`}>
                {isCompleted ? (
                  <CheckCircle className="w-5 h-5 text-success" />
                ) : (
                  <Play className="w-5 h-5 text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-sm text-foreground">{exp.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{exp.description}</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
