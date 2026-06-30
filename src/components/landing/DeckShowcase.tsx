import { Reveal, SectionEyebrow } from "./primitives";
import { DECK_COVERS, OFFER, coverUrl } from "./content";
import { getCardTheme } from "@/lib/cardTheme";

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
          From Stoic discipline to power animals, themed decks for every season
          of your life, each with 50 hand-written cards.
        </p>
      </Reveal>

      <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-5">
        {DECK_COVERS.map((deck, i) => (
          <Reveal key={deck.slug} delay={(i % 5) * 0.05}>
            <div
              className={`group relative aspect-[3/4] overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] ring-1 ring-white/10 transition-all duration-300 hover:-translate-y-1.5 hover:ring-white/25 hover:shadow-2xl ${getCardTheme(deck.theme).glow}`}
            >
              <img
                src={coverUrl(deck.slug)}
                alt={deck.title}
                loading="lazy"
                draggable={false}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.05]"
              />
              {/* Title scrim keeps deck names readable over the art. */}
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent p-3 pt-8">
                <span className="text-sm font-medium leading-tight text-white drop-shadow">
                  {deck.title}
                </span>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
