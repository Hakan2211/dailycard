import type { QueryCtx, MutationCtx } from "./_generated/server";
import type { Doc } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * Master switch for content gating. Now that real Stripe checkout grants
 * per-edition entitlements (users.editions), gating is ON: unpurchased users
 * only get the free preview decks; owners get every deck in their edition(s).
 * All gate points already branch on this, so it can still be flipped off in an
 * emergency to open everything.
 */
export const PRO_GATING_ENABLED = true;

/** How many decks (per language) anyone can play before buying that edition. */
export const FREE_DECK_LIMIT = 2;

export type Language = "en" | "de";

/** A deck's edition, treating legacy/untagged rows as English. */
export function deckLang(deck: Pick<Doc<"decks">, "language">): Language {
  return deck.language ?? "en";
}

/** The languages the signed-in user owns (empty when logged out / unpurchased). */
export async function getOwnedEditions(
  ctx: QueryCtx | MutationCtx
): Promise<Language[]> {
  const userId = await getAuthUserId(ctx);
  if (!userId) return [];
  const user = await ctx.db.get(userId);
  return user?.editions ?? [];
}

/** Whether the signed-in user owns a given edition. */
export async function ownsEdition(
  ctx: QueryCtx | MutationCtx,
  lang: Language
): Promise<boolean> {
  const editions = await getOwnedEditions(ctx);
  return editions.includes(lang);
}

/** Any-edition check, used by features gated behind "has paid at all" (Studio). */
export async function isProUser(
  ctx: QueryCtx | MutationCtx
): Promise<boolean> {
  const editions = await getOwnedEditions(ctx);
  return editions.length > 0;
}

/** Throws when gating is on and the user hasn't bought a (any) edition. */
export async function requirePro(ctx: MutationCtx) {
  if (!PRO_GATING_ENABLED) return;
  const pro = await isProUser(ctx);
  if (!pro) throw new Error("This feature requires a DailyCard edition.");
}

/** Throws when gating is on and the user doesn't own the given edition. */
export async function requireEdition(ctx: MutationCtx, lang: Language) {
  if (!PRO_GATING_ENABLED) return;
  if (!(await ownsEdition(ctx, lang))) {
    throw new Error(`This requires the ${lang.toUpperCase()} edition.`);
  }
}

/**
 * The active decks for one edition, each tagged with whether the current user
 * can play it. The first FREE_DECK_LIMIT decks (in creation order) are the free
 * preview, unlocked for everyone; the rest are locked until the edition is
 * owned. Shared by decks.listActive (display) and draw.drawDailyThree (play) so
 * the preview set is identical in both.
 */
export async function decksWithAccess(
  ctx: QueryCtx | MutationCtx,
  language: Language
): Promise<Array<{ deck: Doc<"decks">; locked: boolean }>> {
  const all = await ctx.db
    .query("decks")
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();
  const decks = all.filter((d) => deckLang(d) === language);

  const owned = !PRO_GATING_ENABLED || (await ownsEdition(ctx, language));
  return decks.map((deck, i) => ({
    deck,
    locked: !owned && i >= FREE_DECK_LIMIT,
  }));
}
