import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { maybeUnlock } from "./achievements";

const kind = v.union(v.literal("curated"), v.literal("studio"));

// Toggle a card in/out of the user's favorites.
export const toggleFavorite = mutation({
  args: {
    kind,
    cardId: v.optional(v.id("cards")),
    studioCardId: v.optional(v.id("studioCards")),
  },
  handler: async (ctx, { kind, cardId, studioCardId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    let existing = null;
    if (kind === "curated" && cardId) {
      existing = await ctx.db
        .query("favorites")
        .withIndex("by_user_and_card", (q) =>
          q.eq("userId", userId).eq("cardId", cardId)
        )
        .first();
    } else if (kind === "studio" && studioCardId) {
      existing = await ctx.db
        .query("favorites")
        .withIndex("by_user_and_studio", (q) =>
          q.eq("userId", userId).eq("studioCardId", studioCardId)
        )
        .first();
    } else {
      throw new Error("Invalid favorite target");
    }

    if (existing) {
      await ctx.db.delete(existing._id);
      return { favorited: false };
    }

    await ctx.db.insert("favorites", {
      userId,
      kind,
      cardId,
      studioCardId,
      createdAt: Date.now(),
    });
    await maybeUnlock(ctx, userId);
    return { favorited: true };
  },
});

// Whether a specific card is favorited by the current user.
export const isFavorited = query({
  args: {
    cardId: v.optional(v.id("cards")),
    studioCardId: v.optional(v.id("studioCards")),
  },
  handler: async (ctx, { cardId, studioCardId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;

    if (cardId) {
      const fav = await ctx.db
        .query("favorites")
        .withIndex("by_user_and_card", (q) =>
          q.eq("userId", userId).eq("cardId", cardId)
        )
        .first();
      return !!fav;
    }
    if (studioCardId) {
      const fav = await ctx.db
        .query("favorites")
        .withIndex("by_user_and_studio", (q) =>
          q.eq("userId", userId).eq("studioCardId", studioCardId)
        )
        .first();
      return !!fav;
    }
    return false;
  },
});

// List the user's favorites, enriched with the underlying card/deck data.
export const listFavorites = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const favorites = await ctx.db
      .query("favorites")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const enriched = await Promise.all(
      favorites
        .sort((a, b) => b.createdAt - a.createdAt)
        .map(async (fav) => {
          if (fav.kind === "curated" && fav.cardId) {
            const card = await ctx.db.get(fav.cardId);
            const deck = card ? await ctx.db.get(card.deckId) : null;
            return { favorite: fav, card, deck, studioCard: null };
          }
          if (fav.kind === "studio" && fav.studioCardId) {
            const studioCard = await ctx.db.get(fav.studioCardId);
            const backgroundStorageUrl = studioCard?.backgroundStorageId
              ? await ctx.storage.getUrl(studioCard.backgroundStorageId)
              : null;
            return {
              favorite: fav,
              card: null,
              deck: null,
              studioCard: studioCard ? { ...studioCard, backgroundStorageUrl } : null,
            };
          }
          return { favorite: fav, card: null, deck: null, studioCard: null };
        })
    );

    // Drop favorites whose target was deleted.
    return enriched.filter((e) => e.card || e.studioCard);
  },
});
