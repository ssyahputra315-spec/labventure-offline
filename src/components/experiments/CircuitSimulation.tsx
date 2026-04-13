import { useRef, useEffect, useState, useCallback } from "react";

interface Props { onComplete?: () => void; }

export function CircuitSimulation({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const [voltageV, setVoltageV] = useState(9);
  const [resistance, setResistance] = useState(100);
  const [switchOn, setSwitchOn] = useState(false);
  const [running, setRunning] = useState(true);

  const current = switchOn ? voltageV / resistance : 0;
  const power = voltageV * current;
  const brightness = Math.min(current / 0.15, 1);

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
    const rx = w * 0.35;
    const ry = h * 0.32;

    // Circuit path
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(cx - rx, cy - ry, rx * 2, ry * 2, 12);
    ctx.stroke();

    // Battery (left center)
    const bx = cx - rx;
    const by = cy;
    ctx.fillStyle = "#f8faff";
    ctx.fillRect(bx - 14, by - 16, 28, 32);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "#374151";
    ctx.beginPath();
    ctx.moveTo(bx - 8, by - 10);
    ctx.lineTo(bx - 8, by + 10);
    ctx.moveTo(bx + 8, by - 6);
    ctx.lineTo(bx + 8, by + 6);
    ctx.stroke();
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(`${voltageV}V`, bx, by + 24);
    ctx.fillStyle = "#ef4444";
    ctx.fillText("+", bx - 8, by - 14);
    ctx.fillStyle = "#3b82f6";
    ctx.fillText("−", bx + 8, by - 14);

    // Resistor (top center)
    const rrx = cx;
    const rry = cy - ry;
    ctx.fillStyle = "#f8faff";
    ctx.fillRect(rrx - 20, rry - 10, 40, 20);
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(rrx - 20, rry);
    for (let i = 0; i < 6; i++) {
      ctx.lineTo(rrx - 16 + i * 7, rry + (i % 2 === 0 ? -7 : 7));
    }
    ctx.lineTo(rrx + 20, rry);
    ctx.stroke();
    ctx.fillStyle = "#666";
    ctx.font = "10px sans-serif";
    ctx.fillText(`${resistance}Ω`, rrx, rry - 14);

    // Light bulb (right center)
    const lx = cx + rx;
    const ly = cy;
    ctx.fillStyle = "#f8faff";
    ctx.fillRect(lx - 14, ly - 14, 28, 28);
    if (switchOn && current > 0) {
      const glow = ctx.createRadialGradient(lx, ly, 2, lx, ly, 20);
      glow.addColorStop(0, `rgba(255, 200, 50, ${brightness})`);
      glow.addColorStop(1, "rgba(255, 200, 50, 0)");
      ctx.beginPath();
      ctx.arc(lx, ly, 20, 0, Math.PI * 2);
      ctx.fillStyle = glow;
      ctx.fill();
    }
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(lx, ly, 10, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(lx - 7, ly - 7);
    ctx.lineTo(lx + 7, ly + 7);
    ctx.moveTo(lx + 7, ly - 7);
    ctx.lineTo(lx - 7, ly + 7);
    ctx.stroke();

    // Switch (bottom center)
    const sx = cx;
    const sy = cy + ry;
    ctx.fillStyle = "#f8faff";
    ctx.fillRect(sx - 18, sy - 10, 36, 20);
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(sx - 12, sy, 3, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(sx + 12, sy, 3, 0, Math.PI * 2);
    ctx.stroke();
    if (switchOn) {
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy);
      ctx.lineTo(sx + 12, sy);
      ctx.stroke();
    } else {
      ctx.beginPath();
      ctx.moveTo(sx - 12, sy);
      ctx.lineTo(sx + 8, sy - 12);
      ctx.stroke();
    }

    // Current flow animation (moving dots)
    if (switchOn && current > 0) {
      ctx.fillStyle = "#3b82f6";
      const speed = current * 30;
      const perimeter = 2 * (rx * 2 + ry * 2);
      const numDots = 8;
      for (let i = 0; i < numDots; i++) {
        const offset = ((t * speed * 50 + (i / numDots) * perimeter) % perimeter);
        let dx: number, dy: number;
        const seg1 = rx * 2; // top
        const seg2 = seg1 + ry * 2; // right
        const seg3 = seg2 + rx * 2; // bottom
        if (offset < seg1) {
          dx = cx - rx + offset;
          dy = cy - ry;
        } else if (offset < seg2) {
          dx = cx + rx;
          dy = cy - ry + (offset - seg1);
        } else if (offset < seg3) {
          dx = cx + rx - (offset - seg2);
          dy = cy + ry;
        } else {
          dx = cx - rx;
          dy = cy + ry - (offset - seg3);
        }
        ctx.beginPath();
        ctx.arc(dx, dy, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }, [voltageV, resistance, switchOn, current, brightness]);

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

      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Voltage</p>
          <p className="text-sm font-bold text-foreground">{voltageV}V</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Current</p>
          <p className="text-sm font-bold text-foreground">{(current * 1000).toFixed(1)}mA</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Power</p>
          <p className="text-sm font-bold text-foreground">{(power * 1000).toFixed(1)}mW</p>
        </div>
      </div>

      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Voltage</span>
            <span className="font-medium text-foreground">{voltageV}V</span>
          </div>
          <input type="range" min={1} max={24} value={voltageV} onChange={(e) => setVoltageV(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Resistance</span>
            <span className="font-medium text-foreground">{resistance}Ω</span>
          </div>
          <input type="range" min={10} max={1000} step={10} value={resistance} onChange={(e) => setResistance(+e.target.value)} className="w-full accent-primary" />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => setSwitchOn(!switchOn)}
          className={`flex-1 py-3 rounded-xl font-medium text-sm ${switchOn ? "bg-destructive text-destructive-foreground" : "bg-primary text-primary-foreground"}`}
        >
          {switchOn ? "Open Switch" : "Close Switch"}
        </button>
        <button onClick={() => onComplete?.()} className="flex-1 py-3 rounded-xl bg-success text-success-foreground font-medium text-sm">
          Complete ✓
        </button>
      </div>
    </div>
  );
}
