import { useRef, useEffect, useState, useCallback } from "react";

interface Props { onComplete?: () => void; }

export function ProjectileMotion({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef<number>(0);

  const [angle, setAngle] = useState(45);
  const [velocity, setVelocity] = useState(30);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [trail, setTrail] = useState<Array<{x:number;y:number}>>([]);

  const g = 9.81;
  const rad = (angle * Math.PI) / 180;
  const vx = velocity * Math.cos(rad);
  const vy = velocity * Math.sin(rad);
  const totalTime = (2 * vy) / g;
  const maxRange = vx * totalTime;
  const maxHeight = (vy * vy) / (2 * g);

  const draw = useCallback((canvas: HTMLCanvasElement, t: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w * 2, h * 2);

    ctx.fillStyle = "#f0f4ff";
    ctx.fillRect(0, 0, w, h);

    // Ground
    ctx.fillStyle = "#8B7355";
    ctx.fillRect(0, h - 25, w, 25);
    ctx.fillStyle = "#6B8E23";
    ctx.fillRect(0, h - 27, w, 4);

    const scale = Math.min((w - 60) / Math.max(maxRange, 1), (h - 80) / Math.max(maxHeight, 1));
    const ox = 30;
    const oy = h - 30;

    // Trail
    ctx.strokeStyle = "rgba(79, 70, 229, 0.3)";
    ctx.lineWidth = 2;
    ctx.setLineDash([3, 3]);
    ctx.beginPath();
    for (let i = 0; i <= 50; i++) {
      const tt = (i / 50) * totalTime;
      const px = ox + vx * tt * scale;
      const py = oy - (vy * tt - 0.5 * g * tt * tt) * scale;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // Ball position
    const clampedT = Math.min(t, totalTime);
    const bx = ox + vx * clampedT * scale;
    const by = oy - (vy * clampedT - 0.5 * g * clampedT * clampedT) * scale;

    // Ball
    const grad = ctx.createRadialGradient(bx - 2, by - 2, 1, bx, by, 10);
    grad.addColorStop(0, "#f97316");
    grad.addColorStop(1, "#ea580c");
    ctx.beginPath();
    ctx.arc(bx, Math.max(by, oy - 10), 10, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Angle indicator
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(ox, oy);
    ctx.lineTo(ox + 40 * Math.cos(rad), oy - 40 * Math.sin(rad));
    ctx.stroke();
  }, [vx, vy, g, totalTime, maxRange, maxHeight, rad]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(2, 2);
    draw(canvas, 0);
  }, []);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const animate = (timestamp: number) => {
      if (!startRef.current) startRef.current = timestamp;
      const t = (timestamp - startRef.current) / 1000;
      draw(canvas, t);
      if (t >= totalTime) {
        setRunning(false);
        setCompleted(true);
        onComplete?.();
        return;
      }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, draw, totalTime, onComplete]);

  const start = () => { setRunning(true); setCompleted(false); startRef.current = 0; };
  const reset = () => {
    cancelAnimationFrame(animRef.current);
    setRunning(false); setCompleted(false); startRef.current = 0;
    const c = canvasRef.current;
    if (c) draw(c, 0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg">
        <canvas ref={canvasRef} className="w-full" style={{ height: "260px" }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Max Height</p>
          <p className="text-sm font-bold text-foreground">{maxHeight.toFixed(1)}m</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Range</p>
          <p className="text-sm font-bold text-foreground">{maxRange.toFixed(1)}m</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Flight Time</p>
          <p className="text-sm font-bold text-foreground">{totalTime.toFixed(2)}s</p>
        </div>
      </div>
      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Angle</span>
            <span className="font-medium text-foreground">{angle}°</span>
          </div>
          <input type="range" min={5} max={85} value={angle} onChange={(e) => setAngle(+e.target.value)} disabled={running} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Initial Velocity</span>
            <span className="font-medium text-foreground">{velocity} m/s</span>
          </div>
          <input type="range" min={5} max={60} value={velocity} onChange={(e) => setVelocity(+e.target.value)} disabled={running} className="w-full accent-primary" />
        </div>
      </div>
      <div className="flex gap-2">
        {!running && <button onClick={start} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">Launch</button>}
        <button onClick={reset} className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm">Reset</button>
      </div>
      {completed && (
        <div className="p-4 rounded-2xl bg-success/10 border border-success/20 text-center animate-pop">
          <p className="text-lg">🎉</p>
          <p className="font-semibold text-sm text-foreground">Experiment Complete!</p>
        </div>
      )}
    </div>
  );
}
