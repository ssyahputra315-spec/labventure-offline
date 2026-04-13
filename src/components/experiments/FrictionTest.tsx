import { useState } from "react";

interface Props { onComplete?: () => void; }

export function FrictionTest({ onComplete }: Props) {
  const [staticCoeff, setStaticCoeff] = useState(0.5);
  const [kineticCoeff, setKineticCoeff] = useState(0.3);
  const [mass, setMass] = useState(10);
  const [appliedForce, setAppliedForce] = useState(0);

  const g = 9.81;
  const normalForce = mass * g;
  const staticFriction = staticCoeff * normalForce;
  const kineticFriction = kineticCoeff * normalForce;
  const isMoving = appliedForce > staticFriction;
  const netForce = isMoving ? appliedForce - kineticFriction : 0;
  const acceleration = netForce / mass;

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl overflow-hidden border bg-canvas-bg p-6">
        <div className="relative h-40 flex items-end justify-center">
          {/* Surface */}
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-muted-foreground/30 rounded" />
          
          {/* Block */}
          <div className={`relative w-20 h-16 rounded-lg flex items-center justify-center transition-all duration-300 ${isMoving ? "translate-x-8" : ""}`} style={{ backgroundColor: "var(--primary)" }}>
            <span className="text-primary-foreground text-xs font-bold">{mass}kg</span>
            {/* Force arrow */}
            {appliedForce > 0 && (
              <div className="absolute -left-12 top-1/2 -translate-y-1/2 flex items-center">
                <div className="h-0.5 bg-destructive" style={{ width: `${Math.min(appliedForce / 5, 40)}px` }} />
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-destructive" />
              </div>
            )}
            {/* Friction arrow */}
            {appliedForce > 0 && (
              <div className="absolute -right-10 top-1/2 -translate-y-1/2 flex items-center">
                <div className="w-0 h-0 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent border-r-[6px] border-r-warning" />
                <div className="h-0.5 bg-warning" style={{ width: `${Math.min((isMoving ? kineticFriction : Math.min(appliedForce, staticFriction)) / 5, 30)}px` }} />
              </div>
            )}
          </div>
          {isMoving && <p className="absolute bottom-6 right-4 text-xs text-primary font-medium animate-pulse-soft">Moving →</p>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Static f</p>
          <p className="text-sm font-bold text-foreground">{staticFriction.toFixed(1)}N</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Kinetic f</p>
          <p className="text-sm font-bold text-foreground">{kineticFriction.toFixed(1)}N</p>
        </div>
        <div className="p-3 rounded-xl bg-card border text-center">
          <p className="text-[10px] text-muted-foreground">Accel</p>
          <p className="text-sm font-bold text-foreground">{acceleration.toFixed(2)} m/s²</p>
        </div>
      </div>

      <div className="space-y-3 p-4 rounded-2xl bg-card border">
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Applied Force</span><span className="font-medium text-foreground">{appliedForce.toFixed(0)}N</span></div>
          <input type="range" min={0} max={150} value={appliedForce} onChange={(e) => setAppliedForce(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Static μs</span><span className="font-medium text-foreground">{staticCoeff.toFixed(2)}</span></div>
          <input type="range" min={0.1} max={1} step={0.05} value={staticCoeff} onChange={(e) => { setStaticCoeff(+e.target.value); if (+e.target.value < kineticCoeff) setKineticCoeff(+e.target.value * 0.6); }} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Kinetic μk</span><span className="font-medium text-foreground">{kineticCoeff.toFixed(2)}</span></div>
          <input type="range" min={0.05} max={staticCoeff} step={0.05} value={kineticCoeff} onChange={(e) => setKineticCoeff(+e.target.value)} className="w-full accent-primary" />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1"><span className="text-muted-foreground">Mass</span><span className="font-medium text-foreground">{mass}kg</span></div>
          <input type="range" min={1} max={50} value={mass} onChange={(e) => setMass(+e.target.value)} className="w-full accent-primary" />
        </div>
      </div>

      <button onClick={() => onComplete?.()} className="w-full py-3 rounded-xl bg-success text-success-foreground font-medium text-sm">Complete ✓</button>
    </div>
  );
}
