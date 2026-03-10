import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Check, Sparkles, ArrowRight, Trophy, Layers } from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { CardModal } from "@/components/CardModal";
import { CalendarView } from "@/components/CalendarView";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const colorThemeMap: Record<
  string,
  { bg: string; text: string; border: string; gradient: string; badge: string }
> = {
  emerald: {
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    gradient: "from-emerald-500 to-emerald-700",
    badge: "bg-emerald-100 text-emerald-800",
  },
  amber: {
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    gradient: "from-amber-500 to-amber-700",
    badge: "bg-amber-100 text-amber-800",
  },
  violet: {
    bg: "bg-violet-50",
    text: "text-violet-700",
    border: "border-violet-200",
    gradient: "from-violet-500 to-violet-700",
    badge: "bg-violet-100 text-violet-800",
  },
};

type Tab = "decks" | "calendar";

function DashboardPage() {
  const user = useQuery(api.users.currentUser);
  const decks = useQuery(api.decks.listActive);
  const todayStatus = useQuery(api.decks.getTodayStatus);
  const allProgress = useQuery(api.decks.getAllProgress);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<Tab>("decks");

  // Draw modal state
  const [drawModalOpen, setDrawModalOpen] = useState(false);
  const [drawDeckId, setDrawDeckId] = useState<string | null>(null);
  const [drawDeck, setDrawDeck] = useState<any>(null);

  // View modal state (for calendar cards)
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewCards, setViewCards] = useState<
    Array<{ card: any; deck: any }>
  >([]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  const handleOpenDraw = useCallback(
    (deckId: string) => {
      const deck = decks?.find((d) => d._id === deckId);
      if (deck) {
        setDrawDeckId(deckId);
        setDrawDeck(deck);
        setDrawModalOpen(true);
      }
    },
    [decks]
  );

  const handleCalendarDateSelect = useCallback(
    (draws: Array<{ card: any; deck: any }>) => {
      setViewCards(draws);
      setViewModalOpen(true);
    },
    []
  );

  if (user === undefined || decks === undefined) {
    return (
      <Layout>
        <DashboardSkeleton />
      </Layout>
    );
  }

  if (user === null) return null;

  const today = new Date();
  const greeting = getGreeting();

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header Section */}
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {user.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-muted-foreground">
            {today.toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
          <button
            onClick={() => setActiveTab("decks")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "decks"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <Layers className="h-4 w-4" />
            Decks
          </button>
          <button
            onClick={() => setActiveTab("calendar")}
            className={`flex-1 flex items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all ${
              activeTab === "calendar"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <CalendarDays className="h-4 w-4" />
            Calendar
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "decks" ? (
          <DecksTab
            decks={decks}
            todayStatus={todayStatus}
            allProgress={allProgress}
            onDrawCard={handleOpenDraw}
          />
        ) : (
          <CalendarView onDateSelect={handleCalendarDateSelect} />
        )}
      </div>

      {/* Draw Card Modal */}
      {drawDeckId && drawDeck && (
        <CardModal
          mode="draw"
          deckId={drawDeckId}
          deck={drawDeck}
          open={drawModalOpen}
          onOpenChange={setDrawModalOpen}
        />
      )}

      {/* View Card Modal (from calendar) */}
      {viewCards.length > 0 && (
        <CardModal
          mode="view"
          cards={viewCards}
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
        />
      )}
    </Layout>
  );
}

// ==============================
// DECKS TAB
// ==============================

function DecksTab({
  decks,
  todayStatus,
  allProgress,
  onDrawCard,
}: {
  decks: any[];
  todayStatus: Record<string, string> | undefined;
  allProgress: Record<string, { drawn: number; total: number }> | undefined;
  onDrawCard: (deckId: string) => void;
}) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">Your Decks</h2>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {decks.map((deck) => {
          const drawnToday = todayStatus?.[deck._id];
          const progress = allProgress?.[deck._id];
          const theme =
            colorThemeMap[deck.colorTheme] ?? colorThemeMap.violet;
          const progressPercent = progress
            ? Math.round((progress.drawn / progress.total) * 100)
            : 0;
          const isComplete =
            progress && progress.drawn >= progress.total;

          return (
            <Card
              key={deck._id}
              className={`group relative overflow-hidden transition-all duration-300 ${
                drawnToday
                  ? "opacity-75"
                  : "hover:shadow-lg hover:-translate-y-1"
              } ${theme.border}`}
            >
              {/* Cover Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={deck.coverImageUrl}
                  alt={deck.title}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                {/* Status Badge */}
                <div className="absolute right-3 top-3">
                  {isComplete ? (
                    <Badge className="gap-1 bg-yellow-500 text-white">
                      <Trophy className="h-3 w-3" />
                      Complete
                    </Badge>
                  ) : drawnToday ? (
                    <Badge className="gap-1 bg-white/90 text-slate-700">
                      <Check className="h-3 w-3" />
                      Drawn Today
                    </Badge>
                  ) : (
                    <Badge className={theme.badge}>
                      <Sparkles className="mr-1 h-3 w-3" />
                      Ready
                    </Badge>
                  )}
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-3 left-3 right-3">
                  <h3 className="text-lg font-bold text-white">
                    {deck.title}
                  </h3>
                </div>
              </div>

              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {deck.description}
                </p>

                {/* Progress Bar */}
                {progress && (
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>
                        {progress.drawn} / {progress.total} cards drawn
                      </span>
                      <span>{progressPercent}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className={`h-full rounded-full bg-gradient-to-r ${theme.gradient} transition-all duration-500`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="pt-0">
                {isComplete ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    disabled
                  >
                    <Trophy className="h-4 w-4" />
                    Deck Complete
                  </Button>
                ) : drawnToday ? (
                  <Button
                    variant="outline"
                    className="w-full gap-2"
                    onClick={() => onDrawCard(deck._id)}
                  >
                    <Check className="h-4 w-4" />
                    View Today's Card
                  </Button>
                ) : (
                  <Button
                    className={`w-full gap-2 bg-gradient-to-r ${theme.gradient} text-white shadow-md hover:shadow-lg`}
                    onClick={() => onDrawCard(deck._id)}
                  >
                    Draw a Card
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                )}
              </CardFooter>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ==============================
// HELPERS
// ==============================

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-5 w-48 animate-pulse rounded-lg bg-slate-100" />
      </div>
      <div className="h-10 animate-pulse rounded-lg bg-slate-100" />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-80 animate-pulse rounded-xl border bg-slate-100"
          />
        ))}
      </div>
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
