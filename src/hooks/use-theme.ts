import { useCallback, useEffect, useState } from "react";

export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "dailycard-theme";

/**
 * Blocking script injected into <head> so the correct theme is applied before
 * first paint (no flash of the wrong theme on SSR hydration). Dark is the
 * guaranteed default: the `.light` class is only added when the stored value is
 * explicitly "light". Anything else (empty, invalid, or a legacy "system"
 * value) resolves to dark. Keep the storage key in sync with THEME_STORAGE_KEY.
 */
export const THEME_INIT_SCRIPT = `(function(){try{var t=localStorage.getItem('${THEME_STORAGE_KEY}');document.documentElement.classList.toggle('light',t==='light');}catch(e){}})();`;

function applyTheme(theme: Theme) {
  if (typeof document === "undefined") return;
  // Dark is the default (no class); the light palette is opt-in via `.light`.
  document.documentElement.classList.toggle("light", theme === "light");
}

function getStoredTheme(): Theme {
  // Dark is the locked default — only an explicit "light" preference opts out.
  // A legacy "system" value is migrated to dark on read.
  if (typeof localStorage === "undefined") return "dark";
  return localStorage.getItem(THEME_STORAGE_KEY) === "light" ? "light" : "dark";
}

/**
 * Theme state backed by localStorage and the `.light` class on <html>. The
 * initial value is "dark" (the app's locked default); the stored preference is
 * read after mount (the head script has already applied the right class, so
 * there's no visible flash).
 */
export function useTheme() {
  const [theme, setThemeState] = useState<Theme>("dark");

  // Read the persisted preference once we're on the client.
  useEffect(() => {
    setThemeState(getStoredTheme());
  }, []);

  // Reflect the current preference onto the document.
  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      /* storage unavailable — fall back to in-memory only */
    }
    setThemeState(next);
  }, []);

  return { theme, setTheme };
}
