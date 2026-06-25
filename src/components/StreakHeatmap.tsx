import { useMemo } from "react";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

// A GitHub-style contribution grid of the user's draw activity over the last
// ~6 months, colored by how many cards were drawn each day. Reuses the existing
// `getAllDrawDates` query (all-time draw dates + deckIds) — grouped client-side.

const WEEKS = 26;

function fmt(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function levelClass(count: number): string {
  if (count <= 0) return "bg-white/[0.06]";
  if (count === 1) return "bg-emerald-500/30";
  if (count === 2) return "bg-emerald-500/55";
  return "bg-emerald-400/90";
}

type Cell = { date: string; count: number; future: boolean };

export function StreakHeatmap() {
  const allDrawDates = useQuery(api.calendar.getAllDrawDates);

  const { weeks, activeDays, monthLabels } = useMemo(() => {
    const counts = new Map<string, number>();
    for (const d of allDrawDates ?? []) counts.set(d.date, d.deckIds.length);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // End on the Saturday of the current week; start so we render WEEKS columns.
    const end = new Date(today);
    end.setDate(end.getDate() + (6 - end.getDay()));
    const start = new Date(end);
    start.setDate(start.getDate() - (WEEKS * 7 - 1));

    const cols: Cell[][] = [];
    const labels: Array<{ index: number; label: string }> = [];
    const cursor = new Date(start);
    let active = 0;
    let lastMonth = -1;
    for (let w = 0; w < WEEKS; w++) {
      const col: Cell[] = [];
      for (let dow = 0; dow < 7; dow++) {
        const ds = fmt(cursor);
        const count = counts.get(ds) ?? 0;
        if (count > 0) active++;
        col.push({ date: ds, count, future: cursor > today });
        if (dow === 0 && cursor.getMonth() !== lastMonth) {
          lastMonth = cursor.getMonth();
          labels.push({
            index: w,
            label: cursor.toLocaleDateString("en-US", { month: "short" }),
          });
        }
        cursor.setDate(cursor.getDate() + 1);
      }
      cols.push(col);
    }
    return { weeks: cols, activeDays: active, monthLabels: labels };
  }, [allDrawDates]);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-white/80">
          Your last 6 months
        </h2>
        <span className="text-xs text-white/45">{activeDays} active days</span>
      </div>

      <div className="overflow-x-auto">
        {/* Month labels */}
        <div className="relative mb-1 ml-0 h-4 text-[10px] text-white/40">
          {monthLabels.map((m) => (
            <span
              key={`${m.index}-${m.label}`}
              className="absolute"
              style={{ left: `${m.index * 15}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        <div className="flex gap-[3px]">
          {weeks.map((col, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {col.map((cell) => (
                <div
                  key={cell.date}
                  title={`${cell.date} · ${cell.count} card${cell.count === 1 ? "" : "s"}`}
                  className={`h-3 w-3 rounded-[3px] ${
                    cell.future ? "bg-transparent" : levelClass(cell.count)
                  }`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-white/40">
        <span>Less</span>
        <span className="h-3 w-3 rounded-[3px] bg-white/[0.06]" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-500/30" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-500/55" />
        <span className="h-3 w-3 rounded-[3px] bg-emerald-400/90" />
        <span>More</span>
      </div>
    </div>
  );
}
