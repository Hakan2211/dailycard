"use node";

import { action, internalAction } from "./_generated/server";
import { api, internal } from "./_generated/api";
import { v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import Stripe from "stripe";

const EDITION = v.union(v.literal("en"), v.literal("de"), v.literal("both"));

function stripeClient(): Stripe {
  const secret = process.env.STRIPE_SECRET_KEY;
  if (!secret) throw new Error("STRIPE_SECRET_KEY is not set in Convex env");
  return new Stripe(secret);
}

/** Stripe Price ID for a SKU, from Convex env (set with `npx convex env set`). */
function priceFor(edition: "en" | "de" | "both"): string {
  const id = {
    en: process.env.STRIPE_PRICE_EN,
    de: process.env.STRIPE_PRICE_DE,
    both: process.env.STRIPE_PRICE_BOTH,
  }[edition];
  if (!id) throw new Error(`No Stripe price configured for edition "${edition}"`);
  return id;
}

/**
 * Create a one-time Checkout Session for the signed-in user and return its URL.
 * The client redirects the browser to it. The purchase is tied to the user via
 * client_reference_id + metadata.userId so the webhook can grant the edition.
 */
export const createCheckoutSession = action({
  args: { edition: EDITION },
  handler: async (ctx, { edition }) => {
    const stripe = stripeClient();

    const user = await ctx.runQuery(api.users.currentUser);
    if (!user) throw new Error("Not authenticated");

    const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceFor(edition), quantity: 1 }],
      client_reference_id: user._id,
      customer_email: user.email ?? undefined,
      metadata: { userId: user._id, edition },
      success_url: `${siteUrl}/?checkout=success`,
      cancel_url: `${siteUrl}/?checkout=cancel`,
      allow_promotion_codes: true,
    });

    if (!session.url) throw new Error("Stripe did not return a checkout URL");
    return { url: session.url };
  },
});

/**
 * Verify a Stripe webhook payload and fulfill it. Called by the httpAction in
 * http.ts (which can't run the Node Stripe SDK directly). Signature failures
 * return ok:false so the endpoint replies 400 and Stripe retries.
 */
export const fulfill = internalAction({
  args: { body: v.string(), signature: v.string() },
  handler: async (ctx, { body, signature }): Promise<{ ok: boolean }> => {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) throw new Error("STRIPE_WEBHOOK_SECRET is not set");
    const stripe = stripeClient();

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err);
      return { ok: false };
    }

    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const userId = session.metadata?.userId;
      const edition = session.metadata?.edition;
      if (userId && (edition === "en" || edition === "de" || edition === "both")) {
        await ctx.runMutation(internal.entitlements.grantEdition, {
          userId: userId as Id<"users">,
          edition,
        });
      } else {
        console.error(
          "checkout.session.completed missing/invalid metadata:",
          session.id
        );
      }
    }

    return { ok: true };
  },
});
