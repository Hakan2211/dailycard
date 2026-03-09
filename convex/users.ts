import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get the current authenticated user
export const currentUser = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db.get(userId);
  },
});

// Get user's deck completions (trophies)
export const getCompletions = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const completions = await ctx.db
      .query("deckCompletions")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Enrich with deck data
    const enriched = await Promise.all(
      completions.map(async (completion) => {
        const deck = await ctx.db.get(completion.deckId);
        return { ...completion, deck };
      })
    );

    return enriched;
  },
});
