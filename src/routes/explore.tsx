import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { SidebarLayout } from "@/components/SidebarLayout";
import { StageLayout } from "@/components/StageLayout";
import { FeatureCarousel } from "@/components/stage/FeatureCarousel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getCardTheme } from "@/lib/cardTheme";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { DeckCoverflow } from "@/components/stage/DeckCoverflow";
import type { CoverflowDeck } from "@/components/stage/DeckCoverflow";

export const Route = createFileRoute("/explore")({
  component: ExplorePage,
});

type Deck = {
  _id: string;
  title: string;
  description: string;
  coverImageUrl: string;
  totalCards: number;
  colorTheme: string;
};

function ExplorePage() {
  const decks = useQuery(api.decks.listActive);
  const [activeDeck, setActiveDeck] = useState<Deck | null>(null);
  // Remember which deck was centered so returning from a deck restores it
  // instead of snapping back to the first.
  const [coverIndex, setCoverIndex] = useState(0);

  // Browsing a deck opens the full-bleed 3D stage.
  if (activeDeck) {
    return (
      <StageLayout>
        <DeckStage deck={activeDeck} onBack={() => setActiveDeck(null)} />
      </StageLayout>
    );
  }

  return (
    <SidebarLayout title="Explore">
      <div className="flex min-h-[72vh] flex-col gap-10">
        <div className="space-y-1 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Explore the decks</h1>
          <p className="text-muted-foreground">
            Swipe through the decks — tap one to flip through its cards.
          </p>
        </div>

        {decks === undefined ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-[440px] w-full max-w-sm animate-pulse rounded-3xl border border-white/10 bg-white/5" />
          </div>
        ) : decks.length === 0 ? (
          <p className="py-10 text-center text-muted-foreground">
            No decks yet.
          </p>
        ) : (
          <div className="flex flex-1 items-center justify-center">
            <DeckCoverflow
              decks={decks as CoverflowDeck[]}
              initialIndex={coverIndex}
              onIndexChange={setCoverIndex}
              onSelect={(d) => setActiveDeck(d as Deck)}
            />
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}

function DeckStage({ deck, onBack }: { deck: Deck; onBack: () => void }) {
  const cards = useQuery(api.cards.listByDeck, {
    deckId: deck._id as Id<"decks">,
  });
  const theme = getCardTheme(deck.colorTheme);

  return (
    <div className="mx-auto flex min-h-full w-full max-w-6xl flex-col items-center justify-center gap-8 px-4 py-20">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-white/80 hover:bg-white/10 hover:text-white"
          onClick={onBack}
        >
          <ArrowLeft className="h-4 w-4" />
          All decks
        </Button>
        <Badge className={theme.badge}>{deck.title}</Badge>
      </div>

      {cards === undefined ? (
        <div className="h-[460px] w-full max-w-4xl animate-pulse rounded-3xl border border-white/10 bg-white/5" />
      ) : cards.length === 0 ? (
        <p className="py-10 text-center text-white/60">
          This deck has no cards yet.
        </p>
      ) : (
        <FeatureCarousel
          cards={cards}
          deckTitle={deck.title}
          colorTheme={deck.colorTheme}
        />
      )}
    </div>
  );
}
