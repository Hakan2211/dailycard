import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Flame } from "lucide-react";

export function StreakBanner() {
  const streak = useQuery(api.streaks.getStreak);
  if (!streak) return null;

  const { current, longest, drewToday } = streak;
  const subtitle = drewToday
    ? "You've drawn today — keep it going!"
    : current > 0
      ? "Draw a card today to keep your streak alive."
      : "Draw a card to start a streak.";

  return (
    <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-gradient-to-r from-orange-950/40 to-amber-950/20 p-4 backdrop-blur-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-500 text-white ${
          drewToday ? "shadow-lg shadow-orange-500/30" : "opacity-70"
        }`}
      >
        <Flame className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-2xl font-bold leading-none">
          {current} day{current === 1 ? "" : "s"}
        </p>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {longest > 0 && (
        <div className="text-right">
          <p className="text-lg font-bold leading-none">{longest}</p>
          <p className="text-xs text-muted-foreground">best</p>
        </div>
      )}
    </div>
  );
}
