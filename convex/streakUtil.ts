// Shared helpers for deriving streaks from drawHistory dates ("YYYY-MM-DD").

export function toDayNum(s: string): number {
  const [y, m, d] = s.split("-").map(Number);
  return Math.floor(Date.UTC(y, m - 1, d) / 86400000);
}

export function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

export interface StreakInfo {
  current: number;
  longest: number;
  lastDrawDate: string | null;
  drewToday: boolean;
}

export function computeStreaks(dates: string[]): StreakInfo {
  if (dates.length === 0) {
    return { current: 0, longest: 0, lastDrawDate: null, drewToday: false };
  }

  const dayNums = Array.from(new Set(dates.map(toDayNum))).sort((a, b) => a - b);
  const set = new Set(dayNums);

  // Longest run of consecutive days
  let longest = 1;
  let run = 1;
  for (let i = 1; i < dayNums.length; i++) {
    if (dayNums[i] === dayNums[i - 1] + 1) {
      run++;
      longest = Math.max(longest, run);
    } else {
      run = 1;
    }
  }

  // Current streak ends today (or yesterday — still "alive")
  const today = toDayNum(todayStr());
  let cursor: number | null = set.has(today)
    ? today
    : set.has(today - 1)
      ? today - 1
      : null;
  let current = 0;
  if (cursor !== null) {
    while (set.has(cursor)) {
      current++;
      cursor--;
    }
  }

  const lastDrawDate = dates.slice().sort().pop() ?? null;
  return { current, longest, lastDrawDate, drewToday: set.has(today) };
}

/** Convenience: current streak length only. */
export function currentStreak(dates: string[]): number {
  return computeStreaks(dates).current;
}
