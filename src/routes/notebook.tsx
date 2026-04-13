import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Trash2, FlaskConical } from "lucide-react";
import { getData, deleteNote } from "@/lib/storage";
import { useState } from "react";

export const Route = createFileRoute("/notebook")({
  head: () => ({
    meta: [
      { title: "Notebook — Physics Lab Simulator" },
      { name: "description", content: "Your experiment notes" },
    ],
  }),
  component: NotebookPage,
});

function NotebookPage() {
  const [, setTick] = useState(0);
  const data = getData();
  const notes = [...data.experimentNotes].reverse();

  const handleDelete = (id: string) => {
    deleteNote(id);
    setTick((t) => t + 1);
  };

  return (
    <div className="min-h-screen pb-20">
      <div className="px-5 pt-8 pb-4">
        <h1 className="text-2xl font-bold text-foreground">Notebook</h1>
        <p className="text-sm text-muted-foreground mt-1">{notes.length} note{notes.length !== 1 ? "s" : ""}</p>
      </div>

      {notes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 px-5 text-center">
          <BookOpen className="w-12 h-12 text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground font-medium">No notes yet</p>
          <p className="text-sm text-muted-foreground mt-1">Save notes from experiments to review later</p>
          <Link to="/labs" className="mt-4 text-sm text-primary font-medium flex items-center gap-1">
            <FlaskConical className="w-4 h-4" /> Go to Labs
          </Link>
        </div>
      ) : (
        <div className="px-5 space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="p-4 rounded-2xl bg-card border">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs font-medium text-primary">{note.lab} / {note.experiment}</p>
                  <p className="text-sm text-foreground mt-1 whitespace-pre-wrap">{note.text}</p>
                  <p className="text-[10px] text-muted-foreground mt-2">
                    {new Date(note.date).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(note.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
