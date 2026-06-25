import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Master switch for Pro gating, mirrored from the server (convex/pro.ts).
 * Billing is deferred, so this is FALSE and all features are unlocked. Flip to
 * true alongside the server flag when a paywall is added.
 */
export const PRO_GATING_ENABLED = false;

export function useIsPro(): boolean {
  const user = useQuery(api.users.currentUser);
  return !!user?.isPro;
}

/**
 * Access state for a Pro-gated feature. `locked` is only ever true once gating
 * is enabled AND the user isn't Pro — so gate points are wired now but inert.
 */
export function useProAccess(): {
  isPro: boolean;
  locked: boolean;
  loading: boolean;
} {
  const user = useQuery(api.users.currentUser);
  const loading = user === undefined;
  const isPro = !!user?.isPro;
  const locked = PRO_GATING_ENABLED && !isPro && !loading;
  return { isPro, locked, loading };
}
