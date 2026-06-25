import { query } from "./_generated/server";
import { v } from "convex/values";

// Public list of all cards in a deck, ordered by position. Unlike
// admin.listCards this needs no admin gate — it powers the Explore library,
// the Daily 3 spread, and the group pass-and-play card pool.
export const listByDeck = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, { deckId }) => {
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", deckId))
      .collect();

    return cards.sort((a, b) => a.cardNumber - b.cardNumber);
  },
});
