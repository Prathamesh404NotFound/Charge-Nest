import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme, type ThemeMode } from "@/lib/theme";
import { cn } from "@/lib/utils";

/**
 * Manual dark-mode toggle with three states: light / dark / system.
 * Compact for the navbar; a matching variant is included in the mobile drawer.
 */
export default function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, setTheme, isDark } = useTheme();

  const cycle = () => {
    const order: ThemeMode[] = ["system", "light", "dark"];
    const idx = order.indexOf(theme);
    setTheme(order[(idx + 1) % order.length]);
  };

  const Icon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${theme} (click to change)`}
      title={`Theme: ${theme} — click to cycle system → light → dark`}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl border border-border bg-card/70 text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        compact ? "w-8 h-8" : "w-9 h-9"
      )}
      data-testid="theme-toggle"
    >
      <Icon className={cn("w-4 h-4", compact ? "w-3.5 h-3.5" : "w-4 h-4")} />
      <span
        className={cn(
          "absolute -bottom-0.5 right-0 h-2 w-2 rounded-full bg-ev-green transition-opacity",
          isDark ? "opacity-0" : "opacity-0"
        )}
        aria-hidden
      />
    </button>
  );
}
