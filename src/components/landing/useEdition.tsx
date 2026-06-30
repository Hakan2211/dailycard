import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import type { EditionCode } from "./content";

export const EDITION_STORAGE_KEY = "dailycard-edition";

type EditionContextValue = {
  edition: EditionCode;
  setEdition: (next: EditionCode) => void;
};

const EditionContext = createContext<EditionContextValue | null>(null);

function getStoredEdition(): EditionCode {
  // English is the default; "de" or the "both" bundle are explicit opt-ins.
  if (typeof localStorage === "undefined") return "en";
  const stored = localStorage.getItem(EDITION_STORAGE_KEY);
  return stored === "de" || stored === "both" ? stored : "en";
}

/**
 * Holds the visitor's chosen edition (English / Deutsch) so the language
 * selector and the pricing CTA stay in sync, and persists it to localStorage so
 * the next step (Stripe checkout) can read which edition was chosen. SSR-safe:
 * starts at "en" and reads the stored choice after mount.
 */
export function EditionProvider({ children }: { children: ReactNode }) {
  const [edition, setEditionState] = useState<EditionCode>("en");

  useEffect(() => {
    const stored = getStoredEdition();
    setEditionState(stored);
    // Persist the default on first visit so checkout always finds an explicit
    // edition, even if the visitor never touches the selector.
    try {
      if (!localStorage.getItem(EDITION_STORAGE_KEY)) {
        localStorage.setItem(EDITION_STORAGE_KEY, stored);
      }
    } catch {
      /* storage unavailable */
    }
  }, []);

  const setEdition = useCallback((next: EditionCode) => {
    try {
      localStorage.setItem(EDITION_STORAGE_KEY, next);
    } catch {
      /* storage unavailable, fall back to in-memory only */
    }
    setEditionState(next);
  }, []);

  const value = useMemo(() => ({ edition, setEdition }), [edition, setEdition]);

  return (
    <EditionContext.Provider value={value}>{children}</EditionContext.Provider>
  );
}

export function useEdition(): EditionContextValue {
  const ctx = useContext(EditionContext);
  if (!ctx) {
    throw new Error("useEdition must be used within an EditionProvider");
  }
  return ctx;
}
