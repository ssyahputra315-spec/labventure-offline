import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Save } from "lucide-react";
import { useState, useCallback } from "react";
import { getLabById, getExperimentById } from "@/lib/labData";
import { completeExperiment, setLastOpened, addNote, addAchievement, getData, unlockLab, labModules } from "@/lib/storage";
import { FreeFallSimulation } from "@/components/experiments/FreeFall";
import { ProjectileMotion } from "@/components/experiments/ProjectileMotion";
import { InclinedPlane } from "@/components/experiments/InclinedPlane";
import { FrictionTest } from "@/components/experiments/FrictionTest";
import { CircuitSimulation } from "@/components/experiments/CircuitSimulation";
import { WaveSimulation } from "@/components/experiments/WaveSimulation";
import { OpticsSimulation } from "@/components/experiments/OpticsSimulation";
import { ThermodynamicsSimulation } from "@/components/experiments/ThermodynamicsSimulation";
import { MagnetismSimulation } from "@/components/experiments/MagnetismSimulation";

export const Route = createFileRoute("/experiment/$labId/$expId")({
  head: ({ params }) => ({
    meta: [{ title: `${params.expId} — Physics Lab Simulator` }],
  }),
  component: ExperimentPage,
});

function ExperimentPage() {
  const { labId, expId } = Route.useParams();
  const navigate = useNavigate();
  const lab = getLabById(labId);
  const exp = getExperimentById(labId, expId);
  const [noteText, setNoteText] = useState("");
  const [tab, setTab] = useState<"sim" | "notes">("sim");
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  const handleComplete = useCallback(() => {
    completeExperiment(expId, labId);
    setLastOpened(labId, expId);

    const data = getData();
    const completedCount = data.completedExperiments.length + 1;

    // Check achievements
    if (completedCount === 1) addAchievement("first-experiment");
    if (completedCount >= 5) addAchievement("five-experiments");
    if (completedCount >= 10) addAchievement("ten-experiments");

    // Check lab-specific
    const labDef = getLabById(labId);
    if (labDef) {
      const allDone = labDef.experiments.every(
        (e) => data.completedExperiments.includes(e.id) || e.id === expId
      );
      if (allDone && labId === "mechanics") addAchievement("all-mechanics");
      if (allDone && labId === "electricity") addAchievement("all-electricity");
    }

    // Unlock next lab
    const currentIdx = labModules.findIndex((l) => l.id === labId);
    const completedInLab = (labDef?.experiments.filter(
      (e) => data.completedExperiments.includes(e.id) || e.id === expId
    ).length) ?? 0;
    if (completedInLab >= 2 && currentIdx < labModules.length - 1) {
      unlockLab(labModules[currentIdx + 1].id);
    }

    setShowCompleteModal(true);
    setTimeout(() => setShowCompleteModal(false), 3000);
  }, [expId, labId]);

  const handleSaveNote = () => {
    if (!noteText.trim()) return;
    addNote({ lab: lab?.name ?? labId, experiment: exp?.name ?? expId, text: noteText.trim() });
    addAchievement("note-taker");
    setNoteText("");
  };

  if (!lab || !exp) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Experiment not found</div>;
  }

  // Set last opened
  setLastOpened(labId, expId);

  const renderSimulation = () => {
    switch (expId) {
      case "free-fall": return <FreeFallSimulation onComplete={handleComplete} />;
      case "projectile": return <ProjectileMotion onComplete={handleComplete} />;
      case "inclined-plane": return <InclinedPlane onComplete={handleComplete} />;
      case "friction": return <FrictionTest onComplete={handleComplete} />;
      case "simple-circuit":
      case "ohms-law":
      case "resistors":
        return <CircuitSimulation onComplete={handleComplete} />;
      case "sine-wave":
      case "interference":
      case "standing-waves":
        return <WaveSimulation onComplete={handleComplete} />;
      case "reflection":
      case "refraction":
      case "prism":
        return <OpticsSimulation onComplete={handleComplete} />;
      case "heating":
      case "conduction":
      case "gas-law":
        return <ThermodynamicsSimulation onComplete={handleComplete} />;
      case "field-lines":
      case "electromagnet":
      case "compass":
        return <MagnetismSimulation onComplete={handleComplete} />;
      default:
        return <div className="p-8 text-center text-muted-foreground">Simulation coming soon</div>;
    }
  };

  return (
    <div className="min-h-screen pb-20">
      {/* Header */}
      <div className="px-5 pt-6 pb-3">
        <button onClick={() => navigate({ to: "/lab/$labId", params: { labId } })} className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
          <ArrowLeft className="w-4 h-4" /> Back to {lab.name}
        </button>
        <h1 className="text-lg font-bold text-foreground">{exp.name}</h1>
        <p className="text-xs text-muted-foreground mt-0.5">{exp.description}</p>
      </div>

      {/* Tabs */}
      <div className="px-5 mb-4">
        <div className="flex gap-1 p-1 rounded-xl bg-muted">
          {(["sim", "notes"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${
                tab === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"
              }`}
            >
              {t === "sim" ? "Simulation" : "Notes"}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        {tab === "sim" ? (
          renderSimulation()
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write your observations..."
                className="w-full p-4 rounded-2xl border bg-card text-sm text-foreground placeholder-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                rows={4}
              />
              <button
                onClick={handleSaveNote}
                disabled={!noteText.trim()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium disabled:opacity-40"
              >
                <Save className="w-4 h-4" /> Save Note
              </button>
            </div>
            <div className="space-y-2">
              {getData().experimentNotes
                .filter((n) => n.experiment === exp.name)
                .reverse()
                .map((n) => (
                  <div key={n.id} className="p-3 rounded-xl bg-muted/50 border">
                    <p className="text-sm text-foreground">{n.text}</p>
                    <p className="text-[10px] text-muted-foreground mt-1">{new Date(n.date).toLocaleDateString()}</p>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* Completion Modal */}
      {showCompleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 animate-fade-in">
          <div className="bg-card rounded-3xl p-8 text-center shadow-xl animate-pop mx-5">
            <p className="text-4xl mb-3">🎉</p>
            <h2 className="text-xl font-bold text-foreground">Experiment Completed!</h2>
            <p className="text-sm text-muted-foreground mt-2">Great work! Your progress has been saved.</p>
          </div>
        </div>
      )}
    </div>
  );
}
