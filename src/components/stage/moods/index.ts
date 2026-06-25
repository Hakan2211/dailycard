import type { MoodId, MoodPreset } from "./types";
import { cosmicNebula } from "./cosmicNebula";
import { darkStudio } from "./darkStudio";
import { mystical } from "./mystical";
import { iridescentGlass } from "./iridescentGlass";

export type { MoodId, MoodPreset } from "./types";

export const MOODS: Record<MoodId, MoodPreset> = {
  cosmicNebula,
  darkStudio,
  mystical,
  iridescentGlass,
};

/** The launch mood. Swap this (or pass a `mood` prop) to prototype others. */
export const DEFAULT_MOOD_ID: MoodId = "darkStudio";

export function getMood(id: MoodId | undefined): MoodPreset {
  return MOODS[id ?? DEFAULT_MOOD_ID] ?? MOODS[DEFAULT_MOOD_ID];
}

/** Ordered list for pickers. */
export const MOOD_LIST: MoodPreset[] = [
  cosmicNebula,
  darkStudio,
  mystical,
  iridescentGlass,
];
