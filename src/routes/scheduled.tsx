import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useMutation, useQuery } from "convex/react";
import { useEffect, useMemo, useState } from "react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { SidebarLayout } from "@/components/SidebarLayout";
import { ComingSoon } from "@/components/ComingSoon";
import { ShareButton } from "@/components/ShareButton";
import { StudioPreview } from "@/components/studio/StudioPreview";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Send, Plus, X, Check, BellRing } from "lucide-react";
import { studioDocToDesign, curatedCardToDesign } from "@/lib/studioDesign";

export const Route = createFileRoute("/scheduled")({
  component: ScheduledPage,
});

function ScheduledPage() {
  const user = useQuery(api.users.currentUser);
  const shares = useQuery(api.schedule.listScheduledShares);
  const cancelShare = useMutation(api.schedule.cancelScheduledShare);
  const markDone = useMutation(api.schedule.markShareDone);
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    if (user === null) navigate({ to: "/login" });
  }, [user, navigate]);

  if (user === null) return null;

  return (
    <SidebarLayout title="Scheduled">
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Scheduled shares
            </h1>
            <p className="text-sm text-muted-foreground">
              Queue a card and we'll remind you when it's time to post.
            </p>
          </div>
          <Button className="gap-2" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Schedule a share
          </Button>
        </div>

        {shares === undefined ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : shares.length === 0 ? (
          <ComingSoon
            icon={Send}
            title="Nothing scheduled"
            description="Design a card in the Studio, then schedule it to share later."
          />
        ) : (
          <div className="space-y-3">
            {shares.map((row) => {
              const design = row.studioCard
                ? studioDocToDesign(row.studioCard)
                : row.card
                  ? curatedCardToDesign({
                      quote: row.card.quote,
                      author: row.card.author,
                      imageUrl: row.card.imageUrl,
                      deckTitle: row.deck?.title,
                    })
                  : null;
              const reminded = row.share.status === "reminded";
              return (
                <div
                  key={row.share._id}
                  className={`flex items-center gap-4 rounded-xl border p-3 ${
                    reminded
                      ? "border-orange-400/30 bg-orange-500/10"
                      : "border-white/10 bg-white/[0.04]"
                  }`}
                >
                  {design && <StudioPreview design={design} displaySize={72} />}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      &ldquo;{design?.quote}&rdquo;
                    </p>
                    <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                      {reminded ? (
                        <span className="inline-flex items-center gap-1 font-medium text-orange-600">
                          <BellRing className="h-3 w-3" /> Ready to share
                        </span>
                      ) : (
                        <>Scheduled for </>
                      )}
                      {new Date(row.share.scheduledFor).toLocaleString(undefined, {
                        dateStyle: "medium",
                        timeStyle: "short",
                      })}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    {design && (
                      <ShareButton
                        design={design}
                        caption={row.card?.caption}
                        label="Share"
                      />
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Mark as shared"
                      onClick={() => void markDone({ id: row.share._id })}
                    >
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Cancel"
                      onClick={() => void cancelShare({ id: row.share._id })}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <ScheduleDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </SidebarLayout>
  );
}

function ScheduleDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const myCards = useQuery(api.studio.listMyStudioCards);
  const createShare = useMutation(api.schedule.createScheduledShare);

  const [selectedId, setSelectedId] = useState<Id<"studioCards"> | null>(null);
  const [date, setDate] = useState<Date | undefined>(() => new Date());
  const [time, setTime] = useState("09:00");
  const [caption, setCaption] = useState("");
  const [saving, setSaving] = useState(false);

  // Default to the most recent card so the Schedule button isn't silently
  // disabled when the user already has cards (listMyStudioCards is newest-first).
  useEffect(() => {
    if (!selectedId && myCards && myCards.length > 0) {
      setSelectedId(myCards[0]._id);
    }
  }, [myCards, selectedId]);

  const scheduledFor = useMemo(() => {
    if (!date) return null;
    const [hh, mm] = time.split(":").map(Number);
    const d = new Date(date);
    d.setHours(hh ?? 9, mm ?? 0, 0, 0);
    return d.getTime();
  }, [date, time]);

  async function handleCreate() {
    if (!selectedId || !scheduledFor) return;
    setSaving(true);
    try {
      await createShare({
        kind: "studio",
        studioCardId: selectedId,
        scheduledFor,
        caption: caption || undefined,
      });
      onOpenChange(false);
      setSelectedId(null);
      setCaption("");
    } catch (e) {
      console.error("Schedule failed", e);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Schedule a share</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <p className="mb-2 text-xs font-medium text-muted-foreground">
              Pick a card
            </p>
            {myCards === undefined ? (
              <p className="text-sm text-muted-foreground">Loading…</p>
            ) : myCards.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have no studio cards yet.{" "}
                <Link to="/studio" className="underline">
                  Design one
                </Link>{" "}
                first.
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {myCards.map((card) => (
                  <button
                    key={card._id}
                    onClick={() => setSelectedId(card._id)}
                    className={`overflow-hidden rounded-lg ring-2 transition-all ${
                      selectedId === card._id
                        ? "ring-ring"
                        : "ring-transparent hover:ring-border"
                    }`}
                  >
                    <StudioPreview
                      design={studioDocToDesign(card)}
                      displaySize={72}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex flex-wrap gap-4">
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">
                Date
              </p>
              <Calendar
                mode="single"
                selected={date}
                onSelect={(d) => d && setDate(d)}
                className="rounded-lg border"
              />
            </div>
            <div className="space-y-3">
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Time
                </p>
                <Input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  className="w-36"
                />
              </div>
              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">
                  Caption (optional)
                </p>
                <Input
                  value={caption}
                  placeholder="Add a caption…"
                  onChange={(e) => setCaption(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>

        {!selectedId && myCards && myCards.length > 0 ? (
          <p className="text-xs text-muted-foreground">
            Pick a card above to schedule.
          </p>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleCreate}
            disabled={!selectedId || !scheduledFor || saving}
          >
            Schedule
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
