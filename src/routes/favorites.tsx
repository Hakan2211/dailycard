import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { SidebarLayout } from "@/components/SidebarLayout";
import { ComingSoon } from "@/components/ComingSoon";
import { FavoriteButton } from "@/components/FavoriteButton";
import { ShareButton } from "@/components/ShareButton";
import { StudioPreview } from "@/components/studio/StudioPreview";
import { FeatureCard } from "@/components/stage/FeatureCard";
import { Heart } from "lucide-react";
import { studioDocToDesign } from "@/lib/studioDesign";

export const Route = createFileRoute("/favorites")({
  component: FavoritesPage,
});

function FavoritesPage() {
  const user = useQuery(api.users.currentUser);
  const favorites = useQuery(api.favorites.listFavorites);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) navigate({ to: "/login" });
  }, [user, navigate]);

  if (user === null) return null;

  return (
    <SidebarLayout title="Favorites">
      {favorites === undefined ? (
        <p className="text-sm text-muted-foreground">Loading…</p>
      ) : favorites.length === 0 ? (
        <ComingSoon
          icon={Heart}
          title="No favorites yet"
          description="Tap Save on any card you draw or design, and it'll show up here."
        />
      ) : (
        <div className="mx-auto w-full max-w-4xl space-y-10">
          {favorites.map((fav) => {
            // Curated card → the same big side-by-side presentation as the deck
            // detail view (full uncropped art + quote/story + actions).
            if (fav.card) {
              return (
                <FeatureCard
                  key={fav.favorite._id}
                  card={fav.card}
                  deckTitle={fav.deck?.title ?? ""}
                  colorTheme={fav.deck?.colorTheme}
                />
              );
            }

            // Studio-designed card → its own dark glass panel.
            if (fav.studioCard) {
              const design = studioDocToDesign(fav.studioCard);
              return (
                <div
                  key={fav.favorite._id}
                  className="mx-auto flex w-full max-w-md flex-col items-center gap-4 rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm"
                >
                  <StudioPreview design={design} displaySize={280} />
                  <div className="flex w-full gap-2">
                    <FavoriteButton studioCardId={fav.studioCard._id} variant="glass" />
                    <ShareButton
                      design={design}
                      variant="glass"
                      className="flex-1 gap-2"
                      label="Share"
                    />
                  </div>
                </div>
              );
            }

            return null;
          })}
        </div>
      )}
    </SidebarLayout>
  );
}
