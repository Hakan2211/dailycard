// Canonical achievement definitions. The DB only stores unlock records (key +
// time); all display metadata lives here and is shared with the frontend.

export interface AchievementDef {
  key: string;
  title: string;
  description: string;
  /** lucide-react icon name, mapped to a component on the client */
  icon: string;
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    key: "first_draw",
    title: "First Draw",
    description: "Draw your very first card.",
    icon: "Sparkles",
  },
  {
    key: "streak_7",
    title: "Week Streak",
    description: "Draw cards 7 days in a row.",
    icon: "Flame",
  },
  {
    key: "streak_30",
    title: "Monthly Devotion",
    description: "Draw cards 30 days in a row.",
    icon: "Flame",
  },
  {
    key: "deck_complete",
    title: "Deck Master",
    description: "Complete an entire deck.",
    icon: "Trophy",
  },
  {
    key: "first_favorite",
    title: "Curator",
    description: "Save your first favorite card.",
    icon: "Heart",
  },
  {
    key: "first_studio_card",
    title: "Designer",
    description: "Create your first card in the Studio.",
    icon: "Palette",
  },
];
