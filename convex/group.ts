import { mutation, query, internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";

const HAND_SIZE = 5;
const SESSION_TTL_MS = 6 * 60 * 60 * 1000; // 6 hours
const MAX_PLAYERS = 10;
// Unambiguous charset (no 0/O/1/I) for human-friendly join codes.
const CODE_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

// A drawn card carries its own deck's title + colorTheme so each card in a
// mixed hand can be themed independently on the client.
export type MixedCard = Doc<"cards"> & { deckTitle: string; colorTheme: string };

function randomCode(len = 4): string {
  let out = "";
  for (let i = 0; i < len; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

async function findOpenSessionByCode(ctx: MutationCtx, code: string) {
  return await ctx.db
    .query("groupSessions")
    .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
    .filter((q) => q.eq(q.field("status"), "open"))
    .first();
}

async function displayName(ctx: MutationCtx, userId: Id<"users">): Promise<string> {
  const user = await ctx.db.get(userId);
  return user?.name?.split(" ")[0] ?? "Player";
}

/**
 * Deal a hand of `n` cards, one from each of `n` different random decks (like
 * Daily 3 but bigger). When there are fewer than `n` active decks the deck list
 * cycles, but the cards themselves always stay distinct. May return fewer than
 * `n` if the catalog can't supply that many distinct cards — callers tolerate a
 * short hand, same as the Daily 3 spread.
 */
async function drawMixedHand(
  ctx: QueryCtx | MutationCtx,
  n: number
): Promise<MixedCard[]> {
  const decks = await ctx.db
    .query("decks")
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();
  if (decks.length === 0) return [];

  // Fisher–Yates shuffle the decks so distinct decks come first.
  for (let i = decks.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [decks[i], decks[j]] = [decks[j], decks[i]];
  }

  const used = new Set<string>();
  const hand: MixedCard[] = [];

  // Walk the shuffled deck list; cycle it when n exceeds the deck count.
  let di = 0;
  const maxSteps = decks.length * n;
  while (hand.length < n && di < maxSteps) {
    const deck = decks[di % decks.length];
    di++;
    const cards = await ctx.db
      .query("cards")
      .withIndex("by_deck", (q) => q.eq("deckId", deck._id))
      .collect();
    const pool = cards.filter((c) => !used.has(c._id as string));
    if (pool.length === 0) continue; // deck exhausted for this hand
    const pick = pool[Math.floor(Math.random() * pool.length)];
    used.add(pick._id as string);
    hand.push({ ...pick, deckTitle: deck.title, colorTheme: deck.colorTheme });
  }
  return hand;
}

// Host creates a room and is added as the first participant. Rooms always deal
// a mixed hand from many decks, so no deck is chosen at creation.
export const createSession = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Generate a unique code (retry on the rare collision).
    let code = randomCode();
    for (let attempt = 0; attempt < 8; attempt++) {
      const clash = await ctx.db
        .query("groupSessions")
        .withIndex("by_code", (q) => q.eq("code", code))
        .first();
      if (!clash) break;
      code = randomCode();
    }

    const now = Date.now();
    const sessionId = await ctx.db.insert("groupSessions", {
      code,
      hostUserId: userId,
      status: "open",
      createdAt: now,
    });

    await ctx.db.insert("groupParticipants", {
      sessionId,
      userId,
      name: await displayName(ctx, userId),
      cardIds: [],
      joinedAt: now,
    });

    return { sessionId, code };
  },
});

// Join an open room by code. Idempotent — re-joining returns the existing seat.
export const joinSession = mutation({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await findOpenSessionByCode(ctx, code);
    if (!session) throw new Error("Room not found or already closed");

    const existing = await ctx.db
      .query("groupParticipants")
      .withIndex("by_session_and_user", (q) =>
        q.eq("sessionId", session._id).eq("userId", userId)
      )
      .first();

    if (!existing) {
      await ctx.db.insert("groupParticipants", {
        sessionId: session._id,
        userId,
        name: await displayName(ctx, userId),
        cardIds: [],
        joinedAt: Date.now(),
      });
    }

    return { sessionId: session._id, code: session.code };
  },
});

// Rename your own seat in a room.
export const renameParticipant = mutation({
  args: { sessionId: v.id("groupSessions"), name: v.string() },
  handler: async (ctx, { sessionId, name }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const participant = await ctx.db
      .query("groupParticipants")
      .withIndex("by_session_and_user", (q) =>
        q.eq("sessionId", sessionId).eq("userId", userId)
      )
      .first();
    if (!participant) throw new Error("You have not joined this room");

    const trimmed = name.trim().slice(0, 24);
    if (!trimmed) throw new Error("Name cannot be empty");

    await ctx.db.patch(participant._id, { name: trimmed });
    return { name: trimmed };
  },
});

// Draw (or re-draw) the caller's hand — 5 cards from 5 different random decks.
// Not persisted to drawHistory — this is ephemeral.
export const drawHand = mutation({
  args: { sessionId: v.id("groupSessions") },
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const session = await ctx.db.get(sessionId);
    if (!session) throw new Error("Room not found");

    const participant = await ctx.db
      .query("groupParticipants")
      .withIndex("by_session_and_user", (q) =>
        q.eq("sessionId", sessionId).eq("userId", userId)
      )
      .first();
    if (!participant) throw new Error("You have not joined this room");

    const hand = await drawMixedHand(ctx, HAND_SIZE);
    await ctx.db.patch(participant._id, { cardIds: hand.map((c) => c._id) });
    return { count: hand.length };
  },
});

// Pass & Play: deal `players` independent mixed hands. Writes nothing — purely
// returns the dealt cards for a single device. Each hand mixes several decks.
export const dealMixedHands = mutation({
  args: { players: v.number() },
  handler: async (ctx, { players }) => {
    const n = Math.max(1, Math.min(MAX_PLAYERS, Math.floor(players)));
    const hands: MixedCard[][] = [];
    for (let p = 0; p < n; p++) {
      hands.push(await drawMixedHand(ctx, HAND_SIZE));
    }
    return { hands };
  },
});

// Host closes the room (or anyone can leave their seat).
export const closeSession = mutation({
  args: { sessionId: v.id("groupSessions") },
  handler: async (ctx, { sessionId }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");
    const session = await ctx.db.get(sessionId);
    if (!session) return;
    if (session.hostUserId !== userId) throw new Error("Only the host can close the room");
    await ctx.db.patch(sessionId, { status: "closed" });
  },
});

// Live, reactive view of a room: session + every participant's hand, where each
// card is annotated with its own deck's title + colorTheme for theming.
export const getSession = query({
  args: { code: v.string() },
  handler: async (ctx, { code }) => {
    const userId = await getAuthUserId(ctx);

    const session = await ctx.db
      .query("groupSessions")
      .withIndex("by_code", (q) => q.eq("code", code.toUpperCase()))
      .first();
    if (!session) return null;

    const participantDocs = await ctx.db
      .query("groupParticipants")
      .withIndex("by_session", (q) => q.eq("sessionId", session._id))
      .collect();
    participantDocs.sort((a, b) => a.joinedAt - b.joinedAt);

    // Fetch each distinct deck at most once.
    const deckCache = new Map<string, Doc<"decks"> | null>();
    async function getDeck(id: Id<"decks">) {
      const key = id as string;
      if (!deckCache.has(key)) deckCache.set(key, await ctx.db.get(id));
      return deckCache.get(key) ?? null;
    }

    const participants = await Promise.all(
      participantDocs.map(async (p) => {
        const rawCards = (
          await Promise.all(p.cardIds.map((id) => ctx.db.get(id)))
        ).filter((c): c is Doc<"cards"> => c !== null);
        const cards: MixedCard[] = await Promise.all(
          rawCards.map(async (c) => {
            const deck = await getDeck(c.deckId);
            return {
              ...c,
              deckTitle: deck?.title ?? "",
              colorTheme: deck?.colorTheme ?? "emerald",
            };
          })
        );
        return {
          _id: p._id,
          userId: p.userId,
          name: p.name,
          isMe: !!userId && p.userId === userId,
          cards,
        };
      })
    );

    return {
      _id: session._id,
      code: session.code,
      status: session.status,
      hostUserId: session.hostUserId,
      isHost: !!userId && session.hostUserId === userId,
      participants,
    };
  },
});

// Cron: delete stale rooms (and their participants) so nothing lingers.
export const cleanupStale = internalMutation({
  args: {},
  handler: async (ctx) => {
    const cutoff = Date.now() - SESSION_TTL_MS;
    const sessions = await ctx.db.query("groupSessions").collect();
    for (const session of sessions) {
      if (session.createdAt >= cutoff) continue;
      const parts = await ctx.db
        .query("groupParticipants")
        .withIndex("by_session", (q) => q.eq("sessionId", session._id))
        .collect();
      for (const p of parts) await ctx.db.delete(p._id);
      await ctx.db.delete(session._id);
    }
  },
});
