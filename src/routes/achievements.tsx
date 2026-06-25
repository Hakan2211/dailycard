import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { SidebarLayout } from "@/components/SidebarLayout";
import { Sparkles, Flame, Trophy, Heart, Palette, Lock } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export const Route = createFileRoute("/achievements")({
  component: AchievementsPage,
});

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Flame,
  Trophy,
  Heart,
  Palette,
};

function AchievementsPage() {
  const user = useQuery(api.users.currentUser);
  const achievements = useQuery(api.achievements.listAchievements);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) navigate({ to: "/login" });
  }, [user, navigate]);

  if (user === null) return null;

  const unlockedCount =
    achievements?.filter((a) => a.unlockedAt !== null).length ?? 0;

  return (
    <SidebarLayout title="Achievements">
      <div className="space-y-6">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Achievements</h1>
          <p className="text-sm text-muted-foreground">
            {achievements
              ? `${unlockedCount} of ${achievements.length} unlocked`
              : "Loading…"}
          </p>
        </div>

        {achievements && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {achievements.map((a) => {
              const Icon = ICONS[a.icon] ?? Trophy;
              const unlocked = a.unlockedAt !== null;
              return (
                <div
                  key={a.key}
                  className={`flex items-center gap-4 rounded-xl border p-4 transition-colors ${
                    unlocked
                      ? "bg-card shadow-sm"
                      : "bg-muted/40 text-muted-foreground"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      unlocked
                        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow"
                        : "bg-muted"
                    }`}
                  >
                    {unlocked ? (
                      <Icon className="h-6 w-6" />
                    ) : (
                      <Lock className="h-5 w-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-foreground">{a.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {a.description}
                    </p>
                    {unlocked && (
                      <p className="mt-1 text-xs font-medium text-amber-600">
                        Unlocked{" "}
                        {new Date(a.unlockedAt as number).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </SidebarLayout>
  );
}
