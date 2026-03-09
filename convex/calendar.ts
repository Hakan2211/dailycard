import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all draws for a user in a specific month (for calendar display)
export const getMonthDraws = query({
  args: {
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, { year, month }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    // Build date range for the month
    const startDate = `${year}-${String(month).padStart(2, "0")}-01`;
    const endMonth = month === 12 ? 1 : month + 1;
    const endYear = month === 12 ? year + 1 : year;
    const endDate = `${endYear}-${String(endMonth).padStart(2, "0")}-01`;

    // Get all draws in this date range
    const draws = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).gte("date", startDate).lt("date", endDate)
      )
      .collect();

    // Enrich with card and deck data
    const enrichedDraws = await Promise.all(
      draws.map(async (draw) => {
        const card = await ctx.db.get(draw.cardId);
        const deck = await ctx.db.get(draw.deckId);
        return {
          ...draw,
          card,
          deck,
        };
      })
    );

    return enrichedDraws;
  },
});

// Get draws for a specific date
export const getDateDraws = query({
  args: { date: v.string() },
  handler: async (ctx, { date }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const draws = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", date)
      )
      .collect();

    const enrichedDraws = await Promise.all(
      draws.map(async (draw) => {
        const card = await ctx.db.get(draw.cardId);
        const deck = await ctx.db.get(draw.deckId);
        return {
          ...draw,
          card,
          deck,
        };
      })
    );

    return enrichedDraws;
  },
});

// Get all user draw dates (for calendar highlighting)
export const getAllDrawDates = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const draws = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
      .collect();

    // Group by date, with deck info for color coding
    const dateMap: Record<string, string[]> = {};
    for (const draw of draws) {
      if (!dateMap[draw.date]) {
        dateMap[draw.date] = [];
      }
      dateMap[draw.date].push(draw.deckId);
    }

    return Object.entries(dateMap).map(([date, deckIds]) => ({
      date,
      deckIds,
    }));
  },
});
