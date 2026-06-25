import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { requirePro } from "./pro";

const kind = v.union(v.literal("curated"), v.literal("studio"));

// Queue a card to share at a future time.
export const createScheduledShare = mutation({
  args: {
    kind,
    cardId: v.optional(v.id("cards")),
    studioCardId: v.optional(v.id("studioCards")),
    scheduledFor: v.number(),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await requirePro(ctx); // Scheduling is a Pro feature (no-op while deferred)
    if (args.kind === "curated" && !args.cardId)
      throw new Error("cardId required");
    if (args.kind === "studio" && !args.studioCardId)
      throw new Error("studioCardId required");

    return await ctx.db.insert("scheduledShares", {
      userId,
      kind: args.kind,
      cardId: args.cardId,
      studioCardId: args.studioCardId,
      scheduledFor: args.scheduledFor,
      caption: args.caption,
      status: "scheduled",
      createdAt: Date.now(),
    });
  },
});

// Active queue (scheduled + reminded), enriched and time-sorted.
export const listScheduledShares = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    const rows = await ctx.db
      .query("scheduledShares")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    const active = rows
      .filter((r) => r.status === "scheduled" || r.status === "reminded")
      .sort((a, b) => a.scheduledFor - b.scheduledFor);

    return await Promise.all(
      active.map(async (row) => {
        if (row.kind === "curated" && row.cardId) {
          const card = await ctx.db.get(row.cardId);
          const deck = card ? await ctx.db.get(card.deckId) : null;
          return { share: row, card, deck, studioCard: null };
        }
        if (row.kind === "studio" && row.studioCardId) {
          const studioCard = await ctx.db.get(row.studioCardId);
          const backgroundStorageUrl = studioCard?.backgroundStorageId
            ? await ctx.storage.getUrl(studioCard.backgroundStorageId)
            : null;
          return {
            share: row,
            card: null,
            deck: null,
            studioCard: studioCard ? { ...studioCard, backgroundStorageUrl } : null,
          };
        }
        return { share: row, card: null, deck: null, studioCard: null };
      })
    );
  },
});

// Count of due reminders (for the sidebar badge).
export const remindedCount = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const rows = await ctx.db
      .query("scheduledShares")
      .withIndex("by_user_and_status", (q) =>
        q.eq("userId", userId).eq("status", "reminded")
      )
      .collect();
    return rows.length;
  },
});

async function requireOwned(
  ctx: { db: any },
  userId: string,
  id: any
) {
  const row = await ctx.db.get(id);
  if (!row || row.userId !== userId) throw new Error("Not found");
  return row;
}

export const updateScheduledShare = mutation({
  args: {
    id: v.id("scheduledShares"),
    scheduledFor: v.optional(v.number()),
    caption: v.optional(v.string()),
  },
  handler: async (ctx, { id, scheduledFor, caption }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await requireOwned(ctx, userId, id);

    const patch: Record<string, unknown> = {};
    if (scheduledFor !== undefined) {
      patch.scheduledFor = scheduledFor;
      patch.status = "scheduled"; // re-arm if it was already reminded
      patch.remindedAt = undefined;
    }
    if (caption !== undefined) patch.caption = caption;
    await ctx.db.patch(id, patch);
  },
});

export const cancelScheduledShare = mutation({
  args: { id: v.id("scheduledShares") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await requireOwned(ctx, userId, id);
    await ctx.db.patch(id, { status: "cancelled" });
  },
});

export const markShareDone = mutation({
  args: { id: v.id("scheduledShares") },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    await requireOwned(ctx, userId, id);
    await ctx.db.patch(id, { status: "done" });
  },
});

// Cron-driven: flip due "scheduled" rows to "reminded". In v1 the reminder is
// in-app (sidebar badge + highlighted row). Email/push delivery is deferred to
// reminders.ts.
export const processDueReminders = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const due = await ctx.db
      .query("scheduledShares")
      .withIndex("by_status_and_time", (q) =>
        q.eq("status", "scheduled").lte("scheduledFor", now)
      )
      .collect();

    for (const row of due) {
      await ctx.db.patch(row._id, { status: "reminded", remindedAt: now });
    }
    return { processed: due.length };
  },
});
