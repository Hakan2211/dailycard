import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect, useState } from "react";
import { api } from "../../convex/_generated/api";
import { SidebarLayout } from "@/components/SidebarLayout";
import { LandingPage } from "@/components/landing/LandingPage";
import { StreakHeatmap } from "@/components/StreakHeatmap";
import { UpgradePanel } from "@/components/UpgradePanel";
import { useOwnedEditions } from "@/lib/pro";
import { Badge } from "@/components/ui/badge";
import { getCardTheme } from "@/lib/cardTheme";
import { ArrowRight, CheckCircle2, Dices, Layers, XCircle } from "lucide-react";

export const Route = createFileRoute("/")({
  component: HomePage,
});

function HomePage() {
  const user = useQuery(api.users.currentUser);

  // Logged-out visitors (and the brief SSR/loading state) see the public
  // marketing page; authenticated users get their dashboard.
  if (!user) return <LandingPage />;

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

        <CheckoutBanner />
        <EntitlementCta />
        <StatTiles />
        <StreakHeatmap />
        <TodaySpread />
        <ExploreLink />
        <RecentFavorites />
      </div>
    </SidebarLayout>
  );
}

// Surfaces the purchase panel for users who haven't unlocked an edition yet.
function EntitlementCta() {
  const owned = useOwnedEditions();
  if (owned.length > 0) return null;
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold text-white/80">Unlock DailyCard</h2>
      <UpgradePanel />
    </section>
  );
}

// One-shot banner shown when returning from Stripe Checkout. The entitlement
// itself arrives reactively via the webhook -> currentUser, so we only confirm.
function CheckoutBanner() {
  const [status, setStatus] = useState<"success" | "cancel" | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get("checkout");
    if (checkout === "success" || checkout === "cancel") {
      setStatus(checkout);
      params.delete("checkout");
      const qs = params.toString();
      window.history.replaceState(
        {},
        "",
        window.location.pathname + (qs ? `?${qs}` : "")
      );
    }
  }, []);

  if (!status) return null;

  return status === "success" ? (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100">
      <CheckCircle2 className="h-5 w-5 shrink-0" />
      Payment received. Your edition is being unlocked — it will appear in a
      moment.
    </div>
  ) : (
    <div className="flex items-center gap-3 rounded-2xl border border-white/15 bg-white/[0.04] p-4 text-sm text-white/70">
      <XCircle className="h-5 w-5 shrink-0" />
      Checkout canceled. You can unlock an edition any time.
    </div>
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

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
