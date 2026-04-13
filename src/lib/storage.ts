export interface ExperimentNote {
  id: string;
  lab: string;
  experiment: string;
  text: string;
  date: string;
}

export interface SavedExperiment {
  id: string;
  labId: string;
  experimentId: string;
  params: Record<string, number | string | boolean>;
  date: string;
}

export interface Achievement {
  id: string;
  unlockedAt: string;
}

export interface AppSettings {
  sound: boolean;
  units: "metric" | "imperial";
}

export interface PhysicsLabData {
  completedLabs: string[];
  unlockedLabs: string[];
  completedExperiments: string[];
  experimentNotes: ExperimentNote[];
  savedExperiments: SavedExperiment[];
  achievements: Achievement[];
  settings: AppSettings;
  lastOpenedLab: string | null;
  lastOpenedExperiment: string | null;
}

const STORAGE_KEY = "physics_lab_data";

const defaultData: PhysicsLabData = {
  completedLabs: [],
  unlockedLabs: ["mechanics"],
  completedExperiments: [],
  experimentNotes: [],
  savedExperiments: [],
  achievements: [],
  settings: { sound: true, units: "metric" },
  lastOpenedLab: null,
  lastOpenedExperiment: null,
};

export function getData(): PhysicsLabData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      saveData(defaultData);
      return defaultData;
    }
    return { ...defaultData, ...JSON.parse(raw) };
  } catch {
    return defaultData;
  }
}

export function saveData(data: PhysicsLabData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function updateData(updater: (data: PhysicsLabData) => PhysicsLabData) {
  const data = getData();
  saveData(updater(data));
}

export function completeExperiment(experimentId: string, labId: string) {
  updateData((d) => {
    const completed = new Set(d.completedExperiments);
    completed.add(experimentId);
    const newData = { ...d, completedExperiments: [...completed] };
    return newData;
  });
}

export function unlockLab(labId: string) {
  updateData((d) => {
    const unlocked = new Set(d.unlockedLabs);
    unlocked.add(labId);
    return { ...d, unlockedLabs: [...unlocked] };
  });
}

export function addNote(note: Omit<ExperimentNote, "id" | "date">) {
  updateData((d) => ({
    ...d,
    experimentNotes: [
      ...d.experimentNotes,
      { ...note, id: crypto.randomUUID(), date: new Date().toISOString() },
    ],
  }));
}

export function deleteNote(id: string) {
  updateData((d) => ({
    ...d,
    experimentNotes: d.experimentNotes.filter((n) => n.id !== id),
  }));
}

export function addAchievement(achievementId: string): boolean {
  const data = getData();
  if (data.achievements.some((a) => a.id === achievementId)) return false;
  updateData((d) => ({
    ...d,
    achievements: [
      ...d.achievements,
      { id: achievementId, unlockedAt: new Date().toISOString() },
    ],
  }));
  return true;
}

export function updateSettings(settings: Partial<AppSettings>) {
  updateData((d) => ({ ...d, settings: { ...d.settings, ...settings } }));
}

export function setLastOpened(labId: string, experimentId?: string) {
  updateData((d) => ({
    ...d,
    lastOpenedLab: labId,
    lastOpenedExperiment: experimentId ?? d.lastOpenedExperiment,
  }));
}
