import { query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { ACHIEVEMENTS } from "./achievementDefs";
import { currentStreak } from "./streakUtil";

/**
 * Evaluate all achievement criteria for a user and insert any newly-earned
 * ones. Safe to call after draws, favorites, and studio-card creation — it
 * dedupes against already-unlocked keys. Plain helper (not a Convex function)
 * so it can be invoked from other mutations.
 */
export async function maybeUnlock(ctx: MutationCtx, userId: Id<"users">) {
  const existing = await ctx.db
    .query("achievements")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .collect();
  const unlocked = new Set(existing.map((a) => a.key));

  const toUnlock: string[] = [];
  const add = (key: string, when: boolean) => {
    if (when && !unlocked.has(key)) toUnlock.push(key);
  };

  const draws = await ctx.db
    .query("drawHistory")
    .withIndex("by_user_and_date", (q) => q.eq("userId", userId))
    .collect();

  add("first_draw", draws.length > 0);

  const streak = currentStreak(draws.map((d) => d.date));
  add("streak_7", streak >= 7);
  add("streak_30", streak >= 30);

  const completion = await ctx.db
    .query("deckCompletions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  add("deck_complete", !!completion);

  const favorite = await ctx.db
    .query("favorites")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  add("first_favorite", !!favorite);

  const studioCard = await ctx.db
    .query("studioCards")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .first();
  add("first_studio_card", !!studioCard);

  const now = Date.now();
  for (const key of toUnlock) {
    await ctx.db.insert("achievements", { userId, key, unlockedAt: now });
  }
}

// List all achievements with the current user's unlock state.
export const listAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    const records = userId
      ? await ctx.db
          .query("achievements")
          .withIndex("by_user", (q) => q.eq("userId", userId))
          .collect()
      : [];
    const unlockedAt = new Map(records.map((r) => [r.key, r.unlockedAt]));

    return ACHIEVEMENTS.map((def) => ({
      ...def,
      unlockedAt: unlockedAt.get(def.key) ?? null,
    }));
  },
});
