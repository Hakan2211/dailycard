import { Reveal, SectionEyebrow } from "./primitives";
import { EDITIONS, OFFER } from "./content";

export function LanguageSection() {
  return (
    <section className="mx-auto w-full max-w-4xl px-4 py-20 sm:py-28">
      <Reveal className="text-center">
        <SectionEyebrow>Choose your language</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Now in English &amp; German
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-white/60">
          Every card written natively in your language. Pick the English or
          German edition — same {OFFER.cardCount} cards, same lifetime price.
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
          {EDITIONS.map((e) => (
            <div
              key={e.name}
              className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 backdrop-blur-md"
            >
              <span className="text-3xl" aria-hidden>
                {e.flag}
              </span>
              <div>
                <p className="text-lg font-semibold">{e.name}</p>
                <p className="text-sm text-white/50">{e.note}</p>
              </div>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
