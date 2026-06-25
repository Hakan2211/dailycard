import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCardTheme, getCardBackHex } from "@/lib/cardTheme";
import { useCarousel } from "@/components/stage/useCarousel";

export type CoverflowDeck = {
  _id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  totalCards: number;
  colorTheme: string;
};

/**
 * Horizontal 3D coverflow of deck covers. The centered deck is large and
 * face-on; neighbors angle back into the distance. Click the centered deck to
 * open it; click a side deck (or use the arrows / ← → keys) to bring it to the
 * front. The full cover is shown uncropped (`object-contain`) on a deck-tinted
 * matte. Reuses `useCarousel` for index + keyboard nav.
 */
export function DeckCoverflow({
  decks,
  onSelect,
}: {
  decks: CoverflowDeck[];
  onSelect: (deck: CoverflowDeck) => void;
}) {
  const { index, go, goTo } = useCarousel(decks.length);
  const reduceMotion = useReducedMotion();
  const active = decks[index];

  return (
    <div className="flex w-full flex-col items-center gap-8">
      <div
        className="relative h-[540px] w-full sm:h-[640px]"
        style={{ perspective: 1600 }}
        role="group"
        aria-roledescription="carousel"
      >
        {decks.map((deck, i) => {
          const o = i - index;
          const abs = Math.abs(o);
          // Only render a window of nearby cards for performance/legibility.
          if (abs > 2) return null;

          const target = reduceMotion
            ? { x: `${o * 100}%`, rotateY: 0, z: 0, scale: 1, opacity: o === 0 ? 1 : 0 }
            : {
                x: o * 320,
                rotateY: -o * 35,
                z: -abs * 200,
                scale: Math.max(0.7, 1 - abs * 0.17),
                opacity: abs > 1 ? 0.5 : 1,
              };

          return (
            <motion.div
              key={deck._id}
              className="absolute inset-0 flex items-center justify-center"
              style={{ transformStyle: "preserve-3d", zIndex: 100 - abs }}
              animate={target}
              transition={{ type: "spring", stiffness: 120, damping: 22 }}
            >
              <DeckCard
                deck={deck}
                active={o === 0}
                onClick={() => (o === 0 ? onSelect(deck) : goTo(i))}
              />
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="glass"
          size="icon"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous deck"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[64px] text-center text-sm text-white/60">
          {index + 1} / {decks.length}
        </span>
        <Button
          variant="glass"
          size="icon"
          onClick={() => go(1)}
          disabled={index === decks.length - 1}
          aria-label="Next deck"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Centered deck meta */}
      {active && (
        <div className="max-w-md text-center">
          <p className="text-sm text-white/55">{active.description}</p>
        </div>
      )}
    </div>
  );
}

function DeckCard({
  deck,
  active,
  onClick,
}: {
  deck: CoverflowDeck;
  active: boolean;
  onClick: () => void;
}) {
  const glow = getCardBackHex(deck.colorTheme);
  return (
    <button
      type="button"
      onClick={onClick}
      className="group relative w-[88%] max-w-[420px] cursor-pointer text-left focus:outline-none"
      aria-label={active ? `Open ${deck.title}` : `Show ${deck.title}`}
    >
      {/* Deck-tinted glow behind the card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-5 rounded-[2.5rem] opacity-50 blur-3xl"
        style={{
          background: `radial-gradient(closest-side, ${glow.from}, transparent)`,
        }}
      />
      <div
        className={`relative overflow-hidden rounded-3xl border bg-white/[0.04] shadow-2xl ring-1 backdrop-blur-xl transition-colors ${
          active
            ? "border-white/20 ring-white/15"
            : "border-white/10 ring-white/10"
        }`}
      >
        {/* Full cover, never cropped. */}
        <div className="relative flex aspect-[3/4] items-center justify-center bg-black/40 p-3">
          <img
            src={deck.coverImageUrl}
            alt={deck.title}
            draggable={false}
            className="max-h-full max-w-full rounded-xl object-contain shadow-lg"
          />
        </div>
        <div className="flex items-center justify-between gap-2 p-4">
          <h3 className="truncate text-xl font-bold tracking-tight text-white">
            {deck.title}
          </h3>
          <Badge className={getCardTheme(deck.colorTheme).badge}>
            <Layers className="mr-1 h-3 w-3" />
            {deck.totalCards}
          </Badge>
        </div>
        {active && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent px-4 pb-3 pt-8 text-center text-xs font-medium text-white/70">
            Tap to open
          </div>
        )}
      </div>
    </button>
  );
}
