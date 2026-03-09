import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Share2, Sparkles, RotateCcw, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useCallback, useEffect } from "react";

export const Route = createFileRoute("/deck/$deckId")({
  component: DeckDrawPage,
});

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

function DeckDrawPage() {
  const { deckId } = Route.useParams();
  const navigate = useNavigate();
  const user = useQuery(api.users.currentUser);
  const deck = useQuery(api.decks.getById, {
    deckId: deckId as Id<"decks">,
  });
  const todayCard = useQuery(api.draw.getTodayCard, {
    deckId: deckId as Id<"decks">,
  });
  const progress = useQuery(api.decks.getDeckProgress, {
    deckId: deckId as Id<"decks">,
  });
  const drawCardMutation = useMutation(api.draw.drawCard);

  const [isFlipped, setIsFlipped] = useState(false);
  const [drawnCard, setDrawnCard] = useState<any>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showCompletion, setShowCompletion] = useState(false);
  const [shuffleCards, setShuffleCards] = useState(true);

  // If user already drew today, show that card immediately
  useEffect(() => {
    if (todayCard) {
      setDrawnCard(todayCard);
      setIsFlipped(true);
      setShuffleCards(false);
    }
  }, [todayCard]);

  // Redirect if not authed
  useEffect(() => {
    if (user === null) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

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
        setDrawnCard(result.card);
        // Small delay for dramatic effect before flip
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
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(
          `${shareData.text}\n\n${shareData.url}`
        );
        alert("Copied to clipboard!");
      }
    } catch (err) {
      // User cancelled share
    }
  }, [drawnCard, deck]);

  if (!deck || user === undefined) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
        </div>
      </Layout>
    );
  }

  const theme = colorThemeMap[deck.colorTheme] ?? colorThemeMap.violet;

  // Completion Screen
  if (showCompletion) {
    return (
      <Layout>
        <CompletionScreen deckTitle={deck.title} theme={theme} />
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Back Button & Deck Info */}
        <div className="flex items-center justify-between">
          <Link to="/">
            <Button variant="ghost" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>

          {progress && (
            <Badge variant="outline" className="text-sm">
              {progress.drawn} / {progress.total} cards
            </Badge>
          )}
        </div>

        {/* Deck Title */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">{deck.title}</h1>
          <p className="text-muted-foreground">{deck.description}</p>
        </div>

        {/* Card Area */}
        <div className="flex justify-center py-8">
          <div className="relative" style={{ perspective: "1200px" }}>
            {/* Shuffle animation cards (background) */}
            <AnimatePresence>
              {shuffleCards && !isFlipped && (
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
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      style={{ width: 320, height: 440 }}
                    />
                  ))}
                </>
              )}
            </AnimatePresence>

            {/* Main Card */}
            <motion.div
              className="relative cursor-pointer"
              style={{
                width: 320,
                height: 440,
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
              {/* Card Front (Back of the card - what you see before flipping) */}
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
                  <p className="text-sm text-white/60">Tap to draw your card</p>
                </div>

                {/* Decorative pattern */}
                <div className="absolute inset-4 rounded-xl border-2 border-white/10" />
                <div className="absolute inset-8 rounded-lg border border-white/5" />
              </div>

              {/* Card Back (Front of the card - revealed after flip) */}
              <div
                className="absolute inset-0 rounded-2xl bg-white shadow-2xl overflow-hidden flex flex-col"
                style={{
                  backfaceVisibility: "hidden",
                  transform: "rotateY(180deg)",
                }}
              >
                {drawnCard && (
                  <>
                    {/* Card Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={drawnCard.imageUrl}
                        alt="Card illustration"
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
                    </div>

                    {/* Card Content */}
                    <div className="flex flex-1 flex-col justify-between p-5">
                      <div className="space-y-3">
                        <blockquote className="text-sm font-medium italic leading-relaxed text-slate-800">
                          &ldquo;{drawnCard.quote}&rdquo;
                        </blockquote>
                        {drawnCard.author && (
                          <p className="text-xs font-semibold text-slate-500">
                            &mdash; {drawnCard.author}
                          </p>
                        )}
                        <p className="text-xs leading-relaxed text-slate-600">
                          {drawnCard.description}
                        </p>
                      </div>

                      {/* Share Button */}
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-3 w-full gap-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare();
                        }}
                      >
                        <Share2 className="h-3 w-3" />
                        Share this card
                      </Button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Draw Again Hint (if already flipped) */}
        {isFlipped && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="text-center"
          >
            <p className="text-sm text-muted-foreground">
              Come back tomorrow to draw your next card from this deck.
            </p>
            <Link to="/" className="mt-4 inline-block">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Button>
            </Link>
          </motion.div>
        )}
      </div>
    </Layout>
  );
}

function CompletionScreen({
  deckTitle,
  theme,
}: {
  deckTitle: string;
  theme: { gradient: string };
}) {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center text-center space-y-8 px-4">
      {/* Trophy Animation */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 100, damping: 10, delay: 0.2 }}
      >
        <div className={`flex h-32 w-32 items-center justify-center rounded-full bg-gradient-to-br ${theme.gradient} shadow-2xl`}>
          <Trophy className="h-16 w-16 text-white" />
        </div>
      </motion.div>

      {/* Confetti-like particles */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute h-2 w-2 rounded-full"
          style={{
            backgroundColor: ["#8b5cf6", "#f59e0b", "#10b981", "#ec4899", "#3b82f6"][i % 5],
          }}
          initial={{
            x: 0,
            y: 0,
            opacity: 1,
            scale: 0,
          }}
          animate={{
            x: Math.cos((i / 20) * Math.PI * 2) * (150 + Math.random() * 100),
            y: Math.sin((i / 20) * Math.PI * 2) * (150 + Math.random() * 100) - 100,
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
        className="space-y-4"
      >
        <h1 className="text-3xl font-bold">Congratulations!</h1>
        <p className="text-lg text-muted-foreground">
          You have completed the <strong>{deckTitle}</strong> deck!
        </p>
        <p className="text-sm text-muted-foreground max-w-md">
          Every card drawn was a step in your journey. This deck is now a trophy
          in your collection, a testament to your dedication.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
      >
        <Link to="/">
          <Button size="lg" className="gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </motion.div>
    </div>
  );
}
