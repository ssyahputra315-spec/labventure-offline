import { Link, useLocation } from "@tanstack/react-router";
import { Home, FlaskConical, BookOpen, Trophy, Settings } from "lucide-react";

const navItems = [
  { to: "/" as const, icon: Home, label: "Home" },
  { to: "/labs" as const, icon: FlaskConical, label: "Labs" },
  { to: "/notebook" as const, icon: BookOpen, label: "Notebook" },
  { to: "/progress" as const, icon: Trophy, label: "Progress" },
  { to: "/settings" as const, icon: Settings, label: "Settings" },
];

export function BottomNav() {
  const location = useLocation();
  const path = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel border-t safe-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === "/" ? path === "/" : path.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all duration-200 ${
                isActive
                  ? "text-primary scale-105"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? "animate-pop" : ""}`} />
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
