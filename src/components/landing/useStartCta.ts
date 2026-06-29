import { useAuthActions } from "@convex-dev/auth/react";
import { useCallback } from "react";

/** Shared CTA handler for the landing page — kicks off the Google sign-in flow.
 * Billing is deferred, so every "buy"/"start" button funnels through sign-in. */
export function useStartCta() {
  const { signIn } = useAuthActions();
  return useCallback(() => void signIn("google"), [signIn]);
}
