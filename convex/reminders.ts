import { internalAction } from "./_generated/server";
import { v } from "convex/values";

/**
 * Delivery step for a scheduled-share reminder.
 *
 * DEFERRED: real out-of-app delivery needs external infra that isn't wired yet:
 *   - Email: add a provider (e.g. Resend/SendGrid) API key as a Convex env var
 *     and fetch() it from here (actions can do network I/O; mutations can't).
 *   - Web Push: a service worker + VAPID keys + a `pushSubscriptions` table,
 *     then send via the Web Push protocol from here.
 *
 * For v1 the reminder is purely in-app (schedule.processDueReminders flips the
 * row to "reminded"; the sidebar badge + Scheduled page surface it). This stub
 * exists so the delivery path is easy to add later without restructuring.
 */
export const sendReminder = internalAction({
  args: { shareId: v.id("scheduledShares") },
  handler: async (_ctx, { shareId }) => {
    // TODO: send email / web-push here once infra is configured.
    console.log(`[reminders] (stub) would notify for share ${shareId}`);
  },
});
