import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { auth } from "./auth";

const http = httpRouter();

auth.addHttpRoutes(http);

// Stripe webhook. Verification + fulfillment happen in the Node action
// internal.stripe.fulfill (the Stripe SDK needs Node); this route just relays
// the raw body + signature. Bad/unsigned payloads -> 400 (no entitlement).
http.route({
  path: "/stripe/webhook",
  method: "POST",
  handler: httpAction(async (ctx, request) => {
    const signature = request.headers.get("stripe-signature");
    if (!signature) return new Response("Missing stripe-signature", { status: 400 });

    const body = await request.text();
    const { ok } = await ctx.runAction(internal.stripe.fulfill, { body, signature });
    return new Response(null, { status: ok ? 200 : 400 });
  }),
});

export default http;
