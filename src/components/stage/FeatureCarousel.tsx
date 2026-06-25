import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FeatureCard } from "./FeatureCard";
import { useCarousel } from "./useCarousel";
import type { CardFaceData } from "@/components/CardFace";

/**
 * Browse a deck one large featured card at a time, with prev/next + an
 * "n / total" counter. Replaces the old 3D coverflow: bigger, uncropped art and
 * readable, separated text beats the carousel spin. Arrow keys work via
 * `useCarousel`.
 */
export function FeatureCarousel({
  cards,
  deckTitle,
  colorTheme,
}: {
  cards: CardFaceData[];
  deckTitle: string;
  colorTheme?: string;
}) {
  const { index, dir, go } = useCarousel(cards.length);
  const card = cards[index];

  return (
    <div
      className="flex w-full flex-col items-center gap-8"
      role="group"
      aria-roledescription="carousel"
    >
      <div className="relative flex w-full justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={card._id}
            initial={{ opacity: 0, x: dir >= 0 ? 48 : -48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: dir >= 0 ? -48 : 48 }}
            transition={{ duration: 0.28, ease: [0.22, 0.61, 0.36, 1] }}
            className="flex w-full justify-center"
          >
            <FeatureCard
              card={card}
              deckTitle={deckTitle}
              colorTheme={colorTheme}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4">
        <Button
          variant="glass"
          size="icon"
          onClick={() => go(-1)}
          disabled={index === 0}
          aria-label="Previous card"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[64px] text-center text-sm text-white/60">
          {index + 1} / {cards.length}
        </span>
        <Button
          variant="glass"
          size="icon"
          onClick={() => go(1)}
          disabled={index === cards.length - 1}
          aria-label="Next card"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="sr-only" aria-live="polite">
        Card {index + 1} of {cards.length}
      </div>
    </div>
  );
}
