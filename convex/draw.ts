import { mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { maybeUnlock } from "./achievements";

type DrawResult = {
  card: Doc<"cards"> | null;
  alreadyDrawn: boolean;
  completed: boolean;
};

// Core draw logic for a single deck, shared by the per-deck draw and the
// Daily 3 spread. Picks a random not-yet-drawn card, records it in
// drawHistory, and records a deck completion when the last card is drawn.
// Does NOT call maybeUnlock — callers do that once after all inserts.
async function drawOneFromDeck(
  ctx: MutationCtx,
  userId: Id<"users">,
  deckId: Id<"decks">,
  today: string
): Promise<DrawResult> {
  // 1. Already drew from this deck today? Return that card.
  const existingDraw = await ctx.db
    .query("drawHistory")
    .withIndex("by_user_deck_date", (q) =>
      q.eq("userId", userId).eq("deckId", deckId).eq("date", today)
    )
    .first();

  if (existingDraw) {
    const card = await ctx.db.get(existingDraw.cardId);
    return { card, alreadyDrawn: true, completed: false };
  }

  // 2. All cards in the deck.
  const allCards = await ctx.db
    .query("cards")
    .withIndex("by_deck", (q) => q.eq("deckId", deckId))
    .collect();

  // 3. Cards the user has already drawn from this deck (all-time).
  const previousDraws = await ctx.db
    .query("drawHistory")
    .withIndex("by_user_and_deck", (q) =>
      q.eq("userId", userId).eq("deckId", deckId)
    )
    .collect();

  const drawnCardIds = new Set(previousDraws.map((d) => d.cardId));

  // 4. Remaining (undrawn) cards.
  const remainingCards = allCards.filter((c) => !drawnCardIds.has(c._id));

  // 5. Nothing left — deck is complete.
  if (remainingCards.length === 0) {
    const existingCompletion = await ctx.db
      .query("deckCompletions")
      .withIndex("by_user_and_deck", (q) =>
        q.eq("userId", userId).eq("deckId", deckId)
      )
      .first();

    if (!existingCompletion) {
      await ctx.db.insert("deckCompletions", {
        userId,
        deckId,
        completedAt: new Date().toISOString(),
        totalDaysToComplete: previousDraws.length,
      });
    }

    return { card: null, alreadyDrawn: false, completed: true };
  }

  // 6. Pick a random remaining card and record the draw.
  const randomIndex = Math.floor(Math.random() * remainingCards.length);
  const selectedCard = remainingCards[randomIndex];

  await ctx.db.insert("drawHistory", {
    userId,
    deckId,
    cardId: selectedCard._id,
    date: today,
  });

  // 7. If that was the last card, record the completion.
  const isNowComplete = remainingCards.length === 1;
  if (isNowComplete) {
    await ctx.db.insert("deckCompletions", {
      userId,
      deckId,
      completedAt: new Date().toISOString(),
      totalDaysToComplete: previousDraws.length + 1,
    });
  }

  return { card: selectedCard, alreadyDrawn: false, completed: isNowComplete };
}

// Draw the "Daily 3": one card from each of up to 3 different random decks the
// user hasn't drawn from today (and that still have cards left). These are
// recorded as normal draws, so they fill deck progress and show on the calendar.
export const drawDailyThree = mutation({
  args: {},
  handler: async (ctx, { }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const today = new Date().toISOString().split("T")[0];

    // Hard cap: the Daily 3 is a single spread of (up to) 3 cards per day.
    // Count everything already drawn today and only ever top up to 3 — so even
    // if this mutation is called again, it can never exceed the daily limit.
    const drawnToday = await ctx.db
      .query("drawHistory")
      .withIndex("by_user_and_date", (q) =>
        q.eq("userId", userId).eq("date", today)
      )
      .collect();
    const remaining = Math.max(0, 3 - drawnToday.length);
    if (remaining === 0) {
      return { draws: [], totalEligible: 0, limitReached: true };
    }

    const decks = await ctx.db
      .query("decks")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Keep only decks the user hasn't drawn from today and that still have
    // at least one undrawn card.
    const eligible: Doc<"decks">[] = [];
    for (const deck of decks) {
      const drewToday = await ctx.db
        .query("drawHistory")
        .withIndex("by_user_deck_date", (q) =>
          q.eq("userId", userId).eq("deckId", deck._id).eq("date", today)
        )
        .first();
      if (drewToday) continue;

      const deckDraws = await ctx.db
        .query("drawHistory")
        .withIndex("by_user_and_deck", (q) =>
          q.eq("userId", userId).eq("deckId", deck._id)
        )
        .collect();
      if (deckDraws.length >= deck.totalCards) continue; // complete

      eligible.push(deck);
    }

    // Shuffle eligible decks (Fisher–Yates) and take up to 3.
    for (let i = eligible.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [eligible[i], eligible[j]] = [eligible[j], eligible[i]];
    }
    const chosen = eligible.slice(0, remaining);

    const draws: Array<{ card: Doc<"cards">; deck: Doc<"decks">; completed: boolean }> =
      [];
    for (const deck of chosen) {
      const result = await drawOneFromDeck(ctx, userId, deck._id, today);
      if (result.card) {
        draws.push({ card: result.card, deck, completed: result.completed });
      }
    }

    if (draws.length > 0) {
      await maybeUnlock(ctx, userId);
    }

    // totalEligible lets the UI explain when fewer than 3 cards were available.
    return { draws, totalEligible: eligible.length, limitReached: false };
  },
});
