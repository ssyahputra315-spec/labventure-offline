import { useRef, useEffect, useState, useCallback } from "react";

interface Props {
  onComplete?: () => void;
}

export function WaveSimulation({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const timeRef = useRef(0);

  const [frequency, setFrequency] = useState(2);
  const [amplitude, setAmplitude] = useState(50);
  const [speed, setSpeed] = useState(100);
  const [running, setRunning] = useState(true);

  const wavelength = speed / frequency;

  const draw = useCallback((canvas: HTMLCanvasElement, t: number) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w * 2, h * 2);
    ctx.save();

    // BG
    ctx.fillStyle = "#f0f4ff";
    ctx.fillRect(0, 0, w, h);

    // Center line
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, h / 2);
    ctx.lineTo(w, h / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Wave
    ctx.strokeStyle = "#7c3aed";
    ctx.lineWidth = 3;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = h / 2 + amplitude * Math.sin(2 * Math.PI * (x / wavelength - frequency * t));
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    // Second wave (faded)
    ctx.strokeStyle = "rgba(124, 58, 237, 0.2)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    for (let x = 0; x < w; x++) {
      const y = h / 2 + amplitude * 0.6 * Math.sin(2 * Math.PI * (x / wavelength - frequency * t) + Math.PI / 3);
      if (x === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    ctx.restore();
  }, [frequency, amplitude, wavelength]);

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

    let lastTime = 0;
    const animate = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const dt = (timestamp - lastTime) / 1000;
      lastTime = timestamp;
      timeRef.current += dt;
      draw(canvas, timeRef.current);
      animRef.current = requestAnimationFrame(animate);
    };
    animRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animRef.current);
  }, [running, draw]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg">
        <canvas ref={canvasRef} className="w-full" style={{ height: "240px" }} />
      </div>

      {/* Values */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Wavelength</p>
          <p className="text-sm font-bold text-foreground">{wavelength.toFixed(0)} px</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Frequency</p>
          <p className="text-sm font-bold text-foreground">{frequency.toFixed(1)} Hz</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Equation</p>
          <p className="text-[10px] font-mono text-foreground">y = {amplitude}sin(2πft)</p>
        </div>
      </div>

      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Frequency</span>
            <span className="font-medium text-foreground">{frequency.toFixed(1)} Hz</span>
          </div>
          <input type="range" min={0.5} max={5} step={0.1} value={frequency} onChange={(e) => setFrequency(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Amplitude</span>
            <span className="font-medium text-foreground">{amplitude} px</span>
          </div>
          <input type="range" min={10} max={100} value={amplitude} onChange={(e) => setAmplitude(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Wave Speed</span>
            <span className="font-medium text-foreground">{speed} px/s</span>
          </div>
          <input type="range" min={20} max={300} value={speed} onChange={(e) => setSpeed(+e.target.value)} className="w-full accent-primary" />
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => setRunning(!running)} className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm">
          {running ? "Pause" : "Play"}
        </button>
        <button onClick={() => { onComplete?.(); }} className="flex-1 py-3 rounded-xl bg-success text-success-foreground font-medium text-sm">
          Complete ✓
        </button>
      </div>
    </div>
  );
}
