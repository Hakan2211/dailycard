import { motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight, Layers, Lock } from "lucide-react";
import { useEffect } from "react";
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
  locked?: boolean;
};

/**
 * Horizontal 3D coverflow of deck covers. The centered deck is large and
 * face-on; neighbors angle back into the distance. Click the centered deck to
 * open it; click a side deck, drag/swipe the stage, or use the arrows / ← →
 * keys to bring another deck to the front. The full cover is shown uncropped
 * (`object-contain`) on a deck-tinted matte. Reuses `useCarousel` for index +
 * keyboard nav.
 *
 * `initialIndex` seeds the centered deck and `onIndexChange` reports it back up,
 * so the parent can re-open the coverflow on the deck the user was last viewing
 * instead of snapping back to the first.
 */
export function DeckCoverflow({
  decks,
  onSelect,
  initialIndex = 0,
  onIndexChange,
}: {
  decks: CoverflowDeck[];
  onSelect: (deck: CoverflowDeck) => void;
  initialIndex?: number;
  onIndexChange?: (index: number) => void;
}) {
  const { index, go, goTo } = useCarousel(decks.length, initialIndex);
  const reduceMotion = useReducedMotion();
  const active = decks[index];

  // Report the centered deck up so the parent can restore it on return.
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* Static clip boundary: the angled side decks are translated up to
          ±640px, so without this they paint over the sidebar and push the page
          into horizontal scroll. Perspective lives here; the drag layer sits
          inside so swiping can't spill past the edges either. */}
      <div
        className="relative h-[540px] w-full overflow-hidden sm:h-[640px]"
        style={{ perspective: 1600 }}
        role="group"
        aria-roledescription="carousel"
      >
        <motion.div
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          style={{ transformStyle: "preserve-3d" }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            // Swipe/drag the stage to step decks; threshold guards stray taps.
            if (info.offset.x < -60 || info.velocity.x < -400) go(1);
            else if (info.offset.x > 60 || info.velocity.x > 400) go(-1);
          }}
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
        </motion.div>
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
            className={`max-h-full max-w-full rounded-xl object-contain shadow-lg transition ${
              deck.locked ? "opacity-45 saturate-50" : ""
            }`}
          />
          {/* Locked decks get a lock chip; the parent turns a tap into checkout. */}
          {deck.locked && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/55 text-white backdrop-blur-sm">
                <Lock className="h-5 w-5" />
              </span>
            </div>
          )}
          {/* "Tap to open" sits over the image so it never collides with the
              title row below, regardless of how long the deck name is. */}
          {active && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 rounded-b-xl bg-gradient-to-t from-black/60 to-transparent px-4 pb-3 pt-10 text-center text-xs font-medium text-white/80">
              {deck.locked ? "Tap to unlock" : "Tap to open"}
            </div>
          )}
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
      </div>
    </button>
  );
}
