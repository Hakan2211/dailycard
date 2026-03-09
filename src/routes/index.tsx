import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays, Check, Sparkles, ArrowRight, Trophy } from "lucide-react";
import { useEffect } from "react";

export const Route = createFileRoute("/")({
  component: DashboardPage,
});

const colorThemeMap: Record<string, { bg: string; text: string; border: string; gradient: string; badge: string }> = {
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

function DashboardPage() {
  const user = useQuery(api.users.currentUser);
  const decks = useQuery(api.decks.listActive);
  const todayStatus = useQuery(api.decks.getTodayStatus);
  const allProgress = useQuery(api.decks.getAllProgress);
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

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
      <div className="space-y-8">
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

        {/* Quick Actions */}
        <div className="flex gap-3">
          <Link to="/calendar">
            <Button variant="outline" className="gap-2">
              <CalendarDays className="h-4 w-4" />
              View Calendar
            </Button>
          </Link>
        </div>

        {/* Deck Grid */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Your Decks</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {decks?.map((deck) => {
              const drawnToday = todayStatus?.[deck._id];
              const progress = allProgress?.[deck._id];
              const theme = colorThemeMap[deck.colorTheme] ?? colorThemeMap.violet;
              const progressPercent = progress
                ? Math.round((progress.drawn / progress.total) * 100)
                : 0;
              const isComplete = progress && progress.drawn >= progress.total;

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
                        disabled
                      >
                        <Check className="h-4 w-4" />
                        Come Back Tomorrow
                      </Button>
                    ) : (
                      <Link to="/deck/$deckId" params={{ deckId: deck._id }} className="w-full">
                        <Button
                          className={`w-full gap-2 bg-gradient-to-r ${theme.gradient} text-white shadow-md hover:shadow-lg`}
                        >
                          Draw a Card
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <div className="h-9 w-64 animate-pulse rounded-lg bg-slate-200" />
        <div className="h-5 w-48 animate-pulse rounded-lg bg-slate-100" />
      </div>
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
