import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { decksWithAccess } from "./pro";

// Active decks for one edition, each annotated with `locked`. Decks the user
// hasn't unlocked are still returned (so Explore can show them behind a lock +
// upgrade prompt); the first couple are a free preview for everyone.
export const listActive = query({
  args: { language: v.optional(v.union(v.literal("en"), v.literal("de"))) },
  handler: async (ctx, { language = "en" }) => {
    const withAccess = await decksWithAccess(ctx, language);
    return withAccess.map(({ deck, locked }) => ({ ...deck, locked }));
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
