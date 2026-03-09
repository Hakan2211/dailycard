import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Draw a card from a deck
export const drawCard = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, { deckId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    // 1. Check if user already drew from this deck today
    const existingDraw = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_deck_date", (q) =>
        q.eq("userId", userId).eq("deckId", deckId).eq("date", today)
      )
      .first();

    if (existingDraw) {
      // Return the already-drawn card
      const card = await ctx.db.get(existingDraw.cardId);
      return { card, alreadyDrawn: true, completed: false };
    }

    // 2. Get the deck
    const deck = await ctx.db.get(deckId);
    if (!deck) throw new Error("Deck not found");

    // 3. Get all cards in this deck
    const allCards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", deckId))
      .collect();

    // 4. Get all cards the user has already drawn from this deck
    const previousDraws = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_and_deck", (q) =>
        q.eq("userId", userId).eq("deckId", deckId)
      )
      .collect();

    const drawnCardIds = new Set(previousDraws.map((d) => d.cardId));

    // 5. Filter to remaining (undrawn) cards
    const remainingCards = allCards.filter((c) => !drawnCardIds.has(c._id));

    // 6. If no remaining cards, this deck is complete!
    if (remainingCards.length === 0) {
      // Check if already completed
      const existingCompletion = await ctx.db
        .query("deckCompletions")
        .withIndex("by_user_and_deck", (q) =>
          q.eq("userId", userId).eq("deckId", deckId)
        )
        .first();

      if (!existingCompletion) {
        // Record the completion
        await ctx.db.insert("deckCompletions", {
          userId,
          deckId,
          completedAt: new Date().toISOString(),
          totalDaysToComplete: previousDraws.length,
        });
      }

      return { card: null, alreadyDrawn: false, completed: true };
    }

    // 7. Pick a random card from remaining pool
    const randomIndex = Math.floor(Math.random() * remainingCards.length);
    const selectedCard = remainingCards[randomIndex];

    // 8. Save the draw to history
    await ctx.db.insert("drawHistory", {
      userId,
      deckId,
      cardId: selectedCard._id,
      date: today,
    });

    // 9. Check if this was the last card (deck now complete)
    const isNowComplete = remainingCards.length === 1;
    if (isNowComplete) {
      await ctx.db.insert("deckCompletions", {
        userId,
        deckId,
        completedAt: new Date().toISOString(),
        totalDaysToComplete: previousDraws.length + 1,
      });
    }

    return {
      card: selectedCard,
      alreadyDrawn: false,
      completed: isNowComplete,
    };
  },
});

// Get today's drawn card for a specific deck (if any)
export const getTodayCard = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, { deckId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const today = new Date().toISOString().split("T")[0];

    const todayDraw = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_deck_date", (q) =>
        q.eq("userId", userId).eq("deckId", deckId).eq("date", today)
      )
      .first();

    if (!todayDraw) return null;

    const card = await ctx.db.get(todayDraw.cardId);
    return card;
  },
});
