import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar } from "@/components/ui/calendar";
import { useState, useMemo, useEffect } from "react";
import { getCardTheme } from "@/lib/cardTheme";

interface CalendarViewProps {
  onDateSelect: (draws: Array<{ card: any; deck: any }>) => void;
}

export function CalendarView({ onDateSelect }: CalendarViewProps) {
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const decks = useQuery(api.decks.listActive);
  const allDrawDates = useQuery(api.calendar.getAllDrawDates);
  const dateDraws = useQuery(
    api.calendar.getDateDraws,
    selectedDate ? { date: selectedDate } : "skip"
  );

  // Build a set of draw dates for calendar highlighting
  const drawDateSet = useMemo(() => {
    if (!allDrawDates) return new Set<string>();
    return new Set(allDrawDates.map((d) => d.date));
  }, [allDrawDates]);

  // Date objects for calendar modifiers
  const drawDates = useMemo(() => {
    if (!allDrawDates) return [];
    return allDrawDates.map((d) => new Date(d.date + "T12:00:00"));
  }, [allDrawDates]);

  // When dateDraws loads after a date is selected, notify parent
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) return;
    const dateStr = formatDate(date);
    if (drawDateSet.has(dateStr)) {
      setSelectedDate(dateStr);
    }
  };

  // Open card modal when draws data is ready
  useEffect(() => {
    if (selectedDate && dateDraws && dateDraws.length > 0) {
      const validDraws = dateDraws
        .filter((draw) => draw.card && draw.deck)
        .map((draw) => ({
          card: draw.card,
          deck: draw.deck,
        }));

      if (validDraws.length > 0) {
        onDateSelect(validDraws);
        setSelectedDate(null);
      }
    }
  }, [dateDraws, selectedDate, onDateSelect]);

  // Calculate stats
  const totalDraws =
    allDrawDates?.reduce((sum, d) => sum + d.deckIds.length, 0) ?? 0;
  const uniqueDays = allDrawDates?.length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Your Journey</h2>
        <p className="text-muted-foreground">
          Track your daily card draws across all decks
        </p>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-sm">
          <p className="text-2xl font-bold text-sky-400">{uniqueDays}</p>
          <p className="text-xs text-muted-foreground">Days Active</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-sm">
          <p className="text-2xl font-bold text-emerald-400">{totalDraws}</p>
          <p className="text-xs text-muted-foreground">Cards Drawn</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.04] p-4 text-center backdrop-blur-sm">
          <p className="text-2xl font-bold text-amber-400">
            {decks?.length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">Active Decks</p>
        </div>
      </div>

      {/* Legend */}
      {decks && decks.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {decks.map((deck) => (
            <div key={deck._id} className="flex items-center gap-2">
              <div
                className={`h-3 w-3 rounded-full ${getCardTheme(deck.colorTheme).dot}`}
              />
              <span className="text-sm text-muted-foreground">
                {deck.title}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Calendar */}
      <div className="flex justify-center">
        <Calendar
          mode="single"
          selected={
            selectedDate
              ? new Date(selectedDate + "T12:00:00")
              : undefined
          }
          onSelect={handleDateSelect}
          month={selectedMonth}
          onMonthChange={setSelectedMonth}
          modifiers={{
            drawn: drawDates,
          }}
          modifiersClassNames={{
            drawn:
              "bg-emerald-500/20 text-emerald-200 font-semibold hover:bg-emerald-500/30",
          }}
          className="rounded-xl border border-white/10 bg-white/[0.04] p-4 backdrop-blur-sm"
        />
      </div>

      {/* Hint */}
      {allDrawDates && allDrawDates.length > 0 && (
        <p className="text-center text-xs text-muted-foreground">
          Tap a highlighted date to view your drawn cards
        </p>
      )}
    </div>
  );
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
