import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";
import { useState, useMemo, useEffect } from "react";

const deckColorMap: Record<string, string> = {
  emerald: "bg-emerald-500",
  amber: "bg-amber-500",
  violet: "bg-violet-500",
};

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
      {decks && decks.length > 0 && (
        <div className="flex flex-wrap gap-4">
          {decks.map((deck) => (
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
              "bg-violet-100 text-violet-900 font-semibold hover:bg-violet-200",
          }}
          className="rounded-xl border bg-white p-4 shadow-sm"
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
