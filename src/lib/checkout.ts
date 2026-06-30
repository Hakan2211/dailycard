import { useAction } from "convex/react";
import { useCallback, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { EditionCode } from "@/components/landing/content";

/**
 * Starts a Stripe Checkout for the given SKU and redirects the browser to it.
 * Used by every in-app "buy / upgrade" surface. The user must be signed in
 * (the action resolves them via auth); landing CTAs route to /login first.
 */
export function useStartCheckout() {
  const createSession = useAction(api.stripe.createCheckoutSession);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const start = useCallback(
    async (edition: EditionCode) => {
      setLoading(true);
      setError(null);
      try {
        const { url } = await createSession({ edition });
        window.location.href = url;
      } catch (err) {
        console.error("Failed to start checkout", err);
        setError("Could not start checkout. Please try again.");
        setLoading(false);
      }
    },
    [createSession]
  );

  return { start, loading, error };
}
