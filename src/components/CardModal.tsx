import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { getCardTheme } from "@/lib/cardTheme";
import { FeatureCard } from "@/components/stage/FeatureCard";

// ---- Types ----

interface CardData {
  _id: string;
  imageUrl: string;
  quote: string;
  author?: string;
  description: string;
  story?: string;
  caption?: string;
  cardNumber: number;
}

interface DeckData {
  _id: string;
  title: string;
  colorTheme: string;
  description: string;
  totalCards: number;
}

// ---- View Mode Props ----
// The modal is view-only: it shows previously-drawn cards (e.g. from the
// calendar). Drawing now happens on the Daily 3 stage and the per-deck draw
// has been removed.
interface ViewModeProps {
  mode: "view";
  cards: Array<{
    card: CardData;
    deck: DeckData;
  }>;
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CardModal(props: ViewModeProps) {
  return <ViewModeModal {...props} />;
}

// ==============================
// VIEW MODE (past cards)
// ==============================

function ViewModeModal({
  cards,
  initialIndex = 0,
  open,
  onOpenChange,
}: ViewModeProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when modal opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  if (cards.length === 0) return null;

  const currentItem = cards[currentIndex];
  const { card, deck } = currentItem;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl p-0 gap-0 max-h-[90dvh] overflow-y-auto border-white/10 bg-background/95 backdrop-blur-xl">
        <DialogTitle className="sr-only">
          {deck.title} - Card {currentIndex + 1}
        </DialogTitle>

        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-2">
            <Badge
              className={`text-xs ${getCardTheme(deck.colorTheme).badge}`}
            >
              {deck.title}
            </Badge>
            {cards.length > 1 && (
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {cards.length}
              </span>
            )}
          </div>

          {/* Card display — big side-by-side presentation. */}
          <div className="flex justify-center px-4 py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={card._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="w-full"
              >
                <FeatureCard
                  card={card}
                  deckTitle={deck.title}
                  colorTheme={deck.colorTheme}
                />
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation */}
          {cards.length > 1 && (
            <div className="flex items-center justify-center gap-4 pb-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                disabled={currentIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>

              {/* Dots */}
              <div className="flex gap-1.5">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      i === currentIndex ? "bg-white" : "bg-white/25"
                    }`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="icon"
                onClick={() =>
                  setCurrentIndex((i) => Math.min(cards.length - 1, i + 1))
                }
                disabled={currentIndex === cards.length - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
