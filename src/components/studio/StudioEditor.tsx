import { useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { Button } from "@/components/ui/button";
import { StudioControls } from "./StudioControls";
import { StudioPreview } from "./StudioPreview";
import { exportCardImage } from "@/lib/exportCard";
import { shareImage } from "@/lib/share";
import {
  DEFAULT_DESIGN,
  type StudioDesign,
  type BackgroundType,
  type LayoutKind,
} from "@/lib/studioDesign";
import { Download, Plus, Save, Share2, Trash2, Loader2 } from "lucide-react";

type StudioCardDoc = {
  _id: Id<"studioCards">;
  title?: string;
  quote: string;
  author?: string;
  backgroundType: BackgroundType;
  backgroundValue: string;
  backgroundStorageId?: Id<"_storage">;
  backgroundStorageUrl?: string | null;
  fontFamily: string;
  textColor: string;
  layout: string;
};

function cardToDesign(card: StudioCardDoc): StudioDesign {
  return {
    title: card.title ?? "",
    quote: card.quote,
    author: card.author ?? "",
    backgroundType: card.backgroundType,
    backgroundValue: card.backgroundStorageId
      ? card.backgroundStorageUrl ?? card.backgroundValue
      : card.backgroundValue,
    backgroundStorageId: card.backgroundStorageId,
    fontFamily: card.fontFamily,
    textColor: card.textColor,
    layout: card.layout as LayoutKind,
  };
}

export function StudioEditor() {
  const myCards = useQuery(api.studio.listMyStudioCards);
  const createCard = useMutation(api.studio.createStudioCard);
  const updateCard = useMutation(api.studio.updateStudioCard);
  const deleteCard = useMutation(api.studio.deleteStudioCard);

  const [design, setDesign] = useState<StudioDesign>(DEFAULT_DESIGN);
  const [editingId, setEditingId] = useState<Id<"studioCards"> | null>(null);
  const [saving, setSaving] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  function patch(p: Partial<StudioDesign>) {
    setDesign((d) => ({ ...d, ...p }));
  }

  function toPayload(d: StudioDesign) {
    return {
      title: d.title || undefined,
      quote: d.quote,
      author: d.author || undefined,
      backgroundType: d.backgroundType,
      backgroundValue: d.backgroundValue,
      backgroundStorageId: d.backgroundStorageId as Id<"_storage"> | undefined,
      fontFamily: d.fontFamily,
      textColor: d.textColor,
      layout: d.layout,
    };
  }

  async function handleSave() {
    setSaving(true);
    try {
      if (editingId) {
        await updateCard({ cardId: editingId, ...toPayload(design) });
      } else {
        const id = await createCard(toPayload(design));
        setEditingId(id);
      }
    } catch (e) {
      console.error("Save failed", e);
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    if (!exportRef.current) return;
    setDownloading(true);
    try {
      const blob = await exportCardImage(exportRef.current);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dailycard-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Export failed", e);
      alert(
        "Could not export the image. External image URLs can block this for security (CORS) — try uploading the image instead."
      );
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    if (!exportRef.current) return;
    setSharing(true);
    try {
      const blob = await exportCardImage(exportRef.current);
      await shareImage(blob, {
        title: "DailyCard",
        text: design.author ? `"${design.quote}" — ${design.author}` : design.quote,
        filename: `dailycard-${Date.now()}.png`,
      });
    } catch (e) {
      console.error("Share failed", e);
      alert(
        "Could not prepare the image to share. External image URLs can block this for security (CORS) — try uploading the image instead."
      );
    } finally {
      setSharing(false);
    }
  }

  function newCard() {
    setDesign(DEFAULT_DESIGN);
    setEditingId(null);
  }

  async function handleDelete(id: Id<"studioCards">) {
    await deleteCard({ cardId: id });
    if (editingId === id) newCard();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Card Studio</h1>
          <p className="text-sm text-muted-foreground">
            Design a card, then save, download, or share it.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={newCard} className="gap-2">
          <Plus className="h-4 w-4" />
          New card
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Controls */}
        <div className="order-2 rounded-xl border bg-card p-5 lg:order-1">
          <StudioControls design={design} onChange={patch} />
        </div>

        {/* Preview + actions */}
        <div className="order-1 space-y-4 lg:order-2">
          <div className="mx-auto w-full max-w-[480px]">
            <StudioPreview design={design} exportRef={exportRef} fluid />
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {editingId ? "Update" : "Save"}
            </Button>
            <Button
              variant="outline"
              onClick={handleShare}
              disabled={sharing}
              className="gap-2"
            >
              {sharing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Share2 className="h-4 w-4" />
              )}
              Share
            </Button>
            <Button
              variant="ghost"
              onClick={handleDownload}
              disabled={downloading}
              className="gap-2"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              Download
            </Button>
          </div>
        </div>
      </div>

      {/* My cards */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold">My cards</h2>
        {myCards === undefined ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : myCards.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No saved cards yet. Design one above and hit Save.
          </p>
        ) : (
          <div className="flex flex-wrap gap-3">
            {myCards.map((card) => (
              <div key={card._id} className="group relative">
                <button
                  onClick={() => {
                    setDesign(cardToDesign(card as StudioCardDoc));
                    setEditingId(card._id);
                  }}
                  className={`block overflow-hidden rounded-lg ring-2 transition-all ${
                    editingId === card._id
                      ? "ring-ring"
                      : "ring-transparent hover:ring-border"
                  }`}
                  title={card.quote}
                >
                  <StudioPreview
                    design={cardToDesign(card as StudioCardDoc)}
                    displaySize={96}
                  />
                </button>
                <button
                  onClick={() => handleDelete(card._id)}
                  className="absolute -right-2 -top-2 hidden h-6 w-6 items-center justify-center rounded-full bg-destructive text-white shadow group-hover:flex"
                  title="Delete"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
