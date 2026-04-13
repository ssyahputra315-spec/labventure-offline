import { useRef, useEffect, useState, useCallback } from "react";

interface FreeFallProps {
  onComplete?: () => void;
}

const GRAVITY_PRESETS = [
  { label: "Moon", value: 1.62 },
  { label: "Earth", value: 9.81 },
  { label: "Jupiter", value: 24.79 },
];

export function FreeFallSimulation({ onComplete }: FreeFallProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const graphCanvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const [height, setHeight] = useState(50);
  const [gravityIdx, setGravityIdx] = useState(1);
  const [mass, setMass] = useState(5);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [velocity, setVelocity] = useState(0);
  const [distance, setDistance] = useState(0);
  const [completed, setCompleted] = useState(false);
  const [graphData, setGraphData] = useState<Array<{ t: number; d: number }>>([]);

  const g = GRAVITY_PRESETS[gravityIdx].value;

  const drawSimulation = useCallback((canvas: HTMLCanvasElement, t: number, h: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const ch = canvas.height;
    ctx.clearRect(0, 0, w, ch);

    // Background gradient
    ctx.fillStyle = "#f0f4ff";
    ctx.fillRect(0, 0, w, ch);

    // Ground
    ctx.fillStyle = "#8B7355";
    ctx.fillRect(0, ch - 30, w, 30);
    ctx.fillStyle = "#6B8E23";
    ctx.fillRect(0, ch - 32, w, 4);

    // Height markers
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    for (let i = 0; i <= h; i += Math.ceil(h / 5)) {
      const y = 20 + ((h - i) / h) * (ch - 60);
      ctx.beginPath();
      ctx.moveTo(20, y);
      ctx.lineTo(w - 20, y);
      ctx.stroke();
      ctx.fillStyle = "#999";
      ctx.font = "10px sans-serif";
      ctx.fillText(`${i}m`, 2, y + 3);
    }
    ctx.setLineDash([]);

    // Ball
    const fallen = 0.5 * g * t * t;
    const currentDist = Math.min(fallen, h);
    const ballY = 20 + (currentDist / h) * (ch - 60);
    const radius = Math.max(8, Math.min(16, mass * 1.5));

    // Shadow
    ctx.beginPath();
    ctx.ellipse(w / 2, ch - 28, radius * 1.2, 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(0,0,0,${0.1 + (currentDist / h) * 0.2})`;
    ctx.fill();

    // Ball gradient
    const grad = ctx.createRadialGradient(w / 2 - 3, ballY - 3, 1, w / 2, ballY, radius);
    grad.addColorStop(0, "#7c8cf8");
    grad.addColorStop(1, "#4f46e5");
    ctx.beginPath();
    ctx.arc(w / 2, ballY, radius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(w / 2 - radius * 0.3, ballY - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fill();
  }, [g, mass]);

  const drawGraph = useCallback((canvas: HTMLCanvasElement, data: Array<{ t: number; d: number }>) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    ctx.fillStyle = "#fafbff";
    ctx.fillRect(0, 0, w, h);

    if (data.length < 2) {
      ctx.fillStyle = "#aaa";
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.fillText("Start simulation to see graph", w / 2, h / 2);
      return;
    }

    const pad = 40;
    const gw = w - pad * 2;
    const gh = h - pad * 2;
    const maxT = Math.max(...data.map((d) => d.t), 1);
    const maxD = Math.max(...data.map((d) => d.d), 1);

    // Axes
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(pad, pad);
    ctx.lineTo(pad, h - pad);
    ctx.lineTo(w - pad, h - pad);
    ctx.stroke();

    // Labels
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("Time (s)", w / 2, h - 8);
    ctx.save();
    ctx.translate(12, h / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Distance (m)", 0, 0);
    ctx.restore();

    // Data line
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 2;
    ctx.beginPath();
    data.forEach((pt, i) => {
      const x = pad + (pt.t / maxT) * gw;
      const y = h - pad - (pt.d / maxD) * gh;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth * 2;
      canvas.height = canvas.offsetHeight * 2;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(2, 2);
      drawSimulation(canvas, 0, height);
    }
    const gc = graphCanvasRef.current;
    if (gc) {
      gc.width = gc.offsetWidth * 2;
      gc.height = gc.offsetHeight * 2;
      const ctx = gc.getContext("2d");
      if (ctx) ctx.scale(2, 2);
      drawGraph(gc, []);
    }
  }, []);

  useEffect(() => {
    if (!running || paused) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    let lastGraphTime = 0;
    const newGraphData: Array<{ t: number; d: number }> = [];

    const animate = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const t = (timestamp - startTimeRef.current) / 1000;
      const d = Math.min(0.5 * g * t * t, height);
      const v = Math.min(g * t, Math.sqrt(2 * g * height));

      setElapsed(t);
      setVelocity(v);
      setDistance(d);

      drawSimulation(canvas, t, height);

      if (t - lastGraphTime > 0.05) {
        newGraphData.push({ t, d });
        lastGraphTime = t;
        setGraphData([...newGraphData]);
        const gc = graphCanvasRef.current;
        if (gc) drawGraph(gc, newGraphData);
      }

      if (d >= height) {
        setRunning(false);
        setCompleted(true);
        onComplete?.();
        return;
      }

      animRef.current = requestAnimationFrame(animate);
    };

    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, paused, g, height, drawSimulation, drawGraph, onComplete]);

  const start = () => {
    setRunning(true);
    setPaused(false);
    setCompleted(false);
    setElapsed(0);
    setVelocity(0);
    setDistance(0);
    setGraphData([]);
    startTimeRef.current = 0;
  };

  const reset = () => {
    cancelAnimationFrame(animRef.current);
    setRunning(false);
    setPaused(false);
    setCompleted(false);
    setElapsed(0);
    setVelocity(0);
    setDistance(0);
    setGraphData([]);
    startTimeRef.current = 0;
    const canvas = canvasRef.current;
    if (canvas) drawSimulation(canvas, 0, height);
    const gc = graphCanvasRef.current;
    if (gc) drawGraph(gc, []);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Canvas */}
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg">
        <canvas ref={canvasRef} className="w-full" style={{ height: "260px" }} />
      </div>

      {/* Live values */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Time</p>
          <p className="text-sm font-bold text-foreground">{elapsed.toFixed(2)}s</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Velocity</p>
          <p className="text-sm font-bold text-foreground">{velocity.toFixed(1)} m/s</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Distance</p>
          <p className="text-sm font-bold text-foreground">{distance.toFixed(1)} m</p>
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Height</span>
            <span className="font-medium text-foreground">{height}m</span>
          </div>
          <input type="range" min={1} max={100} value={height} onChange={(e) => setHeight(+e.target.value)} disabled={running} className="w-full accent-primary" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground mb-1">Gravity</p>
          <div className="flex gap-2">
            {GRAVITY_PRESETS.map((p, i) => (
              <button
                key={p.label}
                onClick={() => setGravityIdx(i)}
                disabled={running}
                className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                  gravityIdx === i ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Mass</span>
            <span className="font-medium text-foreground">{mass} kg</span>
          </div>
          <input type="range" min={1} max={20} value={mass} onChange={(e) => setMass(+e.target.value)} disabled={running} className="w-full accent-primary" />
        </div>
      </div>

      {/* Buttons */}
      <div className="flex gap-2">
        {!running && !completed && (
          <button onClick={start} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
            Start
          </button>
        )}
        {running && (
          <button
            onClick={() => { setPaused(!paused); if (paused) startTimeRef.current = 0; }}
            className="flex-1 py-3 rounded-xl bg-secondary text-secondary-foreground font-medium text-sm"
          >
            {paused ? "Resume" : "Pause"}
          </button>
        )}
        <button onClick={reset} className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm">
          Reset
        </button>
      </div>

      {/* Graph */}
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg">
        <p className="text-xs font-medium text-muted-foreground px-3 pt-2">Position vs Time</p>
        <canvas ref={graphCanvasRef} className="w-full" style={{ height: "180px" }} />
      </div>

      {completed && (
        <div className="p-4 rounded-2xl bg-success/10 border border-success/20 text-center animate-pop">
          <p className="text-lg">🎉</p>
          <p className="font-semibold text-sm text-foreground">Experiment Complete!</p>
          <p className="text-xs text-muted-foreground mt-1">
            Object fell {height}m in {elapsed.toFixed(2)}s with final velocity {velocity.toFixed(1)} m/s
          </p>
        </div>
      )}
    </div>
  );
}
