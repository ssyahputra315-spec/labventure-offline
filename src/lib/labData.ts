import { Zap, Waves, Sun, Flame, Magnet, Cog } from "lucide-react";

export interface Experiment {
  id: string;
  name: string;
  description: string;
}

export interface LabModule {
  id: string;
  name: string;
  description: string;
  icon: typeof Cog;
  colorVar: string;
  experiments: Experiment[];
}

export const labModules: LabModule[] = [
  {
    id: "mechanics",
    name: "Mechanics",
    description: "Forces, motion, and energy",
    icon: Cog,
    colorVar: "var(--lab-mechanics)",
    experiments: [
      { id: "free-fall", name: "Free Fall Simulator", description: "Drop objects from different heights and observe gravity" },
      { id: "projectile", name: "Projectile Motion", description: "Launch objects at angles and trace trajectories" },
      { id: "inclined-plane", name: "Inclined Plane", description: "Study motion on slopes with friction" },
      { id: "friction", name: "Friction Test", description: "Compare static and kinetic friction" },
    ],
  },
  {
    id: "electricity",
    name: "Electricity",
    description: "Circuits, current, and voltage",
    icon: Zap,
    colorVar: "var(--lab-electricity)",
    experiments: [
      { id: "simple-circuit", name: "Simple Circuit", description: "Build basic series and parallel circuits" },
      { id: "ohms-law", name: "Ohm's Law", description: "Explore the relationship between V, I, and R" },
      { id: "resistors", name: "Resistor Networks", description: "Combine resistors in series and parallel" },
    ],
  },
  {
    id: "waves",
    name: "Waves & Sound",
    description: "Wave behavior and properties",
    icon: Waves,
    colorVar: "var(--lab-waves)",
    experiments: [
      { id: "sine-wave", name: "Sine Wave", description: "Visualize transverse waves with controls" },
      { id: "interference", name: "Wave Interference", description: "See constructive and destructive interference" },
      { id: "standing-waves", name: "Standing Waves", description: "Create and observe standing wave patterns" },
    ],
  },
  {
    id: "optics",
    name: "Optics",
    description: "Light, lenses, and reflection",
    icon: Sun,
    colorVar: "var(--lab-optics)",
    experiments: [
      { id: "reflection", name: "Mirror Reflection", description: "Trace light rays reflecting off mirrors" },
      { id: "refraction", name: "Lens Refraction", description: "See how lenses bend light rays" },
      { id: "prism", name: "Prism Dispersion", description: "Split white light into a spectrum" },
    ],
  },
  {
    id: "thermodynamics",
    name: "Thermodynamics",
    description: "Heat, temperature, and energy",
    icon: Flame,
    colorVar: "var(--lab-thermo)",
    experiments: [
      { id: "heating", name: "Heating Water", description: "Heat water and observe phase changes" },
      { id: "conduction", name: "Heat Conduction", description: "Compare heat transfer in different materials" },
      { id: "gas-law", name: "Ideal Gas Law", description: "Explore pressure, volume, and temperature" },
    ],
  },
  {
    id: "magnetism",
    name: "Magnetism",
    description: "Magnetic fields and forces",
    icon: Magnet,
    colorVar: "var(--lab-magnetism)",
    experiments: [
      { id: "field-lines", name: "Field Lines", description: "Visualize magnetic field patterns" },
      { id: "electromagnet", name: "Electromagnet", description: "Create magnetic fields with electric current" },
      { id: "compass", name: "Compass Navigation", description: "Use a compass to map magnetic fields" },
    ],
  },
];

export function getLabById(id: string) {
  return labModules.find((l) => l.id === id);
}

export function getExperimentById(labId: string, expId: string) {
  const lab = getLabById(labId);
  return lab?.experiments.find((e) => e.id === expId);
}

export const achievements = [
  { id: "first-experiment", name: "First Steps", description: "Complete your first experiment", icon: "🧪" },
  { id: "first-graph", name: "Data Visualizer", description: "Generate your first graph", icon: "📊" },
  { id: "five-experiments", name: "Lab Regular", description: "Complete 5 experiments", icon: "⭐" },
  { id: "all-mechanics", name: "Newton's Apprentice", description: "Complete all Mechanics experiments", icon: "🍎" },
  { id: "all-electricity", name: "Circuit Master", description: "Complete all Electricity experiments", icon: "⚡" },
  { id: "note-taker", name: "Note Taker", description: "Save your first note", icon: "📝" },
  { id: "ten-experiments", name: "Science Pro", description: "Complete 10 experiments", icon: "🏆" },
];
