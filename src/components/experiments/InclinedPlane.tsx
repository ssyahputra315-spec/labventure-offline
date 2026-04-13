import { useRef, useEffect, useState, useCallback } from "react";

interface Props { onComplete?: () => void; }

export function InclinedPlane({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const startRef = useRef(0);

  const [angle, setAngle] = useState(30);
  const [friction, setFriction] = useState(0.2);
  const [running, setRunning] = useState(false);
  const [completed, setCompleted] = useState(false);

  const g = 9.81;
  const rad = (angle * Math.PI) / 180;
  const accel = g * (Math.sin(rad) - friction * Math.cos(rad));

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

    // Ramp
    const rampLen = w * 0.7;
    const rampH = rampLen * Math.tan(rad);
    const x0 = 40;
    const y0 = h - 28;

    ctx.fillStyle = "#d1d5db";
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x0 + rampLen, y0);
    ctx.lineTo(x0, y0 - Math.min(rampH, h - 60));
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "#9ca3af";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Block
    const dist = accel > 0 ? 0.5 * accel * t * t : 0;
    const pos = Math.min(dist / 5, rampLen - 30);
    const bx = x0 + pos * Math.cos(rad);
    const by = y0 - pos * Math.sin(rad);
    const size = 20;

    ctx.save();
    ctx.translate(bx, by);
    ctx.rotate(-rad);
    ctx.fillStyle = "#4f46e5";
    ctx.fillRect(-size / 2, -size, size, size);
    ctx.restore();

    // Angle arc
    ctx.strokeStyle = "#666";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x0, y0, 30, -Math.PI / 2, -Math.PI / 2 + rad, true);
    ctx.stroke();
    ctx.fillStyle = "#666";
    ctx.font = "11px sans-serif";
    ctx.fillText(`${angle}°`, x0 + 10, y0 - 10);
  }, [angle, accel, rad]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(2, 2);
    draw(canvas, 0);
  }, [draw]);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const animate = (ts: number) => {
      if (!startRef.current) startRef.current = ts;
      const t = (ts - startRef.current) / 1000;
      draw(canvas, t);
      if (t > 4) { setRunning(false); setCompleted(true); onComplete?.(); return; }
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, draw, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg">
        <canvas ref={canvasRef} className="w-full" style={{ height: "240px" }} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Acceleration</p>
          <p className="text-sm font-bold text-foreground">{accel.toFixed(2)} m/s²</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Net Force</p>
          <p className="text-sm font-bold text-foreground">{accel > 0 ? "Slides" : "Static"}</p>
        </div>
      </div>
      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Angle</span><span className="font-medium text-foreground">{angle}°</span></div>
          <input type="range" min={5} max={75} value={angle} onChange={(e) => setAngle(+e.target.value)} disabled={running} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Friction (μ)</span><span className="font-medium text-foreground">{friction.toFixed(2)}</span></div>
          <input type="range" min={0} max={0.8} step={0.05} value={friction} onChange={(e) => setFriction(+e.target.value)} disabled={running} className="w-full accent-primary" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => { setRunning(true); startRef.current = 0; setCompleted(false); }} disabled={running} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">Start</button>
        <button onClick={() => { cancelAnimationFrame(animRef.current); setRunning(false); startRef.current = 0; const c = canvasRef.current; if (c) draw(c, 0); }} className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm">Reset</button>
      </div>
      {completed && <div className="p-4 rounded-2xl bg-success/10 border border-success/20 text-center animate-pop"><p className="text-lg">🎉</p><p className="font-semibold text-sm text-foreground">Experiment Complete!</p></div>}
    </div>
  );
}
