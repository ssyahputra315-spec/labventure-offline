import { useRef, useEffect, useState, useCallback } from "react";

interface Props { onComplete?: () => void; }

export function OpticsSimulation({ onComplete }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [lensType, setLensType] = useState<"convex" | "concave">("convex");
  const [objectDist, setObjectDist] = useState(150);
  const [focalLength, setFocalLength] = useState(80);

  const imageDist = lensType === "convex"
    ? (objectDist * focalLength) / (objectDist - focalLength)
    : -(objectDist * focalLength) / (objectDist + focalLength);
  const magnification = -imageDist / objectDist;

  const draw = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const w = canvas.offsetWidth;
    const h = canvas.offsetHeight;
    ctx.clearRect(0, 0, w * 2, h * 2);

    ctx.fillStyle = "#f0f4ff";
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const scale = 1;

    // Optical axis
    ctx.strokeStyle = "#ccc";
    ctx.lineWidth = 1;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(0, cy);
    ctx.lineTo(w, cy);
    ctx.stroke();
    ctx.setLineDash([]);

    // Lens
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (lensType === "convex") {
      ctx.moveTo(cx, cy - 60);
      ctx.quadraticCurveTo(cx + 15, cy, cx, cy + 60);
      ctx.moveTo(cx, cy - 60);
      ctx.quadraticCurveTo(cx - 15, cy, cx, cy + 60);
    } else {
      ctx.moveTo(cx, cy - 60);
      ctx.quadraticCurveTo(cx - 12, cy, cx, cy + 60);
      ctx.moveTo(cx, cy - 60);
      ctx.quadraticCurveTo(cx + 12, cy, cx, cy + 60);
    }
    ctx.stroke();

    // Focal points
    ctx.fillStyle = "#ef4444";
    const f = focalLength * scale;
    ctx.beginPath(); ctx.arc(cx - f, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(cx + f, cy, 4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#999";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("F", cx - f, cy + 14);
    ctx.fillText("F", cx + f, cy + 14);

    // Object (arrow)
    const objX = cx - objectDist * scale;
    const objH = 40;
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(objX, cy);
    ctx.lineTo(objX, cy - objH);
    ctx.lineTo(objX - 6, cy - objH + 10);
    ctx.moveTo(objX, cy - objH);
    ctx.lineTo(objX + 6, cy - objH + 10);
    ctx.stroke();

    // Rays
    ctx.lineWidth = 1.5;

    // Ray 1: parallel to axis, through focal point
    ctx.strokeStyle = "rgba(239, 68, 68, 0.6)";
    ctx.beginPath();
    ctx.moveTo(objX, cy - objH);
    ctx.lineTo(cx, cy - objH);
    if (lensType === "convex") {
      ctx.lineTo(w, cy - objH + (objH / f) * (w - cx));
    } else {
      ctx.lineTo(w, cy - objH - (objH / f) * (w - cx));
    }
    ctx.stroke();

    // Ray 2: through center
    ctx.strokeStyle = "rgba(59, 130, 246, 0.6)";
    ctx.beginPath();
    ctx.moveTo(objX, cy - objH);
    ctx.lineTo(w, cy + objH * ((w - objX) / objectDist - 1));
    ctx.stroke();

    // Image arrow
    if (isFinite(imageDist) && Math.abs(imageDist) < 300) {
      const imgX = cx + imageDist * scale;
      const imgH = objH * Math.abs(magnification);
      const imgDir = magnification > 0 ? -1 : 1;
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 2;
      ctx.setLineDash([4, 3]);
      ctx.beginPath();
      ctx.moveTo(imgX, cy);
      ctx.lineTo(imgX, cy + imgDir * imgH);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, [lensType, objectDist, focalLength, imageDist, magnification]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = canvas.offsetWidth * 2;
    canvas.height = canvas.offsetHeight * 2;
    const ctx = canvas.getContext("2d");
    if (ctx) ctx.scale(2, 2);
    draw(canvas);
  }, [draw]);

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg">
        <canvas ref={canvasRef} className="w-full" style={{ height: "260px" }} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Image Dist</p>
          <p className="text-sm font-bold text-foreground">{isFinite(imageDist) ? imageDist.toFixed(0) : "∞"}</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Magnification</p>
          <p className="text-sm font-bold text-foreground">{isFinite(magnification) ? magnification.toFixed(2) : "∞"}×</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Image Type</p>
          <p className="text-sm font-bold text-foreground">{imageDist > 0 ? "Real" : "Virtual"}</p>
        </div>
      </div>
      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Lens Type</p>
          <div className="flex gap-2">
            {(["convex", "concave"] as const).map((t) => (
              <button key={t} onClick={() => setLensType(t)} className={`flex-1 py-2 rounded-xl text-xs font-medium ${lensType === t ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Object Distance</span><span className="font-medium text-foreground">{objectDist}px</span></div>
          <input type="range" min={40} max={250} value={objectDist} onChange={(e) => setObjectDist(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Focal Length</span><span className="font-medium text-foreground">{focalLength}px</span></div>
          <input type="range" min={30} max={150} value={focalLength} onChange={(e) => setFocalLength(+e.target.value)} className="w-full accent-primary" />
        </div>
      </div>
      <button onClick={() => onComplete?.()} className="w-full py-3 rounded-xl bg-success text-success-foreground font-medium text-sm">Complete ✓</button>
    </div>
  );
}
