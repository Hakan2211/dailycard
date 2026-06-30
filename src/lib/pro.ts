import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";

/**
 * Master switch for content gating, mirrored from the server (convex/pro.ts).
 * ON now that Stripe checkout grants per-edition entitlements. Flip in tandem
 * with the server flag if everything ever needs to be opened up.
 */
export const PRO_GATING_ENABLED = true;

/** Decks (per language) anyone can play before buying that edition. */
export const FREE_DECK_LIMIT = 2;

export type Language = "en" | "de";

/** A deck's edition, treating legacy/untagged rows as English. */
export function deckLang(deck: { language?: Language }): Language {
  return deck.language ?? "en";
}

/** The languages the current user owns (empty while loading / logged out). */
export function useOwnedEditions(): Language[] {
  const user = useQuery(api.users.currentUser);
  return user?.editions ?? [];
}

export function useIsPro(): boolean {
  return useOwnedEditions().length > 0;
}

/**
 * Access state for an any-edition gated feature (e.g. Studio). `locked` is true
 * only when gating is on and the user owns no edition.
 */
export function useProAccess(): {
  isPro: boolean;
  locked: boolean;
  loading: boolean;
} {
  const user = useQuery(api.users.currentUser);
  const loading = user === undefined;
  const isPro = (user?.editions ?? []).length > 0;
  const locked = PRO_GATING_ENABLED && !isPro && !loading;
  return { isPro, locked, loading };
}

/** Whether the current user owns a given edition. */
export function useOwnsEdition(lang: Language): boolean {
  return useOwnedEditions().includes(lang);
}
