import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { computeStreaks } from "./streakUtil";

// Current/longest streak derived from drawHistory (no separate table).
export const getStreak = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { current: 0, longest: 0, lastDrawDate: null, drewToday: false };
    }

    const draws = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();

    return computeStreaks(draws.map((d) => d.date));
  },
});

// Aggregate activity stats for the dashboard / calendar header.
export const getActivitySummary = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return { totalDraws: 0, activeDays: 0, decksCompleted: 0 };
    }

    const draws = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();

    const completions = await ctx.db
      .query("deckCompletions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const activeDays = new Set(draws.map((d) => d.date)).size;

    return {
      totalDraws: draws.length,
      activeDays,
      decksCompleted: completions.length,
    };
  },
});
