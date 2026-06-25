import type { QueryCtx, MutationCtx } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Master switch for Pro gating. Billing is intentionally deferred, so this is
 * FALSE — every feature is unlocked for everyone. When a real paywall +
 * checkout is added, flip this to true (and set users.isPro on upgrade). All
 * gate points already branch on it, so no restructuring is needed.
 */
export const PRO_GATING_ENABLED = false;

/** How many decks a free user can access once gating is on. */
export const FREE_DECK_LIMIT = 2;

export async function isProUser(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return false;
  const user = await ctx.db.get(userId);
  return !!user?.isPro;
}

/** Throws when gating is on and the user isn't Pro. No-op while deferred. */
export async function requirePro(ctx: MutationCtx) {
  if (!PRO_GATING_ENABLED) return;
  const pro = await isProUser(ctx);
  if (!pro) throw new Error("This feature requires DailyCard Pro.");
}
