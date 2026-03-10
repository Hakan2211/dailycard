import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Share2, Sparkles, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";

const colorThemeMap: Record<string, { gradient: string; glow: string; cardBg: string }> = {
  emerald: {
    gradient: "from-emerald-500 to-emerald-700",
    glow: "shadow-emerald-500/25",
    cardBg: "from-emerald-600 to-emerald-900",
  },
  amber: {
    gradient: "from-amber-500 to-amber-700",
    glow: "shadow-amber-500/25",
    cardBg: "from-amber-600 to-amber-900",
  },
  violet: {
    gradient: "from-violet-500 to-violet-700",
    glow: "shadow-violet-500/25",
    cardBg: "from-violet-600 to-violet-900",
  },
};

const colorThemeBadgeMap: Record<string, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  amber: "bg-amber-100 text-amber-800",
  violet: "bg-violet-100 text-violet-800",
};

// ---- Types ----

interface CardData {
  _id: string;
  imageUrl: string;
  quote: string;
  author?: string;
  description: string;
  cardNumber: number;
}

interface DeckData {
  _id: string;
  title: string;
  colorTheme: string;
  description: string;
  totalCards: number;
}

// ---- Draw Mode Props ----
interface DrawModeProps {
  mode: "draw";
  deckId: string;
  deck: DeckData;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// ---- View Mode Props ----
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

type CardModalProps = DrawModeProps | ViewModeProps;

export function CardModal(props: CardModalProps) {
  if (props.mode === "draw") {
    return <DrawModeModal {...props} />;
  }
  return <ViewModeModal {...props} />;
}

// ==============================
// DRAW MODE
// ==============================

function DrawModeModal({ deckId, deck, open, onOpenChange }: DrawModeProps) {
  const drawCardMutation = useMutation(api.draw.drawCard);
  const todayCard = useQuery(
    api.draw.getTodayCard,
    open ? { deckId: deckId as Id<"decks"> } : "skip"
  );
  const progress = useQuery(
    api.decks.getDeckProgress,
    open ? { deckId: deckId as Id<"decks"> } : "skip"
  );

  const [isFlipped, setIsFlipped] = useState(false);
  const [drawnCard, setDrawnCard] = useState<CardData | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);

  const theme = colorThemeMap[deck.colorTheme] ?? colorThemeMap.violet;

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      const timer = setTimeout(() => {
        setIsFlipped(false);
        setDrawnCard(null);
        setIsDrawing(false);
        setShowCompletion(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [open]);

  // If user already drew today, show that card immediately
  useEffect(() => {
    if (open && todayCard) {
      setDrawnCard(todayCard as CardData);
      setIsFlipped(true);
    }
  }, [todayCard, open]);

  const handleDraw = useCallback(async () => {
    if (isDrawing) return;
    setIsDrawing(true);

    try {
      const result = await drawCardMutation({
        deckId: deckId as Id<"decks">,
      });

      if (result.completed && !result.card) {
        setShowCompletion(true);
        return;
      }

      if (result.card) {
        setDrawnCard(result.card as CardData);
        setTimeout(() => {
          setIsFlipped(true);
        }, 300);

        if (result.completed) {
          setTimeout(() => setShowCompletion(true), 2000);
        }
      }
    } catch (err) {
      console.error("Draw failed:", err);
    } finally {
      setIsDrawing(false);
    }
  }, [isDrawing, drawCardMutation, deckId]);

  const handleShare = useCallback(async () => {
    if (!drawnCard || !deck) return;

    const shareData = {
      title: `${deck.title} - DailyCard`,
      text: `"${drawnCard.quote}" - ${drawnCard.author ?? "Unknown"}\n\n${drawnCard.description}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        alert("Copied to clipboard!");
      }
    } catch {
      // User cancelled share
    }
  }, [drawnCard, deck]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">{deck.title}</DialogTitle>

        {showCompletion ? (
          <CompletionContent
            deckTitle={deck.title}
            theme={theme}
            onClose={() => onOpenChange(false)}
          />
        ) : (
          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 pb-2">
              <div className="min-w-0">
                <h3 className="font-semibold text-lg truncate">{deck.title}</h3>
                <p className="text-xs text-muted-foreground truncate">
                  {deck.description}
                </p>
              </div>
              {progress && (
                <Badge variant="outline" className="text-xs shrink-0 ml-2">
                  {progress.drawn} / {progress.total}
                </Badge>
              )}
            </div>

            {/* Card Area */}
            <div className="flex justify-center py-6 px-4">
              <div className="relative" style={{ perspective: "1200px" }}>
                {/* Shadow cards */}
                <AnimatePresence>
                  {!isFlipped && (
                    <>
                      {[2, 1].map((i) => (
                        <motion.div
                          key={`shadow-${i}`}
                          className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.cardBg} shadow-xl`}
                          initial={{ rotate: 0, x: 0, y: 0 }}
                          animate={{
                            rotate: i * 3 - 3,
                            x: i * 4 - 4,
                            y: i * -2,
                          }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.5, delay: i * 0.1 }}
                          style={{ width: 280, height: 380 }}
                        />
                      ))}
                    </>
                  )}
                </AnimatePresence>

                {/* Main Card */}
                <motion.div
                  className="relative cursor-pointer"
                  style={{
                    width: 280,
                    height: 380,
                    transformStyle: "preserve-3d",
                  }}
                  animate={{
                    rotateY: isFlipped ? 180 : 0,
                  }}
                  transition={{
                    duration: 0.8,
                    type: "spring",
                    stiffness: 60,
                    damping: 15,
                  }}
                  onClick={() => {
                    if (!isFlipped && !isDrawing && !todayCard) {
                      handleDraw();
                    }
                  }}
                  whileHover={!isFlipped && !todayCard ? { scale: 1.03 } : {}}
                  whileTap={!isFlipped && !todayCard ? { scale: 0.97 } : {}}
                >
                  {/* Card Front (back design) */}
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${theme.cardBg} shadow-2xl ${theme.glow} backface-hidden flex flex-col items-center justify-center gap-6 p-8`}
                    style={{ backfaceVisibility: "hidden" }}
                  >
                    <motion.div
                      animate={{ rotate: [0, 5, -5, 0] }}
                      transition={{ repeat: Infinity, duration: 3 }}
                    >
                      <Sparkles className="h-16 w-16 text-white/80" />
                    </motion.div>
                    <div className="text-center space-y-2">
                      <p className="text-xl font-bold text-white">{deck.title}</p>
                      <p className="text-sm text-white/60">
                        Tap to draw your card
                      </p>
                    </div>
                    <div className="absolute inset-4 rounded-xl border-2 border-white/10" />
                    <div className="absolute inset-8 rounded-lg border border-white/5" />
                  </div>

                  {/* Card Back (revealed content) */}
                  <div
                    className="absolute inset-0 rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
                    style={{
                      backfaceVisibility: "hidden",
                      transform: "rotateY(180deg)",
                    }}
                  >
                    {drawnCard && (
                      <SharedCardContent card={drawnCard} onShare={handleShare} />
                    )}
                  </div>
                </motion.div>
              </div>
            </div>

            {/* Bottom message */}
            {isFlipped && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center px-4 pb-4"
              >
                <p className="text-sm text-muted-foreground">
                  Come back tomorrow to draw your next card from this deck.
                </p>
              </motion.div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
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

  const handleShare = async () => {
    const shareData = {
      title: `${deck.title} - DailyCard`,
      text: `"${card.quote}" - ${card.author ?? "Unknown"}\n\n${card.description}`,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.text);
        alert("Copied to clipboard!");
      }
    } catch {
      // User cancelled
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden gap-0">
        <DialogTitle className="sr-only">
          {deck.title} - Card {currentIndex + 1}
        </DialogTitle>

        <div className="flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-2">
            <Badge
              className={`text-xs ${colorThemeBadgeMap[deck.colorTheme] ?? "bg-violet-100 text-violet-800"}`}
            >
              {deck.title}
            </Badge>
            {cards.length > 1 && (
              <span className="text-xs text-muted-foreground">
                {currentIndex + 1} / {cards.length}
              </span>
            )}
          </div>

          {/* Card display */}
          <div className="flex justify-center py-4 px-4">
            <div className="w-[280px] h-[380px] rounded-2xl bg-white shadow-xl border overflow-hidden flex flex-col">
              <AnimatePresence mode="wait">
                <motion.div
                  key={card._id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col h-full"
                >
                  <SharedCardContent card={card} onShare={handleShare} />
                </motion.div>
              </AnimatePresence>
            </div>
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
                      i === currentIndex ? "bg-violet-600" : "bg-slate-200"
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

// ==============================
// SHARED COMPONENTS
// ==============================

function SharedCardContent({
  card,
  onShare,
}: {
  card: CardData;
  onShare: () => void;
}) {
  return (
    <>
      {/* Card Image */}
      <div className="relative h-40 overflow-hidden shrink-0">
        <img
          src={card.imageUrl}
          alt="Card illustration"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
      </div>

      {/* Card Text Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <blockquote className="text-sm font-medium italic leading-relaxed text-slate-800">
            &ldquo;{card.quote}&rdquo;
          </blockquote>
          {card.author && (
            <p className="text-xs font-semibold text-slate-500">
              &mdash; {card.author}
            </p>
          )}
          <p className="text-xs leading-relaxed text-slate-600 line-clamp-4">
            {card.description}
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          className="mt-3 w-full gap-2"
          onClick={(e) => {
            e.stopPropagation();
            onShare();
          }}
        >
          <Share2 className="h-3 w-3" />
          Share this card
        </Button>
      </div>
    </>
  );
}

function CompletionContent({
  deckTitle,
  theme,
  onClose,
}: {
  deckTitle: string;
  theme: { gradient: string };
  onClose: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center text-center space-y-6 p-8 py-12 relative overflow-hidden">
      {/* Trophy Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 10,
          delay: 0.2,
        }}
      >
        <div
          className={`flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient} shadow-2xl`}
        >
          <Trophy className="h-12 w-12 text-white" />
        </div>
      </motion.div>

      {/* Confetti particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            backgroundColor: [
              "#8b5cf6",
              "#f59e0b",
              "#10b981",
              "#ec4899",
              "#3b82f6",
            ][i % 5],
            top: "40%",
            left: "50%",
          }}
          initial={{ x: 0, y: 0, opacity: 1, scale: 0 }}
          animate={{
            x: Math.cos((i / 20) * Math.PI * 2) * (100 + Math.random() * 60),
            y: Math.sin((i / 20) * Math.PI * 2) * (100 + Math.random() * 60),
            opacity: 0,
            scale: [0, 1.5, 0],
          }}
          transition={{
            duration: 1.5,
            delay: 0.5 + i * 0.05,
            ease: "easeOut",
          }}
        />
      ))}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="space-y-3"
      >
        <h2 className="text-2xl font-bold">Congratulations!</h2>
        <p className="text-sm text-muted-foreground">
          You have completed the <strong>{deckTitle}</strong> deck!
        </p>
        <p className="text-xs text-muted-foreground max-w-xs mx-auto">
          Every card drawn was a step in your journey. This deck is now a trophy
          in your collection.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Button onClick={onClose} size="lg">
          Back to Dashboard
        </Button>
      </motion.div>
    </div>
  );
}
