import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { StageLayout } from "@/components/StageLayout";
import { HandStack } from "@/components/group/HandStack";
import { PokerTable, type Seat } from "@/components/group/PokerTable";
import type { MixedCard } from "@/components/group/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Check,
  Copy,
  Dices,
  DoorOpen,
  Link2,
  Minus,
  Pencil,
  Plus,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useActiveLanguage } from "@/lib/language";

export const Route = createFileRoute("/group")({
  component: GroupPage,
  // Support invite deep-links like /group?room=ABCD — opens the Live Room tab
  // and auto-joins the room.
  validateSearch: (search: Record<string, unknown>): { room?: string } => {
    const room =
      typeof search.room === "string"
        ? search.room.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6)
        : "";
    return room ? { room } : {};
  },
});

const HAND_SIZE = 5;
const MIN_PLAYERS = 2;
const MAX_PLAYERS = 10;

const glassPanel =
  "rounded-2xl border border-white/10 bg-white/[0.04] backdrop-blur-xl";

function Initial({ name, me }: { name: string; me?: boolean }) {
  return (
    <span
      className={`flex size-9 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-semibold text-white ${
        me ? "ring-2 ring-white" : ""
      }`}
    >
      {name.charAt(0).toUpperCase() || "?"}
    </span>
  );
}

function GroupPage() {
  const { room } = Route.useSearch();
  const [tab, setTab] = useState<"local" | "live">(room ? "live" : "local");

  return (
    <StageLayout>
      <div className="mx-auto flex min-h-full w-full max-w-5xl flex-col gap-8 px-4 py-12">
        <header className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Group draw
          </h1>
          <p className="mx-auto max-w-md text-sm text-white/55">
            Everyone gets {HAND_SIZE} cards — one from each of five different
            decks — to share and reflect on together. Nothing is saved; these
            cards don't touch your collection.
          </p>
        </header>

        {/* Segmented control */}
        <div className="mx-auto inline-flex rounded-full border border-white/15 bg-white/5 p-1 backdrop-blur-xl">
          {(
            [
              { id: "local", label: "Pass & Play" },
              { id: "live", label: "Live Room" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-full px-5 py-1.5 text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-white/15 text-white shadow-sm"
                  : "text-white/55 hover:text-white"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {tab === "local" ? <PassAndPlay /> : <LiveRoom initialCode={room} />}
      </div>
    </StageLayout>
  );
}

// ==============================
// PASS & PLAY (one device)
// ==============================

function PassAndPlay() {
  const deal = useMutation(api.group.dealMixedHands);
  const { language } = useActiveLanguage();

  const [players, setPlayers] = useState(5);
  const [names, setNames] = useState<string[]>(() =>
    Array.from({ length: 5 }, (_, i) => `Player ${i + 1}`)
  );
  const [hands, setHands] = useState<MixedCard[][] | null>(null);
  const [current, setCurrent] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [dealing, setDealing] = useState(false);

  function changePlayers(next: number) {
    const n = Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, next));
    setPlayers(n);
    setNames((prev) =>
      Array.from({ length: n }, (_, i) => prev[i] ?? `Player ${i + 1}`)
    );
  }

  function setName(i: number, value: string) {
    setNames((prev) => prev.map((nm, idx) => (idx === i ? value : nm)));
  }

  const nameAt = (i: number) => names[i]?.trim() || `Player ${i + 1}`;

  async function start() {
    if (dealing) return;
    setDealing(true);
    try {
      const res = await deal({ players, language });
      setHands(res.hands as MixedCard[][]);
      setCurrent(0);
      setRevealed(false);
    } finally {
      setDealing(false);
    }
  }

  function reset() {
    setHands(null);
    setCurrent(0);
    setRevealed(false);
  }

  // ---- Setup ----
  if (!hands) {
    return (
      <div className={`space-y-6 ${glassPanel} p-6`}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-white">Players</label>
            <div className="flex items-center gap-3">
              <Button
                variant="glass"
                size="icon"
                onClick={() => changePlayers(players - 1)}
                disabled={players <= MIN_PLAYERS}
              >
                <Minus className="h-4 w-4" />
              </Button>
              <span className="w-8 text-center text-lg font-semibold text-white">
                {players}
              </span>
              <Button
                variant="glass"
                size="icon"
                onClick={() => changePlayers(players + 1)}
                disabled={players >= MAX_PLAYERS}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {names.map((nm, i) => (
              <Input
                key={i}
                value={nm}
                onChange={(e) => setName(i, e.target.value)}
                maxLength={24}
                placeholder={`Player ${i + 1}`}
                className="border-white/15 bg-white/5 text-white placeholder:text-white/40"
              />
            ))}
          </div>
        </div>

        <Button size="lg" className="gap-2" onClick={start} disabled={dealing}>
          <Dices className="h-5 w-5" />
          {dealing ? "Dealing…" : "Deal the cards"}
        </Button>
      </div>
    );
  }

  // ---- Finished: everyone's cards, stacked by player ----
  if (current >= hands.length) {
    return (
      <div className="space-y-10">
        <div className={`flex flex-wrap items-center justify-between gap-3 ${glassPanel} p-5`}>
          <div>
            <h2 className="text-xl font-semibold text-white">Everyone's cards</h2>
            <p className="text-sm text-white/55">
              Here's what each person drew — scroll through and share.
            </p>
          </div>
          <Button onClick={reset} className="gap-2">
            <Dices className="h-4 w-4" />
            Play again
          </Button>
        </div>

        {hands.map((hand, i) => (
          <section key={i} className="space-y-5">
            <div className="flex items-center gap-3 border-b border-white/10 pb-3">
              <Initial name={nameAt(i)} />
              <h3 className="text-lg font-semibold text-white">{nameAt(i)}</h3>
            </div>
            <HandStack cards={hand} />
          </section>
        ))}
      </div>
    );
  }

  // ---- Playing: pass interstitial ----
  if (!revealed) {
    return (
      <div className={`flex flex-col items-center gap-5 ${glassPanel} py-14 text-center`}>
        <Badge variant="outline" className="border-white/30 text-white">
          {current + 1} of {hands.length}
        </Badge>
        <p className="max-w-xs text-white/60">
          Pass the device to{" "}
          <strong className="text-white">{nameAt(current)}</strong>. When you're
          ready, reveal your {HAND_SIZE} cards.
        </p>
        <Button size="lg" onClick={() => setRevealed(true)} className="gap-2">
          Reveal my cards
        </Button>
        <button
          onClick={reset}
          className="text-xs text-white/50 underline hover:text-white/80"
        >
          Start over
        </button>
      </div>
    );
  }

  // ---- Playing: show this player's hand ----
  const isLast = current === hands.length - 1;
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">
          {nameAt(current)}'s cards
        </h2>
        <Button
          onClick={() => {
            setRevealed(false);
            setCurrent((c) => c + 1);
          }}
          className="gap-2"
        >
          {isLast ? "See everyone's cards" : "Pass on"}
        </Button>
      </div>
      <HandStack cards={hands[current]} />
    </div>
  );
}

// ==============================
// LIVE ROOM (signed-in, real-time)
// ==============================

type RoomSession = {
  _id: Id<"groupSessions">;
  code: string;
  status: "open" | "closed";
  hostUserId: Id<"users">;
  isHost: boolean;
  participants: Array<{
    _id: Id<"groupParticipants">;
    userId: Id<"users">;
    name: string;
    isMe: boolean;
    cards: MixedCard[];
  }>;
};

function LiveRoom({ initialCode }: { initialCode?: string }) {
  const createSession = useMutation(api.group.createSession);
  const joinSession = useMutation(api.group.joinSession);
  const drawHand = useMutation(api.group.drawHand);
  const closeSession = useMutation(api.group.closeSession);
  const renameParticipant = useMutation(api.group.renameParticipant);
  const { language } = useActiveLanguage();

  const [code, setCode] = useState<string | null>(null);
  const [joinInput, setJoinInput] = useState(initialCode ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const autoJoined = useRef(false);

  const session = useQuery(api.group.getSession, code ? { code } : "skip");

  async function handleJoin(codeArg?: string) {
    const c = (codeArg ?? joinInput).trim().toUpperCase();
    if (!c) return;
    setBusy(true);
    setError(null);
    try {
      const res = await joinSession({ code: c });
      setCode(res.code);
      setJoinInput("");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // Auto-join when arriving via an invite link.
  useEffect(() => {
    if (initialCode && !code && !autoJoined.current) {
      autoJoined.current = true;
      void handleJoin(initialCode);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialCode]);

  async function handleCreate() {
    setBusy(true);
    setError(null);
    try {
      const res = await createSession({});
      setCode(res.code);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  // ---- Lobby ----
  if (!code) {
    return (
      <div className="grid gap-5 md:grid-cols-2">
        <div className={`space-y-3 ${glassPanel} p-6`}>
          <h2 className="font-semibold text-white">Create a room</h2>
          <p className="text-sm text-white/55">
            Start a table, then share the room code or invite link. Everyone
            draws a mixed hand from across all the decks.
          </p>
          <Button onClick={handleCreate} disabled={busy} className="gap-2">
            <Users className="h-4 w-4" />
            Create room
          </Button>
        </div>

        <div className={`space-y-3 ${glassPanel} p-6`}>
          <h2 className="font-semibold text-white">Join a room</h2>
          <p className="text-sm text-white/55">
            Got a code or invite link from a friend? Enter the code here.
          </p>
          <Input
            value={joinInput}
            onChange={(e) => setJoinInput(e.target.value.toUpperCase())}
            onKeyDown={(e) => e.key === "Enter" && void handleJoin()}
            placeholder="e.g. ABCD"
            maxLength={6}
            className="border-white/15 bg-white/5 uppercase tracking-widest text-white placeholder:text-white/40"
          />
          <Button
            variant="glass"
            onClick={() => void handleJoin()}
            disabled={busy || !joinInput.trim()}
            className="gap-2"
          >
            <DoorOpen className="h-4 w-4" />
            Join room
          </Button>
        </div>

        {error && <p className="text-sm text-rose-300 md:col-span-2">{error}</p>}
      </div>
    );
  }

  // ---- In a room ----
  if (session === undefined) {
    return <p className="text-white/55">Loading room…</p>;
  }

  if (session === null) {
    return (
      <div className={`space-y-4 ${glassPanel} p-6`}>
        <p className="text-white/55">
          This room could not be found — it may have been closed.
        </p>
        <Button variant="glass" onClick={() => setCode(null)}>
          Back to lobby
        </Button>
      </div>
    );
  }

  return (
    <RoomView
      session={session as unknown as RoomSession}
      onDraw={() => drawHand({ sessionId: session._id, language })}
      onClose={() => closeSession({ sessionId: session._id })}
      onRename={(name) => renameParticipant({ sessionId: session._id, name })}
      onLeave={() => setCode(null)}
    />
  );
}

function RoomView({
  session,
  onDraw,
  onClose,
  onRename,
  onLeave,
}: {
  session: RoomSession;
  onDraw: () => Promise<unknown>;
  onClose: () => Promise<unknown>;
  onRename: (name: string) => Promise<unknown>;
  onLeave: () => void;
}) {
  const [copied, setCopied] = useState<"code" | "link" | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState("");

  const me = session.participants.find((p) => p.isMe);

  const seats: Seat[] = session.participants.map((p) => ({
    id: p._id,
    name: p.name,
    isMe: p.isMe,
    isHost: p.userId === session.hostUserId,
    cards: p.cards,
  }));

  const selected = session.participants.find((p) => p._id === selectedSeatId);

  async function copy(kind: "code" | "link") {
    const text =
      kind === "code"
        ? session.code
        : `${window.location.origin}/group?room=${session.code}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(kind);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* clipboard may be blocked */
    }
  }

  async function saveName() {
    const next = nameInput.trim();
    if (next) await onRename(next);
    setRenaming(false);
  }

  return (
    <div className="space-y-6">
      <div className={`flex flex-wrap items-center justify-between gap-4 ${glassPanel} p-5`}>
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-white/45">
            Invite your group
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-2xl font-bold tracking-[0.3em] text-white">
              {session.code}
            </span>
            <Button
              variant="glass"
              size="sm"
              className="gap-1.5"
              onClick={() => void copy("code")}
            >
              {copied === "code" ? (
                <Check className="h-4 w-4 text-emerald-300" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
              Code
            </Button>
            <Button
              variant="glass"
              size="sm"
              className="gap-1.5"
              onClick={() => void copy("link")}
            >
              {copied === "link" ? (
                <Check className="h-4 w-4 text-emerald-300" />
              ) : (
                <Link2 className="h-4 w-4" />
              )}
              Invite link
            </Button>
          </div>
          <p className="text-xs text-white/45">
            Friends open the link, or pick <strong>Live Room</strong> on the
            Group page and enter this code.
          </p>

          {/* Rename your own seat */}
          {me &&
            (renaming ? (
              <div className="flex items-center gap-2 pt-1">
                <Input
                  autoFocus
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && void saveName()}
                  maxLength={24}
                  className="h-8 w-40 border-white/15 bg-white/5 text-white"
                />
                <Button variant="glass" size="sm" onClick={() => void saveName()}>
                  Save
                </Button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setNameInput(me.name);
                  setRenaming(true);
                }}
                className="flex items-center gap-1 text-xs text-white/50 hover:text-white/80"
              >
                <Pencil className="h-3 w-3" />
                Playing as {me.name}
              </button>
            ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="gap-2"
            disabled={drawing}
            onClick={async () => {
              setDrawing(true);
              try {
                await onDraw();
              } finally {
                setDrawing(false);
              }
            }}
          >
            <Dices className="h-4 w-4" />
            {me && me.cards.length > 0 ? "Re-draw" : "Draw my 5"}
          </Button>
          {session.isHost && (
            <Button variant="glass" onClick={() => void onClose()}>
              Close room
            </Button>
          )}
          <Button
            variant="ghost"
            className="text-white/70 hover:text-white"
            onClick={onLeave}
          >
            Leave
          </Button>
        </div>
      </div>

      {/* Poker table / stacked list */}
      <PokerTable seats={seats} onSelectSeat={setSelectedSeatId} />

      {/* Full-hand dialog — Daily 3 style stack */}
      <Dialog
        open={!!selected}
        onOpenChange={(open) => !open && setSelectedSeatId(null)}
      >
        <DialogContent className="max-h-[88vh] overflow-y-auto border-white/10 bg-background/95 backdrop-blur-xl sm:max-w-5xl">
          <DialogHeader>
            <DialogTitle className="text-white">
              {selected?.name}
              {selected?.isMe ? " (you)" : ""}
            </DialogTitle>
          </DialogHeader>
          {selected && selected.cards.length > 0 ? (
            <HandStack cards={selected.cards} />
          ) : (
            <div className="flex flex-col items-center gap-3 py-10 text-center">
              <Sparkles className="h-8 w-8 text-white/40" />
              <p className="text-sm text-white/55">
                {selected?.name} hasn't drawn yet.
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
