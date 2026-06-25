import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { PRO_GATING_ENABLED, FREE_DECK_LIMIT, isProUser } from "./pro";

// Get all active decks. Once Pro gating is enabled, free users see a limited
// set; while deferred everyone sees all.
export const listActive = query({
  handler: async (ctx) => {
    const decks = await ctx.db
      .query("decks")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (PRO_GATING_ENABLED && !(await isProUser(ctx))) {
      return decks.slice(0, FREE_DECK_LIMIT);
    }
    return decks;
  },
});

// Get a single deck by ID
export const getById = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, { deckId }) => {
    return await ctx.db.get(deckId);
  },
});

// Get progress for a specific deck (how many cards drawn vs total)
export const getDeckProgress = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, { deckId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { drawn: 0, total: 0 };

    const deck = await ctx.db.get(deckId);
    if (!deck) return { drawn: 0, total: 0 };

    const draws = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_and_deck", (q) =>
        q.eq("userId", userId).eq("deckId", deckId)
      )
      .collect();

    return {
      drawn: draws.length,
      total: deck.totalCards,
    };
  },
});

// Get all deck progress at once (for dashboard)
export const getAllProgress = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return {};

    const decks = await ctx.db
      .query("decks")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const progress: Record<string, { drawn: number; total: number }> = {};

    for (const deck of decks) {
      const draws = await ctx.db
        .query("drawHistory")
        .withIndex("by_user_and_deck", (q) =>
          q.eq("userId", userId).eq("deckId", deck._id)
        )
        .collect();

      progress[deck._id] = {
        drawn: draws.length,
        total: deck.totalCards,
      };
    }

    return progress;
  },
});
