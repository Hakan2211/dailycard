import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { StageLayout } from "@/components/StageLayout";
import { FeatureCard } from "@/components/stage/FeatureCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCardTheme } from "@/lib/cardTheme";
import { Dices, Sparkles } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";

export const Route = createFileRoute("/daily")({
  component: DailyPage,
});

function DailyPage() {
  const todayDraws = useQuery(api.calendar.getTodayDraws);
  const drawThree = useMutation(api.draw.drawDailyThree);

  const [drawing, setDrawing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const cards = (todayDraws ?? []).filter((d) => d.card && d.deck);
  const hasDrawn = cards.length > 0;

  async function handleDraw() {
    if (drawing) return;
    setDrawing(true);
    setMessage(null);
    try {
      const res = await drawThree({});
      if (res.draws.length === 0) {
        setMessage(
          "You've already drawn from every available deck today — come back tomorrow for a fresh spread."
        );
      } else if (res.draws.length < 3) {
        setMessage(
          `Only ${res.draws.length} deck${res.draws.length === 1 ? "" : "s"} had cards left today — here ${
            res.draws.length === 1 ? "it is" : "they are"
          }.`
        );
      }
    } catch (err) {
      console.error("Daily 3 draw failed", err);
      setMessage("Something went wrong drawing your cards. Please try again.");
    } finally {
      setDrawing(false);
    }
  }

  return (
    <StageLayout>
      {/* Top-aligned so a tall spread is never clipped above the scroll area;
          the empty state centers itself via `my-auto`. */}
      <div className="mx-auto flex min-h-full w-full max-w-4xl flex-col items-center gap-10 px-4 py-16">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your Daily 3
          </h1>
          <p className="mx-auto max-w-md text-sm text-white/55">
            One card from each of three different decks — your reflection for
            today. These count toward your collection and appear on your
            calendar.
          </p>
        </header>

        {todayDraws === undefined ? (
          <div className="flex w-full flex-col items-center gap-12">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-72 w-full max-w-4xl animate-pulse rounded-3xl border border-white/10 bg-white/5"
              />
            ))}
          </div>
        ) : hasDrawn ? (
          <>
            <div className="flex w-full flex-col items-center gap-12">
              <AnimatePresence>
                {cards.map((d, i) => (
                  <motion.div
                    key={d._id}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: i * 0.12,
                      type: "spring",
                      stiffness: 110,
                      damping: 16,
                    }}
                    className="flex w-full flex-col items-center gap-3"
                  >
                    <Badge className={getCardTheme(d.deck!.colorTheme).badge}>
                      {d.deck!.title}
                    </Badge>
                    <FeatureCard
                      card={d.card!}
                      deckTitle={d.deck!.title}
                      colorTheme={d.deck!.colorTheme}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {message && (
              <p className="text-center text-sm text-white/55">{message}</p>
            )}

            <p className="text-xs text-white/40">
              That's your spread for today — come back tomorrow for a fresh three.
            </p>
          </>
        ) : (
          <div className="my-auto flex flex-col items-center justify-center gap-6 rounded-3xl border border-dashed border-white/15 bg-white/[0.03] px-8 py-16 text-center backdrop-blur-sm">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border border-white/15 bg-white/10 text-white shadow-lg shadow-black/30 backdrop-blur-sm">
              <Sparkles className="h-9 w-9" />
            </div>
            <div className="space-y-1">
              <h2 className="text-lg font-semibold text-white">
                Ready for today's spread?
              </h2>
              <p className="max-w-sm text-sm text-white/55">
                Draw one card from each of three random decks to set your
                intention for the day.
              </p>
            </div>
            {message && (
              <p className="max-w-sm text-sm text-white/55">{message}</p>
            )}
            <Button
              size="lg"
              className="gap-2 shadow-lg shadow-black/30"
              onClick={handleDraw}
              disabled={drawing}
            >
              <Dices className="h-5 w-5" />
              {drawing ? "Drawing…" : "Draw your 3 for today"}
            </Button>
          </div>
        )}
      </div>
    </StageLayout>
  );
}
