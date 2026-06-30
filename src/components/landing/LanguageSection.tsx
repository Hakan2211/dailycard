import { Check } from "lucide-react";
import { Reveal, SectionEyebrow } from "./primitives";
import { EDITIONS } from "./content";
import { useEdition } from "./useEdition";

export function LanguageSection() {
  const { edition, setEdition } = useEdition();
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-20 sm:py-28">
      <Reveal className="text-center">
        <SectionEyebrow>Choose your edition</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          English or Deutsch
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          Every card is written natively in your language. The German edition is
          live now with 1,700 cards and English has 1,000, with more on the way
          for both. Same lifetime price either way, and your choice carries
          through to checkout.
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
          {EDITIONS.map((e) => {
            // The bundle includes both languages, so highlight both cards then.
            const selected = edition === e.code || edition === "both";
            return (
              <button
                key={e.code}
                type="button"
                onClick={() => setEdition(e.code)}
                aria-pressed={selected}
                className={`flex items-center gap-4 rounded-2xl border p-6 text-left ring-1 backdrop-blur-md transition ${
                  selected
                    ? "border-primary/60 bg-white/[0.08] ring-primary/40"
                    : "border-white/10 bg-white/[0.04] ring-white/10 hover:border-white/25 hover:bg-white/[0.06]"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {e.flag}
                </span>
                <div className="flex-1">
                  <p className="text-lg font-semibold">{e.name}</p>
                  <p className="text-sm text-white/50">{e.note}</p>
                </div>
                <span
                  className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition ${
                    selected
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-white/20 text-transparent"
                  }`}
                >
                  <Check className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </Reveal>
    </section>
  );
}
