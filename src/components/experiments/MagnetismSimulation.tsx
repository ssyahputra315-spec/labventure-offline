import { useRef, useEffect, useState, useCallback } from "react";

interface Props { onComplete?: () => void; }

export function MagnetismSimulation({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const [strength, setStrength] = useState(50);
  const [running, setRunning] = useState(true);

  const draw = useCallback((canvas: HTMLCanvasElement, t: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w * 2, h * 2);

    ctx.fillStyle = "#f8faff";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const s = strength / 50;

    // Magnet bar
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(cx - 40, cy - 12, 40, 24);
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(cx, cy - 12, 40, 24);
    ctx.fillStyle = "#fff";
    ctx.font = "bold 12px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("N", cx - 20, cy + 5);
    ctx.fillText("S", cx + 20, cy + 5);

    // Field lines
    const numLines = 8;
    for (let i = 0; i < numLines; i++) {
      const angle = (i / numLines) * Math.PI * 2;
      ctx.strokeStyle = `rgba(100, 100, 200, ${0.3 + s * 0.3})`;
      ctx.lineWidth = 1.5;
      ctx.beginPath();

      const rMax = 40 + s * 80;
      for (let r = 0; r <= 1; r += 0.02) {
        const radius = rMax * r;
        const wobble = Math.sin(t * 2 + i + r * 4) * 3 * s;
        const px = cx + Math.cos(angle + r * Math.PI * 0.5) * radius + wobble;
        const py = cy + Math.sin(angle + r * Math.PI * 0.5) * radius * 0.6;
        if (r === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.stroke();
    }

    // Iron filings animation
    const numFilings = Math.floor(30 * s);
    for (let i = 0; i < numFilings; i++) {
      const a = (i / numFilings) * Math.PI * 2 + t * 0.3;
      const r = 50 + (i % 5) * 20 + Math.sin(t + i) * 5;
      const fx = cx + Math.cos(a) * r;
      const fy = cy + Math.sin(a) * r * 0.6;
      const fa = Math.atan2(fy - cy, fx - cx);
      ctx.save();
      ctx.translate(fx, fy);
      ctx.rotate(fa);
      ctx.fillStyle = `rgba(80, 80, 80, ${0.4 + Math.sin(t * 3 + i) * 0.2})`;
      ctx.fillRect(-4, -1, 8, 2);
      ctx.restore();
    }

    // Compass
    const compassX = w - 60;
    const compassY = h - 60;
    const compassAngle = Math.atan2(cy - compassY, cx - compassX) + Math.sin(t * 0.5) * 0.1;
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(compassX, compassY, 22, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = "#ef4444";
    ctx.beginPath();
    ctx.moveTo(compassX + Math.cos(compassAngle) * 16, compassY + Math.sin(compassAngle) * 16);
    ctx.lineTo(compassX + Math.cos(compassAngle + 2.7) * 6, compassY + Math.sin(compassAngle + 2.7) * 6);
    ctx.lineTo(compassX + Math.cos(compassAngle - 2.7) * 6, compassY + Math.sin(compassAngle - 2.7) * 6);
    ctx.fill();
    ctx.fillStyle = "#ccc";
    ctx.beginPath();
    ctx.moveTo(compassX - Math.cos(compassAngle) * 16, compassY - Math.sin(compassAngle) * 16);
    ctx.lineTo(compassX - Math.cos(compassAngle - 2.7) * 6, compassY - Math.sin(compassAngle - 2.7) * 6);
    ctx.lineTo(compassX - Math.cos(compassAngle + 2.7) * 6, compassY - Math.sin(compassAngle + 2.7) * 6);
    ctx.fill();
  }, [strength]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(2, 2);
  }, []);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    let last = 0;
    const animate = (ts: number) => {
      if (!last) last = ts;
      timeRef.current += (ts - last) / 1000;
      last = ts;
      draw(canvas, timeRef.current);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, draw]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg">
        <canvas ref={canvasRef} className="w-full" style={{ height: "280px" }} />
      </div>
      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Magnet Strength</span><span className="font-medium text-foreground">{strength}%</span></div>
          <input type="range" min={10} max={100} value={strength} onChange={(e) => setStrength(+e.target.value)} className="w-full accent-primary" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
          {running ? "Pause" : "Play"}
        </button>
        <button onClick={() => onComplete?.()} className="flex-1 py-3 rounded-xl bg-success text-success-foreground font-medium text-sm">Complete ✓</button>
      </div>
    </div>
  );
}
