import { useRef, useEffect, useState, useCallback } from "react";

interface Props { onComplete?: () => void; }

export function ThermodynamicsSimulation({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const [heatPower, setHeatPower] = useState(50);
  const [containerSize, setContainerSize] = useState(50);
  const [temperature, setTemperature] = useState(20);
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState<"liquid" | "boiling" | "steam">("liquid");

  const draw = useCallback((canvas: HTMLCanvasElement, temp: number, t: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w * 2, h * 2);

    ctx.fillStyle = "#f8faff";
    ctx.fillRect(0, 0, w, h);

    const cw = containerSize * 2 + 60;
    const ch2 = containerSize * 1.5 + 40;
    const cx = w / 2;
    const cy = h / 2 + 10;

    // Container
    ctx.strokeStyle = "#6b7280";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.rect(cx - cw / 2, cy - ch2 / 2, cw, ch2);
    ctx.stroke();

    // Water level
    const waterH = ch2 * 0.7;
    const waterY = cy + ch2 / 2 - waterH;
    const blue = Math.max(0.3, 1 - (temp - 20) / 100);
    const red = Math.min(1, (temp - 20) / 80);
    ctx.fillStyle = `rgba(${Math.round(red * 200)}, ${Math.round(100 - red * 60)}, ${Math.round(blue * 255)}, 0.6)`;
    ctx.fillRect(cx - cw / 2 + 3, waterY, cw - 6, cy + ch2 / 2 - waterY - 3);

    // Bubbles when boiling
    if (temp >= 95) {
      const numBubbles = Math.floor((temp - 95) / 2) + 3;
      for (let i = 0; i < numBubbles; i++) {
        const bx = cx - cw / 2 + 20 + Math.sin(t * 2 + i * 1.5) * (cw / 2 - 20) + cw / 4;
        const by = waterY + 10 + ((t * 40 + i * 30) % (cy + ch2 / 2 - waterY - 20));
        const br = 2 + Math.random() * 3;
        ctx.beginPath();
        ctx.arc(bx, by, br, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,255,255,0.5)";
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Steam particles
    if (temp >= 100) {
      ctx.fillStyle = "rgba(200,200,220,0.3)";
      for (let i = 0; i < 8; i++) {
        const sx = cx - cw / 4 + Math.sin(t * 1.5 + i * 0.8) * (cw / 3);
        const sy = waterY - 10 - ((t * 30 + i * 15) % 60);
        const sr = 4 + Math.sin(t + i) * 2;
        ctx.beginPath();
        ctx.arc(sx, sy, sr, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Flame
    if (running) {
      const flameH = heatPower * 0.4 + 10;
      for (let i = 0; i < 5; i++) {
        const fx = cx - 10 + i * 5 + Math.sin(t * 8 + i) * 3;
        const fy = cy + ch2 / 2 + 10;
        const fh = flameH + Math.sin(t * 6 + i * 2) * 5;
        const grad = ctx.createLinearGradient(fx, fy, fx, fy - fh);
        grad.addColorStop(0, "rgba(255, 100, 0, 0.8)");
        grad.addColorStop(0.5, "rgba(255, 180, 0, 0.6)");
        grad.addColorStop(1, "rgba(255, 220, 100, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(fx - 6, fy);
        ctx.quadraticCurveTo(fx, fy - fh, fx + 6, fy);
        ctx.fill();
      }
    }

    // Thermometer
    const tx = cx + cw / 2 + 25;
    const ty1 = cy - ch2 / 2;
    const ty2 = cy + ch2 / 2;
    const thermH = ty2 - ty1;
    ctx.strokeStyle = "#999";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(tx - 5, ty1, 10, thermH, 5);
    ctx.stroke();
    const fill = Math.min((temp / 120) * thermH, thermH - 4);
    ctx.fillStyle = `rgb(${Math.min(255, temp * 2.5)}, ${Math.max(0, 100 - temp)}, ${Math.max(0, 150 - temp * 1.5)})`;
    ctx.fillRect(tx - 3, ty2 - fill - 2, 6, fill);

    // Temperature text
    ctx.fillStyle = "#333";
    ctx.font = "bold 14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${Math.round(temp)}°C`, cx, cy - ch2 / 2 - 10);
  }, [containerSize, heatPower, running]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(2, 2);
    draw(canvas, 20, 0);
  }, []);

  useEffect(() => {
    if (!running) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    let last = 0;
    let temp = temperature;
    const animate = (ts: number) => {
      if (!last) last = ts;
      const dt = (ts - last) / 1000;
      last = ts;
      timeRef.current += dt;

      const rate = (heatPower / containerSize) * 0.5;
      if (temp < 100) {
        temp = Math.min(temp + rate * dt, 120);
      } else if (temp < 105) {
        temp += rate * dt * 0.2;
      } else {
        temp = Math.min(temp + rate * dt * 0.1, 120);
      }

      setTemperature(temp);
      setPhase(temp < 95 ? "liquid" : temp < 105 ? "boiling" : "steam");
      draw(canvas, temp, timeRef.current);

      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, heatPower, containerSize, draw]);

  const reset = () => {
    cancelAnimationFrame(animRef.current);
    setRunning(false);
    setTemperature(20);
    setPhase("liquid");
    timeRef.current = 0;
    const c = canvasRef.current;
    if (c) draw(c, 20, 0);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg">
        <canvas ref={canvasRef} className="w-full" style={{ height: "280px" }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Temperature</p>
          <p className="text-sm font-bold text-foreground">{Math.round(temperature)}°C</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Phase</p>
          <p className="text-sm font-bold text-foreground capitalize">{phase}</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Heat Power</p>
          <p className="text-sm font-bold text-foreground">{heatPower}W</p>
        </div>
      </div>
      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Heat Power</span><span className="font-medium text-foreground">{heatPower}W</span></div>
          <input type="range" min={10} max={100} value={heatPower} onChange={(e) => setHeatPower(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Container Size</span><span className="font-medium text-foreground">{containerSize}</span></div>
          <input type="range" min={20} max={80} value={containerSize} onChange={(e) => setContainerSize(+e.target.value)} disabled={running} className="w-full accent-primary" />
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} className={`flex-1 py-3 rounded-xl font-medium text-sm ${running ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}>
          {running ? "Stop" : "Heat"}
        </button>
        <button onClick={reset} className="flex-1 py-3 rounded-xl bg-muted text-muted-foreground font-medium text-sm">Reset</button>
        <button onClick={() => onComplete?.()} className="py-3 px-4 rounded-xl bg-success text-success-foreground font-medium text-sm">✓</button>
      </div>
    </div>
  );
}
