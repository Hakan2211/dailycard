import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Heart, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

/** Heart toggle for a curated or studio card. */
export function FavoriteButton({
  cardId,
  studioCardId,
  className,
  variant = "outline",
}: {
  cardId?: string;
  studioCardId?: string;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const favorited = useQuery(
    api.favorites.isFavorited,
    cardId
      ? { cardId: cardId as Id<"cards"> }
      : { studioCardId: studioCardId as Id<"studioCards"> }
  );
  const toggle = useMutation(api.favorites.toggleFavorite);
  const [busy, setBusy] = useState(false);

  async function onClick(e: React.MouseEvent) {
    e.stopPropagation();
    setBusy(true);
    try {
      await toggle(
        cardId
          ? { kind: "curated", cardId: cardId as Id<"cards"> }
          : { kind: "studio", studioCardId: studioCardId as Id<"studioCards"> }
      );
    } catch (err) {
      console.error("Favorite toggle failed", err);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size="sm"
      className={className}
      onClick={onClick}
      disabled={busy || favorited === undefined}
    >
      {busy ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Heart
          className={`h-3.5 w-3.5 ${
            favorited ? "fill-rose-500 text-rose-500" : ""
          }`}
        />
      )}
      {favorited ? "Saved" : "Save"}
    </Button>
  );
}
