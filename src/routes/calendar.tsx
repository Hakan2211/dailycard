import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Layout } from "@/components/Layout";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

const deckColorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
};

function CalendarPage() {
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const decks = useQuery(api.decks.listActive);
  const allDrawDates = useQuery(api.calendar.getAllDrawDates);
  const dateDraws = useQuery(
    api.calendar.getDateDraws,
    selectedDate ? { date: selectedDate } : "skip"
  );

  // Redirect if not authed
  useEffect(() => {
    if (user === null) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  // Build a set of draw dates for calendar highlighting
  const drawDateSet = useMemo(() => {
    if (!allDrawDates) return new Set<string>();
    return new Set(allDrawDates.map((d) => d.date));
  }, [allDrawDates]);

  // Build deck lookup for colors
  const deckLookup = useMemo(() => {
    if (!decks) return {};
    const lookup: Record<string, { title: string; colorTheme: string }> = {};
    for (const deck of decks) {
      lookup[deck._id] = { title: deck.title, colorTheme: deck.colorTheme };
    }
    return lookup;
  }, [decks]);

  // Date info for calendar modifiers
  const drawDates = useMemo(() => {
    if (!allDrawDates) return [];
    return allDrawDates.map((d) => new Date(d.date + "T12:00:00"));
  }, [allDrawDates]);

  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = formatDate(date);
    if (drawDateSet.has(dateStr)) {
      setSelectedDate(dateStr);
      setSheetOpen(true);
    }
  };

  if (user === undefined || decks === undefined) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-violet-600" />
        </div>
      </Layout>
    );
  }

  if (user === null) return null;

  // Calculate stats
  const totalDraws = allDrawDates?.reduce(
    (sum, d) => sum + d.deckIds.length,
    0
  ) ?? 0;
  const uniqueDays = allDrawDates?.length ?? 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Your Journey</h1>
          <p className="text-muted-foreground">
            Track your daily card draws across all decks
          </p>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-violet-600">{uniqueDays}</p>
            <p className="text-xs text-muted-foreground">Days Active</p>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-emerald-600">{totalDraws}</p>
            <p className="text-xs text-muted-foreground">Cards Drawn</p>
          </div>
          <div className="rounded-xl border bg-white p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-amber-600">
              {decks?.length ?? 0}
            </p>
            <p className="text-xs text-muted-foreground">Active Decks</p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-4">
          {decks?.map((deck) => (
            <div key={deck._id} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${deckColorMap[deck.colorTheme] ?? "bg-slate-500"}`}
              />
              <span className="text-sm text-muted-foreground">
                {deck.title}
              </span>
            </div>
          ))}
        </div>

        {/* Calendar */}
        <div className="flex justify-center">
          <Calendar
            mode="single"
            selected={selectedDate ? new Date(selectedDate + "T12:00:00") : undefined}
            onSelect={handleDateSelect}
            month={selectedMonth}
            onMonthChange={setSelectedMonth}
            modifiers={{
              drawn: drawDates,
            }}
            modifiersClassNames={{
              drawn: "bg-violet-100 text-violet-900 font-semibold hover:bg-violet-200",
            }}
            className="rounded-xl border bg-white p-4 shadow-sm"
          />
        </div>

        {/* Day Detail Sheet */}
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="bottom" className="rounded-t-2xl">
            <SheetHeader>
              <SheetTitle>
                {selectedDate &&
                  new Date(selectedDate + "T12:00:00").toLocaleDateString(
                    "en-US",
                    {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}
              </SheetTitle>
              <SheetDescription>Cards drawn on this day</SheetDescription>
            </SheetHeader>

            <div className="mt-4 space-y-4 pb-8">
              {dateDraws?.map((draw) => (
                <div
                  key={draw._id}
                  className="flex gap-4 rounded-xl border p-4"
                >
                  {/* Card Image */}
                  {draw.card && (
                    <img
                      src={draw.card.imageUrl}
                      alt="Card"
                      className="h-20 w-20 rounded-lg object-cover"
                    />
                  )}

                  {/* Card Details */}
                  <div className="flex-1 space-y-1">
                    {draw.deck && (
                      <Badge
                        variant="secondary"
                        className="text-xs"
                      >
                        {draw.deck.title}
                      </Badge>
                    )}
                    {draw.card && (
                      <>
                        <p className="text-sm font-medium italic line-clamp-2">
                          &ldquo;{draw.card.quote}&rdquo;
                        </p>
                        {draw.card.author && (
                          <p className="text-xs text-muted-foreground">
                            &mdash; {draw.card.author}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))}

              {(!dateDraws || dateDraws.length === 0) && (
                <p className="text-center text-sm text-muted-foreground py-8">
                  Loading...
                </p>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </Layout>
  );
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
