import { useActiveLanguage } from "@/lib/language";
import type { Language } from "@/lib/pro";

const LABEL: Record<Language, string> = {
  en: "🇬🇧 English",
  de: "🇩🇪 Deutsch",
};

/**
 * Pill toggle for the active edition. Renders nothing unless the user owns both
 * editions (otherwise there's only one language to show). Backed by the shared
 * active-language store, so flipping it here also changes Daily / Calendar /
 * Group everywhere.
 */
export function LanguageToggle({ className = "" }: { className?: string }) {
  const { language, setLanguage, canSwitch } = useActiveLanguage();
  if (!canSwitch) return null;

  return (
    <div
      role="group"
      aria-label="Card language"
      className={`inline-flex rounded-full border border-white/15 bg-white/5 p-1 ${className}`}
    >
      {(["en", "de"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLanguage(l)}
          aria-pressed={language === l}
          className={`rounded-full px-3 py-1 text-sm font-medium transition ${
            language === l
              ? "bg-white text-[#0a0c10]"
              : "text-white/60 hover:text-white"
          }`}
        >
          {LABEL[l]}
        </button>
      ))}
    </div>
  );
}
