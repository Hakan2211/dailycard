import type { CardFaceData } from "@/components/CardFace";

/**
 * A drawn group card carries its own deck's title + colorTheme so each card in
 * a mixed hand (one card per random deck) can be badged and tinted on its own.
 * Mirrors the `MixedCard` shape returned by the `group.*` Convex functions.
 */
export type MixedCard = CardFaceData & {
  deckId: string;
  deckTitle: string;
  colorTheme: string;
};
