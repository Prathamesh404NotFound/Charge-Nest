/* VoltSetu dark mode (Round 15).
 *
 * Theme handling:
 *  - Three modes: "light" | "dark" | "system"
 *  - Persisted to localStorage (voltsetu:theme), defaulting to "system"
 *  - "system" follows prefers-color-scheme live (media query listener)
 *  - Applies .dark class to <html> so the index.css dark tokens take effect
 *  - A tiny inline script in index.html (see <script> block) runs before
 *    React so the page is themed from the very first paint (FOUC-free)
 */
import { createContext, useCallback, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark" | "system";

const STORAGE_KEY = "voltsetu:theme";

function getSystemDark(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-color-scheme: dark)").matches
  );
}

export function effectiveDark(mode: ThemeMode): boolean {
  return mode === "dark" || (mode === "system" && getSystemDark());
}

function applyClass(): void {
  const mode = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || "system";
  document.documentElement.classList.toggle("dark", effectiveDark(mode));
}

/** Call once at app boot to sync the class with the stored mode. */
export function applyStoredTheme(): void {
  applyClass();
}

interface ThemeContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: "system",
  setTheme: () => undefined,
  isDark: false,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "system";
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    return stored === "light" || stored === "dark" || stored === "system" ? stored : "system";
  });
  const [isDark, setIsDark] = useState<boolean>(() => effectiveDark(theme));

  const setTheme = useCallback((mode: ThemeMode) => {
    localStorage.setItem(STORAGE_KEY, mode);
    setThemeState(mode);
    setIsDark(effectiveDark(mode));
    document.documentElement.classList.toggle("dark", effectiveDark(mode));
  }, []);

  // Follow live system preference changes when in "system" mode
  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMatch = () => setIsDark(effectiveDark("system"));
    mq.addEventListener("change", onMatch);
    return () => mq.removeEventListener("change", onMatch);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, isDark }}>{children}</ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);

// Round 19: imperative dark-mode check for styling helpers (no hook needed).
export function isDark(): boolean {
  return effectiveDark(
    (typeof localStorage !== "undefined" && (localStorage.getItem(STORAGE_KEY) as ThemeMode | null)) || "system"
  );
}
