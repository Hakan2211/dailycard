import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import type { Language } from "./pro";

/** A purchased SKU -> the language editions it grants. */
export function editionLanguages(
  edition: "en" | "de" | "both"
): Language[] {
  return edition === "both" ? ["en", "de"] : [edition];
}

/**
 * Grant a purchased edition to a user. Called only by the Stripe webhook
 * (internal.stripe.fulfill) after the signature is verified — never by clients.
 * Idempotent: languages are unioned, so webhook retries / re-delivery are safe.
 */
export const grantEdition = internalMutation({
  args: {
    userId: v.id("users"),
    edition: v.union(v.literal("en"), v.literal("de"), v.literal("both")),
  },
  handler: async (ctx, { userId, edition }) => {
    const user = await ctx.db.get(userId);
    if (!user) {
      console.error(`grantEdition: no user ${userId}`);
      return;
    }
    const langs = new Set<Language>([
      ...(user.editions ?? []),
      ...editionLanguages(edition),
    ]);
    // Canonical order: en before de.
    const editions = (["en", "de"] as const).filter((l) => langs.has(l));

    await ctx.db.patch(userId, {
      editions,
      isPro: true,
      plan: "pro",
      proSince: user.proSince ?? Date.now(),
    });
  },
});
