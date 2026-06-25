import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { FeatureCard } from "@/components/stage/FeatureCard";
import { getCardTheme } from "@/lib/cardTheme";
import type { MixedCard } from "./types";

/**
 * Render a hand the same way the Daily 3 spread does: a vertical stack of large
 * `FeatureCard`s, each preceded by its own deck badge, with a staggered spring
 * entrance. Used for the Pass & Play results, the per-player reveal, and the
 * Live Room hand dialog so every place that shows a hand looks consistent.
 */
export function HandStack({ cards }: { cards: MixedCard[] }) {
  if (cards.length === 0) return null;
  return (
    <div className="flex w-full flex-col items-center gap-12">
      <AnimatePresence>
        {cards.map((card, i) => (
          <motion.div
            key={card._id}
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: i * 0.1,
              type: "spring",
              stiffness: 110,
              damping: 16,
            }}
            className="flex w-full flex-col items-center gap-3"
          >
            <Badge className={getCardTheme(card.colorTheme).badge}>
              {card.deckTitle}
            </Badge>
            <FeatureCard
              card={card}
              deckTitle={card.deckTitle}
              colorTheme={card.colorTheme}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
