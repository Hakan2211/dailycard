import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { maybeUnlock } from "./achievements";
import { requirePro } from "./pro";

const backgroundType = v.union(
  v.literal("color"),
  v.literal("gradient"),
  v.literal("image")
);

// Create a new studio card
export const createStudioCard = mutation({
  args: {
    title: v.optional(v.string()),
    quote: v.string(),
    author: v.optional(v.string()),
    backgroundType,
    backgroundValue: v.string(),
    backgroundStorageId: v.optional(v.id("_storage")),
    fontFamily: v.string(),
    textColor: v.string(),
    layout: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await requirePro(ctx); // Studio is a Pro feature (no-op while gating deferred)

    const now = Date.now();
    const cardId = await ctx.db.insert("studioCards", {
      userId,
      ...args,
      createdAt: now,
      updatedAt: now,
    });
    await maybeUnlock(ctx, userId);
    return cardId;
  },
});

// Update an existing studio card (only the owner)
export const updateStudioCard = mutation({
  args: {
    cardId: v.id("studioCards"),
    title: v.optional(v.string()),
    quote: v.optional(v.string()),
    author: v.optional(v.string()),
    backgroundType: v.optional(backgroundType),
    backgroundValue: v.optional(v.string()),
    backgroundStorageId: v.optional(v.id("_storage")),
    fontFamily: v.optional(v.string()),
    textColor: v.optional(v.string()),
    layout: v.optional(v.string()),
  },
  handler: async (ctx, { cardId, ...fields }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(cardId);
    if (!card || card.userId !== userId) {
      throw new Error("Card not found");
    }

    const patch: Record<string, unknown> = { updatedAt: Date.now() };
    for (const [key, value] of Object.entries(fields)) {
      if (value !== undefined) patch[key] = value;
    }

    await ctx.db.patch(cardId, patch);
    return cardId;
  },
});

// Delete a studio card (only the owner)
export const deleteStudioCard = mutation({
  args: { cardId: v.id("studioCards") },
  handler: async (ctx, { cardId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const card = await ctx.db.get(cardId);
    if (!card || card.userId !== userId) {
      throw new Error("Card not found");
    }

    await ctx.db.delete(cardId);
  },
});

// Get a single studio card (only the owner)
export const getStudioCard = query({
  args: { cardId: v.id("studioCards") },
  handler: async (ctx, { cardId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const card = await ctx.db.get(cardId);
    if (!card || card.userId !== userId) return null;
    return card;
  },
});

// List the current user's studio cards (newest first)
export const listMyStudioCards = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const cards = await ctx.db
      .query("studioCards")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Resolve any uploaded background storage URLs.
    return await Promise.all(
      cards
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .map(async (card) => ({
          ...card,
          backgroundStorageUrl: card.backgroundStorageId
            ? await ctx.storage.getUrl(card.backgroundStorageId)
            : null,
        }))
    );
  },
});

// Generate a short-lived upload URL for a custom background image.
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    return await ctx.storage.generateUploadUrl();
  },
});

// Resolve a storage id to a served (CORS-clean) URL.
export const getStorageUrl = query({
  args: { storageId: v.id("_storage") },
  handler: async (ctx, { storageId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.storage.getUrl(storageId);
  },
});
