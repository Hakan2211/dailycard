import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getCardBackHex } from "@/lib/cardTheme";
import { Crown } from "lucide-react";
import type { MixedCard } from "./types";

export type Seat = {
  id: string;
  name: string;
  isMe: boolean;
  isHost: boolean;
  cards: MixedCard[];
};

const HAND_SIZE = 5;

/**
 * A face-down "luxe" card back. Deliberately deck-agnostic — backs must NOT
 * reveal which decks a player drew from before their hand is opened.
 */
function CardBack({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "h-11 w-8 shrink-0 rounded-[5px] border border-white/10 shadow-md",
        "flex items-center justify-center",
        className
      )}
      style={{ background: "linear-gradient(145deg,#1f2937,#0b1220)" }}
    >
      <span className="block size-2 rotate-45 rounded-[1px] bg-amber-300/40 ring-1 ring-amber-200/20" />
    </div>
  );
}

/** A face-up mini, tinted by its own deck. */
function MiniCard({ card, className }: { card: MixedCard; className?: string }) {
  const glow = getCardBackHex(card.colorTheme);
  return (
    <div
      className={cn(
        "h-11 w-8 shrink-0 overflow-hidden rounded-[5px] border shadow-md",
        className
      )}
      style={{ borderColor: glow.from, boxShadow: `0 0 8px -2px ${glow.from}` }}
    >
      <img
        src={card.imageUrl}
        alt=""
        draggable={false}
        className="h-full w-full object-cover"
      />
    </div>
  );
}

/** Overlapping fan of a seat's hand (backs until drawn). */
function MiniHand({ cards }: { cards: MixedCard[] }) {
  const drawn = cards.length > 0;
  const items = drawn ? cards : Array.from({ length: HAND_SIZE });
  const m = items.length;
  return (
    <div className="flex justify-center">
      {items.map((item, k) => {
        const offset = k - (m - 1) / 2;
        return (
          <div
            key={k}
            className={cn(k > 0 && "-ml-3")}
            style={{
              transform: `rotate(${offset * 7}deg) translateY(${Math.abs(offset) * 3}px)`,
              zIndex: k,
            }}
          >
            {drawn ? <MiniCard card={item as MixedCard} /> : <CardBack />}
          </div>
        );
      })}
    </div>
  );
}

function SeatBadges({ seat }: { seat: Seat }) {
  return (
    <div className="flex items-center justify-center gap-1">
      {seat.isMe && (
        <Badge variant="outline" className="border-white/30 text-white">
          You
        </Badge>
      )}
      {seat.isHost && (
        <Badge variant="outline" className="gap-1 border-amber-300/40 text-amber-200">
          <Crown className="h-3 w-3" /> Host
        </Badge>
      )}
    </div>
  );
}

function SeatAvatar({ seat }: { seat: Seat }) {
  return (
    <div
      className={cn(
        "flex size-9 items-center justify-center rounded-full border text-sm font-semibold text-white",
        "border-white/15 bg-white/10",
        seat.isMe && "ring-2 ring-white"
      )}
    >
      {seat.name.charAt(0).toUpperCase() || "?"}
    </div>
  );
}

/**
 * Live Room overview. On ≥ sm it's a poker table — seats arranged around an
 * elliptical felt, each showing a fanned hand (face-down until that player
 * draws). Below sm it falls back to a stacked list (CSS toggle, so both trees
 * render and there's no hydration mismatch). Tapping a seat opens its full hand.
 */
export function PokerTable({
  seats,
  onSelectSeat,
}: {
  seats: Seat[];
  onSelectSeat: (id: string) => void;
}) {
  // Render "me" at the bottom-center for a first-person feel.
  const ordered = [...seats].sort((a, b) => Number(b.isMe) - Number(a.isMe));
  const n = Math.max(ordered.length, 1);

  return (
    <>
      {/* ---- Poker table (sm and up) ---- */}
      <div className="hidden sm:block">
        <div className="relative mx-auto my-6 aspect-[16/10] w-full max-w-3xl">
          {/* Felt */}
          <div
            className="absolute inset-[8%] rounded-[50%/45%] ring-1 ring-amber-900/40"
            style={{
              background:
                "radial-gradient(ellipse at center, #1b5e3a 0%, #0c3a23 70%, #08291a 100%)",
              boxShadow:
                "inset 0 0 60px rgba(0,0,0,0.55), inset 0 0 0 6px rgba(180,120,40,0.15)",
            }}
          />
          {/* Seats */}
          {ordered.map((seat, i) => {
            const angle = Math.PI / 2 + (i / n) * Math.PI * 2;
            const left = 50 + 44 * Math.cos(angle);
            const top = 50 + 40 * Math.sin(angle);
            return (
              <button
                key={seat.id}
                type="button"
                onClick={() => onSelectSeat(seat.id)}
                className="absolute flex w-28 flex-col items-center gap-1.5 rounded-xl p-1 transition-transform hover:scale-[1.04] focus:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  transform: "translate(-50%,-50%)",
                }}
                title={`${seat.name} — view hand`}
              >
                <MiniHand cards={seat.cards} />
                <SeatAvatar seat={seat} />
                <span className="max-w-full truncate text-xs font-semibold text-white">
                  {seat.name}
                </span>
                <SeatBadges seat={seat} />
              </button>
            );
          })}
        </div>
      </div>

      {/* ---- Stacked list (below sm) ---- */}
      <div className="space-y-3 sm:hidden">
        {ordered.map((seat) => (
          <button
            key={seat.id}
            type="button"
            onClick={() => onSelectSeat(seat.id)}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-left backdrop-blur-xl transition-colors hover:bg-white/[0.07]"
          >
            <SeatAvatar seat={seat} />
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-semibold text-white">
                  {seat.name}
                </span>
                <SeatBadges seat={seat} />
              </div>
              <p className="text-xs text-white/50">
                {seat.cards.length > 0 ? "Tap to view hand" : "Waiting to draw…"}
              </p>
            </div>
            <div className="shrink-0 pl-2">
              <MiniHand cards={seat.cards} />
            </div>
          </button>
        ))}
      </div>
    </>
  );
}
