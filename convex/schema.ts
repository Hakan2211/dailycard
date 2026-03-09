import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // Override the default users table with any custom fields we need
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phone: v.optional(v.string()),
    phoneVerificationTime: v.optional(v.number()),
    isAnonymous: v.optional(v.boolean()),
  }).index("email", ["email"]),

  // Card decks (e.g., "Mindful Animals", "Wisdom of Trees", "Motivation & Success")
  decks: defineTable({
    title: v.string(),
    description: v.string(),
    coverImageUrl: v.string(),
    category: v.string(), // "animals", "trees", "motivation"
    totalCards: v.number(),
    isActive: v.boolean(),
    colorTheme: v.string(), // Tailwind color for UI accents (e.g., "emerald", "amber", "violet")
  }),

  // Individual cards within a deck
  cards: defineTable({
    deckId: v.id("decks"),
    imageUrl: v.string(),
    quote: v.string(),
    author: v.optional(v.string()),
    description: v.string(),
    cardNumber: v.number(), // Position in deck (1-N)
  }).index("by_deck", ["deckId"]),

  // Tracks every card draw a user makes
  drawHistory: defineTable({
    userId: v.id("users"),
    deckId: v.id("decks"),
    cardId: v.id("cards"),
    date: v.string(), // "YYYY-MM-DD" for easy calendar querying
  })
    .index("by_user_and_date", ["userId", "date"])
    .index("by_user_and_deck", ["userId", "deckId"])
    .index("by_user_deck_date", ["userId", "deckId", "date"]),

  // Track deck completions for celebration/trophies
  deckCompletions: defineTable({
    userId: v.id("users"),
    deckId: v.id("decks"),
    completedAt: v.string(), // ISO date string
    totalDaysToComplete: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_deck", ["userId", "deckId"]),
});
