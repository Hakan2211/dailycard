import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

const ADMIN_EMAIL = "hbilgic1992@gmail.com";

// Helper: verify the current user is the admin
async function requireAdmin(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) throw new Error("Not authenticated");
  const user = await ctx.db.get(userId);
  if (!user || user.email !== ADMIN_EMAIL) {
    throw new Error("Unauthorized: admin access required");
  }
  return user;
}

// ==============================
// DECK MUTATIONS
// ==============================

export const createDeck = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    coverImageUrl: v.string(),
    category: v.string(),
    colorTheme: v.string(),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const deckId = await ctx.db.insert("decks", {
      title: args.title,
      description: args.description,
      coverImageUrl: args.coverImageUrl,
      category: args.category,
      colorTheme: args.colorTheme,
      totalCards: 0,
      isActive: true,
    });

    return deckId;
  },
});

export const updateDeck = mutation({
  args: {
    deckId: v.id("decks"),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    coverImageUrl: v.optional(v.string()),
    category: v.optional(v.string()),
    colorTheme: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");

    const updates: Record<string, any> = {};
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;
    if (args.coverImageUrl !== undefined) updates.coverImageUrl = args.coverImageUrl;
    if (args.category !== undefined) updates.category = args.category;
    if (args.colorTheme !== undefined) updates.colorTheme = args.colorTheme;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.deckId, updates);
  },
});

export const deleteDeck = mutation({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    // Delete all cards in this deck
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    for (const card of cards) {
      await ctx.db.delete(card._id);
    }

    // Delete the deck
    await ctx.db.delete(args.deckId);
  },
});

// ==============================
// CARD MUTATIONS
// ==============================

export const addCard = mutation({
  args: {
    deckId: v.id("decks"),
    imageUrl: v.string(),
    quote: v.string(),
    author: v.optional(v.string()),
    description: v.string(),
    story: v.optional(v.string()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const deck = await ctx.db.get(args.deckId);
    if (!deck) throw new Error("Deck not found");

    // Get current card count to determine cardNumber
    const existingCards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    const cardNumber = existingCards.length + 1;

    const cardId = await ctx.db.insert("cards", {
      deckId: args.deckId,
      imageUrl: args.imageUrl,
      quote: args.quote,
      author: args.author,
      description: args.description,
      story: args.story,
      caption: args.caption,
      cardNumber,
    });

    // Update deck's totalCards
    await ctx.db.patch(args.deckId, {
      totalCards: cardNumber,
    });

    return cardId;
  },
});

export const updateCard = mutation({
  args: {
    cardId: v.id("cards"),
    imageUrl: v.optional(v.string()),
    quote: v.optional(v.string()),
    author: v.optional(v.string()),
    description: v.optional(v.string()),
    story: v.optional(v.string()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    const updates: Record<string, any> = {};
    if (args.imageUrl !== undefined) updates.imageUrl = args.imageUrl;
    if (args.quote !== undefined) updates.quote = args.quote;
    if (args.author !== undefined) updates.author = args.author;
    if (args.description !== undefined) updates.description = args.description;
    if (args.story !== undefined) updates.story = args.story;
    if (args.caption !== undefined) updates.caption = args.caption;

    await ctx.db.patch(args.cardId, updates);
  },
});

export const deleteCard = mutation({
  args: { cardId: v.id("cards") },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    const card = await ctx.db.get(args.cardId);
    if (!card) throw new Error("Card not found");

    const deckId = card.deckId;

    // Delete the card
    await ctx.db.delete(args.cardId);

    // Recalculate totalCards and renumber remaining cards
    const remainingCards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", deckId))
      .collect();

    // Sort by cardNumber and renumber
    remainingCards.sort((a, b) => a.cardNumber - b.cardNumber);
    for (let i = 0; i < remainingCards.length; i++) {
      if (remainingCards[i].cardNumber !== i + 1) {
        await ctx.db.patch(remainingCards[i]._id, { cardNumber: i + 1 });
      }
    }

    // Update deck totalCards
    const deck = await ctx.db.get(deckId);
    if (deck) {
      await ctx.db.patch(deckId, { totalCards: remainingCards.length });
    }
  },
});

// ==============================
// ADMIN QUERIES
// ==============================

// List all decks (including inactive ones)
export const listAllDecks = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user || user.email !== ADMIN_EMAIL) return [];

    return await ctx.db.query("decks").collect();
  },
});

// List all cards in a deck
export const listCards = query({
  args: { deckId: v.id("decks") },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    const user = await ctx.db.get(userId);
    if (!user || user.email !== ADMIN_EMAIL) return [];

    const cards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", args.deckId))
      .collect();

    return cards.sort((a, b) => a.cardNumber - b.cardNumber);
  },
});

// Check if current user is admin
export const isAdmin = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return false;
    const user = await ctx.db.get(userId);
    return user?.email === ADMIN_EMAIL;
  },
});
