import { cn } from "@/lib/utils";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { CopyCaptionButton } from "@/components/CopyCaptionButton";
import { curatedCardToDesign } from "@/lib/studioDesign";

export interface CardFaceData {
  _id: string;
  imageUrl: string;
  quote: string;
  author?: string;
  description: string;
  story?: string;
  caption?: string;
  cardNumber: number;
}

/**
 * Presentational card: artwork on top, quote/author/reflection below, with an
 * optional Save / Share / Caption action row. Single source of truth for how a
 * curated card looks — used by the card modal, the Explore gallery, the Daily 3
 * spread, and group hands.
 */
export function CardFace({
  card,
  deckTitle,
  showActions = true,
  clamp = true,
  className,
}: {
  card: CardFaceData;
  deckTitle: string;
  showActions?: boolean;
  /** Clamp the reflection text (for fixed-height layouts like the modal). */
  clamp?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.04] shadow-xl ring-1 ring-white/10 backdrop-blur-xl",
        className
      )}
    >
      {/* Card Image — full image on a soft matte, never cropped. */}
      <div className="relative flex h-44 shrink-0 items-center justify-center overflow-hidden bg-black/30">
        <img
          src={card.imageUrl}
          alt="Card illustration"
          className="h-full w-full object-contain p-3"
        />
      </div>

      {/* Card Text Content */}
      <div className="flex flex-1 flex-col justify-between p-4">
        <div className="space-y-2">
          <blockquote className="text-sm font-medium italic leading-relaxed text-white">
            &ldquo;{card.quote}&rdquo;
          </blockquote>
          {card.author && (
            <p className="text-xs font-semibold text-white/55">
              &mdash; {card.author}
            </p>
          )}
          <p
            className={cn(
              "text-xs leading-relaxed text-white/70",
              clamp && "line-clamp-4"
            )}
          >
            {card.story ?? card.description}
          </p>
        </div>

        {showActions && (
          <div className="mt-3 flex gap-2">
            <FavoriteButton cardId={card._id} variant="glass" />
            <ShareButton
              variant="glass"
              design={curatedCardToDesign({
                quote: card.quote,
                author: card.author,
                imageUrl: card.imageUrl,
                deckTitle,
              })}
              caption={card.caption}
              filename={`dailycard-${card.cardNumber}.png`}
              className="flex-1 gap-2"
              label="Share"
            />
            {card.caption && (
              <CopyCaptionButton
                caption={card.caption}
                variant="glass"
                label={null}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
