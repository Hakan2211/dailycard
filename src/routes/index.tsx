import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SidebarLayout } from "@/components/SidebarLayout";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { Badge } from "@/components/ui/badge";
import { getCardTheme } from "@/lib/cardTheme";
import { ArrowRight, Dices, Layers } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

function DashboardPage() {
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) navigate({ to: "/login" });
  }, [user, navigate]);

  if (user === undefined) {
    return (
      <SidebarLayout title="Today">
        <DashboardSkeleton />
      </SidebarLayout>
    );
  }

  if (user === null) return null;

  const greeting = getGreeting();

  return (
    <SidebarLayout title="Today">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        {/* Greeting */}
        <header className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            {greeting}, {user.name?.split(" ")[0] ?? "there"}
          </h1>
          <p className="text-muted-foreground">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </header>

        <StatTiles />
        <StreakHeatmap />
        <TodaySpread />
        <ExploreLink />
        <RecentFavorites />
      </div>
    </SidebarLayout>
  );
}

// ==============================
// SECTIONS
// ==============================

function StatTiles() {
  const streak = useQuery(api.streaks.getStreak);
  const allDrawDates = useQuery(api.calendar.getAllDrawDates);

  const cardsDrawn = (allDrawDates ?? []).reduce(
    (sum, d) => sum + d.deckIds.length,
    0
  );
  const daysActive = allDrawDates?.length ?? 0;

  const tiles = [
    { label: "Current streak", value: streak?.current ?? 0, suffix: "days" },
    { label: "Longest streak", value: streak?.longest ?? 0, suffix: "days" },
    { label: "Cards drawn", value: cardsDrawn },
    { label: "Days active", value: daysActive },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {tiles.map((t) => (
        <div
          key={t.label}
          className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
        >
          <p className="text-2xl font-bold tracking-tight text-white">
            {t.value}
            {t.suffix && (
              <span className="ml-1 text-sm font-normal text-white/40">
                {t.suffix}
              </span>
            )}
          </p>
          <p className="mt-1 text-xs text-white/50">{t.label}</p>
        </div>
      ))}
    </div>
  );
}

function TodaySpread() {
  const todayDraws = useQuery(api.calendar.getTodayDraws);
  if (todayDraws === undefined) return null;

  const cards = todayDraws.filter((d) => d.card && d.deck);

  // Not drawn yet → prominent CTA.
  if (cards.length === 0) {
    return (
      <Link to="/daily" className="group block">
        <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-foreground shadow-sm">
            <Dices className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h2 className="text-lg font-semibold">Draw your Daily 3</h2>
            <p className="text-sm text-muted-foreground">
              One card from each of three decks — today's reflection.
            </p>
          </div>
          <ArrowRight className="h-5 w-5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
        </div>
      </Link>
    );
  }

  // Already drawn → peek at today's spread.
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80">Today's spread</h2>
        <Link
          to="/daily"
          className="text-xs text-white/50 transition hover:text-white"
        >
          View all →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {cards.map((d) => (
          <Link
            to="/daily"
            key={d._id}
            className="group overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] transition hover:-translate-y-0.5 hover:bg-white/[0.07]"
          >
            <div className="aspect-[4/5] overflow-hidden bg-black/30">
              <img
                src={d.card!.imageUrl}
                alt=""
                className="h-full w-full object-contain p-2"
              />
            </div>
            <div className="p-2">
              <Badge
                className={`text-[10px] ${getCardTheme(d.deck!.colorTheme).badge}`}
              >
                {d.deck!.title}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function ExploreLink() {
  return (
    <Link to="/explore" className="group block">
      <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/[0.07]">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/10 text-foreground">
          <Layers className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-semibold">Explore the decks</h2>
          <p className="text-sm text-muted-foreground">
            Browse every card in every deck at your own pace.
          </p>
        </div>
        <ArrowRight className="h-5 w-5 -translate-x-1 opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:opacity-100" />
      </div>
    </Link>
  );
}

function RecentFavorites() {
  const favorites = useQuery(api.favorites.listFavorites);
  const items = (favorites ?? []).filter((f) => f.card).slice(0, 8);
  if (items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80">Recent favorites</h2>
        <Link
          to="/favorites"
          className="text-xs text-white/50 transition hover:text-white"
        >
          All favorites →
        </Link>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2">
        {items.map((f) => (
          <Link
            to="/favorites"
            key={f.favorite._id}
            className="group shrink-0"
            title={f.card!.quote}
          >
            <div className="h-32 w-24 overflow-hidden rounded-xl border border-white/10 bg-black/30 transition group-hover:-translate-y-0.5 group-hover:border-white/20">
              <img
                src={f.card!.imageUrl}
                alt=""
                className="h-full w-full object-contain p-1.5"
              />
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

// ==============================
// HELPERS
// ==============================

function DashboardSkeleton() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-8">
      <div className="space-y-2">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-white/10" />
        <div className="h-5 w-48 animate-pulse rounded-lg bg-white/5" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-2xl border border-white/10 bg-white/5"
          />
        ))}
      </div>
      <div className="h-40 animate-pulse rounded-2xl border border-white/10 bg-white/5" />
    </div>
  );
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
