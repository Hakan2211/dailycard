import { Reveal, SectionEyebrow } from "./primitives";
import { DECKS, OFFER } from "./content";

export function DeckShowcase() {
  return (
    <section
      id="decks"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:py-28"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>The library</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          {OFFER.cardCount} cards across {OFFER.deckCount} decks
        </h2>
        <p className="mt-4 text-white/60">
          From Stoic discipline to power animals — themed decks for every season
          of your life, each with 50 hand-written cards.
        </p>
      </Reveal>

      <Reveal className="mt-12">
        <div className="flex flex-wrap justify-center gap-2.5">
          {DECKS.map((d) => (
            <span
              key={d}
              className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-white/75 ring-1 ring-white/10 backdrop-blur-md transition hover:border-white/25 hover:text-white"
            >
              {d}
            </span>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
