import { cn } from "@/lib/utils";
import { getCardBackHex } from "@/lib/cardTheme";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { CopyCaptionButton } from "@/components/CopyCaptionButton";
import { curatedCardToDesign } from "@/lib/studioDesign";
import type { CardFaceData } from "@/components/CardFace";

/**
 * Large, two-pane presentation of a single card for the immersive deck browser.
 * The full artwork (never cropped — `object-contain` on a soft matte) sits beside
 * the quote/story on desktop and stacks above it on mobile. Dark glass surface
 * with a faint deck-tinted glow; actions use the `glass` button variant so the
 * labels stay legible on the dark card.
 */
export function FeatureCard({
  card,
  deckTitle,
  colorTheme,
  className,
}: {
  card: CardFaceData;
  deckTitle: string;
  colorTheme?: string;
  className?: string;
}) {
  const glow = getCardBackHex(colorTheme);

  return (
    <div className={cn("relative w-full max-w-4xl", className)}>
      {/* Faint deck-tinted glow behind the card. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -inset-6 rounded-[2.5rem] opacity-40 blur-3xl"
        style={{
          background: `radial-gradient(closest-side, ${glow.from}, transparent)`,
        }}
      />

      <div className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] shadow-2xl ring-1 ring-white/10 backdrop-blur-xl md:flex-row">
        {/* Artwork — full image, never cropped. */}
        <div className="relative flex min-h-[280px] items-center justify-center bg-black/30 p-5 md:min-h-[520px] md:w-1/2 md:p-7">
          <img
            src={card.imageUrl}
            alt="Card illustration"
            draggable={false}
            className="max-h-[280px] w-auto max-w-full rounded-xl object-contain shadow-lg md:max-h-[460px]"
          />
        </div>

        {/* Text + actions. */}
        <div className="flex flex-1 flex-col justify-center gap-6 p-7 md:w-1/2 md:p-9">
          <div className="space-y-4">
            {/* German cards carry no text quote (it's baked into the image), so
                only render the blockquote when there's an actual quote. */}
            {card.quote?.trim() && (
              <blockquote className="text-xl font-medium italic leading-relaxed text-white md:text-2xl">
                &ldquo;{card.quote}&rdquo;
              </blockquote>
            )}
            {card.author && (
              <p className="text-sm font-semibold text-white/55">
                &mdash; {card.author}
              </p>
            )}
            <p className="text-[15px] leading-relaxed text-white/70">
              {card.story ?? card.description}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
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
              className="gap-2"
              label="Share"
            />
            {card.caption && (
              <CopyCaptionButton
                caption={card.caption}
                variant="glass"
                label="Caption"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
