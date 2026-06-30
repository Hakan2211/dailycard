import { useCallback, useEffect, useSyncExternalStore } from "react";
import { useOwnedEditions, type Language } from "./pro";
import { EDITION_STORAGE_KEY } from "@/components/landing/useEdition";

export const LANGUAGE_STORAGE_KEY = "dailycard-language";

// Shared, app-wide "chosen language" so every consumer (Explore toggle, Daily,
// Calendar, Group, Settings) stays in sync and re-renders together. `chosen` is
// the explicit user choice; it stays null until read from storage after mount.
let chosen: Language | null = null;
const listeners = new Set<() => void>();
function emit() {
  for (const l of listeners) l();
}
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
function getSnapshot(): Language | null {
  return chosen;
}
function getServerSnapshot(): Language | null {
  return null; // SSR has no storage; derive a default below
}
function setChosen(next: Language) {
  chosen = next;
  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, next);
  } catch {
    /* storage unavailable */
  }
  emit();
}

function readStored(): Language | null {
  if (typeof localStorage === "undefined") return null;
  const v = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return v === "de" || v === "en" ? v : null;
}

/** The visitor's landing-page edition choice, coerced to a content language. */
function landingChoice(): Language {
  if (typeof localStorage === "undefined") return "en";
  // "both" or missing -> English preview.
  return localStorage.getItem(EDITION_STORAGE_KEY) === "de" ? "de" : "en";
}

/**
 * The edition the app is currently showing (decks, draws, Explore, Group).
 * Owning exactly one edition pins to it; owning both (or none) uses an explicit,
 * persisted choice that's shared across the whole app. SSR-safe.
 */
export function useActiveLanguage(): {
  language: Language;
  setLanguage: (next: Language) => void;
  canSwitch: boolean;
} {
  const owned = useOwnedEditions();
  const stored = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Seed the shared choice from storage once, after mount.
  useEffect(() => {
    if (chosen === null) {
      chosen = readStored() ?? landingChoice();
      emit();
    }
  }, []);

  // Own exactly one edition -> always that edition.
  // Own both (or none) -> honor the explicit/landing choice, default English.
  let language: Language;
  if (owned.length === 1) {
    language = owned[0];
  } else if (stored && (owned.length === 0 || owned.includes(stored))) {
    language = stored;
  } else {
    language = "en";
  }

  const setLanguage = useCallback((next: Language) => setChosen(next), []);

  return { language, setLanguage, canSwitch: owned.length > 1 };
}
