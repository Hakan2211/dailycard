import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import type { Id } from "../../convex/_generated/dataModel";
import { Layout } from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Image,
  Layers,
  Eye,
  EyeOff,
  Shield,
  ChevronRight,
} from "lucide-react";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/admin")({
  component: AdminPage,
});

const COLOR_THEMES = [
  { value: "emerald", label: "Emerald (Green)", bg: "bg-emerald-500" },
  { value: "amber", label: "Amber (Gold)", bg: "bg-amber-500" },
  { value: "violet", label: "Violet (Purple)", bg: "bg-violet-500" },
  { value: "rose", label: "Rose (Pink)", bg: "bg-rose-500" },
  { value: "sky", label: "Sky (Blue)", bg: "bg-sky-500" },
  { value: "orange", label: "Orange", bg: "bg-orange-500" },
];

function AdminPage() {
  const user = useQuery(api.users.currentUser);
  const isAdmin = useQuery(api.admin.isAdmin);
  const navigate = useNavigate();

  // Sub-view state
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);

  // Redirect if not authed
  useEffect(() => {
    if (user === null) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  if (user === undefined || isAdmin === undefined) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />
        </div>
      </Layout>
    );
  }

  if (!isAdmin) {
    return (
      <Layout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center space-y-4">
          <Shield className="h-16 w-16 text-slate-300" />
          <h1 className="text-2xl font-bold">Access Denied</h1>
          <p className="text-muted-foreground">
            You don't have permission to access the admin panel.
          </p>
          <Button variant="outline" onClick={() => navigate({ to: "/" })}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedDeckId && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedDeckId(null)}
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight">
                  {selectedDeckId ? "Manage Cards" : "Admin Panel"}
                </h1>
                <Badge variant="secondary" className="text-xs">
                  Admin
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                {selectedDeckId
                  ? "Add, edit, and remove cards from this deck"
                  : "Manage your decks and cards"}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        {selectedDeckId ? (
          <CardManager
            deckId={selectedDeckId as Id<"decks">}
            onBack={() => setSelectedDeckId(null)}
          />
        ) : (
          <DeckManager onSelectDeck={setSelectedDeckId} />
        )}
      </div>
    </Layout>
  );
}

// ==============================
// DECK MANAGER
// ==============================

function DeckManager({
  onSelectDeck,
}: {
  onSelectDeck: (deckId: string) => void;
}) {
  const decks = useQuery(api.admin.listAllDecks);
  const createDeck = useMutation(api.admin.createDeck);
  const updateDeck = useMutation(api.admin.updateDeck);
  const deleteDeckMutation = useMutation(api.admin.deleteDeck);

  const [showDeckDialog, setShowDeckDialog] = useState(false);
  const [editingDeck, setEditingDeck] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [category, setCategory] = useState("");
  const [colorTheme, setColorTheme] = useState("emerald");

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setCoverImageUrl("");
    setCategory("");
    setColorTheme("emerald");
    setEditingDeck(null);
  };

  const openCreate = () => {
    resetForm();
    setShowDeckDialog(true);
  };

  const openEdit = (deck: any) => {
    setEditingDeck(deck);
    setTitle(deck.title);
    setDescription(deck.description);
    setCoverImageUrl(deck.coverImageUrl);
    setCategory(deck.category);
    setColorTheme(deck.colorTheme);
    setShowDeckDialog(true);
  };

  const handleSaveDeck = async () => {
    if (!title.trim() || !description.trim()) return;
    setIsSaving(true);

    try {
      if (editingDeck) {
        await updateDeck({
          deckId: editingDeck._id,
          title: title.trim(),
          description: description.trim(),
          coverImageUrl: coverImageUrl.trim(),
          category: category.trim(),
          colorTheme,
        });
      } else {
        await createDeck({
          title: title.trim(),
          description: description.trim(),
          coverImageUrl: coverImageUrl.trim() || "https://placehold.co/600x400/3b82f6/white?text=Deck",
          category: category.trim() || "general",
          colorTheme,
        });
      }
      setShowDeckDialog(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save deck:", err);
      alert("Failed to save deck. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    try {
      await deleteDeckMutation({ deckId: deckId as Id<"decks"> });
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete deck:", err);
      alert("Failed to delete deck.");
    }
  };

  const handleToggleActive = async (deck: any) => {
    try {
      await updateDeck({
        deckId: deck._id,
        isActive: !deck.isActive,
      });
    } catch (err) {
      console.error("Failed to toggle deck:", err);
    }
  };

  return (
    <>
      {/* Create Deck Button */}
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Create New Deck
        </Button>
      </div>

      {/* Deck List */}
      <div className="space-y-3">
        {decks?.map((deck) => (
          <div
            key={deck._id}
            className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm transition-colors hover:bg-slate-50 cursor-pointer group"
            onClick={() => onSelectDeck(deck._id)}
          >
            {/* Cover Image Thumbnail */}
            <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {deck.coverImageUrl ? (
                <img
                  src={deck.coverImageUrl}
                  alt={deck.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Image className="h-6 w-6 text-slate-300" />
                </div>
              )}
            </div>

            {/* Deck Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold truncate">{deck.title}</h3>
                <div
                  className={`h-3 w-3 rounded-full ${
                    COLOR_THEMES.find((t) => t.value === deck.colorTheme)?.bg ??
                    "bg-slate-400"
                  }`}
                />
                {!deck.isActive && (
                  <Badge variant="outline" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground truncate">
                {deck.description}
              </p>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-xs text-muted-foreground">
                  {deck.totalCards} cards
                </span>
                <span className="text-xs text-muted-foreground">
                  {deck.category}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div
              className="flex items-center gap-1 shrink-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleToggleActive(deck)}
                  >
                    {deck.isActive ? (
                      <Eye className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <EyeOff className="h-4 w-4 text-slate-400" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {deck.isActive ? "Deactivate" : "Activate"}
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onSelectDeck(deck._id)}
                  >
                    <Layers className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Manage cards</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => openEdit(deck)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Edit deck</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => setDeleteConfirm(deck._id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Delete deck</TooltipContent>
              </Tooltip>
            </div>

            {/* Chevron hint */}
            <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />
          </div>
        ))}

        {decks?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Layers className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-muted-foreground">No decks yet</p>
            <p className="text-sm text-muted-foreground">
              Create your first deck to get started
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Deck Dialog */}
      <Dialog
        open={showDeckDialog}
        onOpenChange={(open) => {
          setShowDeckDialog(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDeck ? "Edit Deck" : "Create New Deck"}
            </DialogTitle>
            <DialogDescription>
              {editingDeck
                ? "Update the deck details below"
                : "Fill in the details to create a new card deck"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mindful Animals"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description *</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="A short description of this deck"
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Cover Image URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Cover Image URL</label>
              <input
                type="url"
                value={coverImageUrl}
                onChange={(e) => setCoverImageUrl(e.target.value)}
                placeholder="https://your-cdn.b-cdn.net/covers/deck-cover.png"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {coverImageUrl && (
                <div className="mt-2 h-32 w-full overflow-hidden rounded-lg border bg-slate-50">
                  <img
                    src={coverImageUrl}
                    alt="Cover preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Category</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., animals, nature, motivation"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Color Theme */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Color Theme</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_THEMES.map((theme) => (
                  <button
                    key={theme.value}
                    onClick={() => setColorTheme(theme.value)}
                    className={`flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                      colorTheme === theme.value
                        ? "border-slate-900 bg-slate-900 text-white"
                        : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className={`h-3 w-3 rounded-full ${theme.bg}`} />
                    {theme.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowDeckDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveDeck}
              disabled={!title.trim() || !description.trim() || isSaving}
            >
              {isSaving
                ? "Saving..."
                : editingDeck
                  ? "Save Changes"
                  : "Create Deck"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Deck?</DialogTitle>
            <DialogDescription>
              This will permanently delete this deck and all its cards. This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteDeck(deleteConfirm)}
            >
              Delete Deck
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

// ==============================
// CARD MANAGER
// ==============================

function CardManager({
  deckId,
  onBack,
}: {
  deckId: Id<"decks">;
  onBack: () => void;
}) {
  const deck = useQuery(api.decks.getById, { deckId });
  const cards = useQuery(api.admin.listCards, { deckId });
  const addCard = useMutation(api.admin.addCard);
  const updateCardMutation = useMutation(api.admin.updateCard);
  const deleteCardMutation = useMutation(api.admin.deleteCard);

  const [showCardDialog, setShowCardDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form state
  const [imageUrl, setImageUrl] = useState("");
  const [quote, setQuote] = useState("");
  const [author, setAuthor] = useState("");
  const [cardDescription, setCardDescription] = useState("");

  const resetForm = () => {
    setImageUrl("");
    setQuote("");
    setAuthor("");
    setCardDescription("");
    setEditingCard(null);
  };

  const openCreate = () => {
    resetForm();
    setShowCardDialog(true);
  };

  const openEdit = (card: any) => {
    setEditingCard(card);
    setImageUrl(card.imageUrl);
    setQuote(card.quote);
    setAuthor(card.author ?? "");
    setCardDescription(card.description);
    setShowCardDialog(true);
  };

  const handleSaveCard = async () => {
    if (!quote.trim() || !cardDescription.trim()) return;
    setIsSaving(true);

    try {
      if (editingCard) {
        await updateCardMutation({
          cardId: editingCard._id,
          imageUrl: imageUrl.trim() || undefined,
          quote: quote.trim(),
          author: author.trim() || undefined,
          description: cardDescription.trim(),
        });
      } else {
        await addCard({
          deckId,
          imageUrl: imageUrl.trim() || "https://placehold.co/600x400/3b82f6/white?text=Card",
          quote: quote.trim(),
          author: author.trim() || undefined,
          description: cardDescription.trim(),
        });
      }
      setShowCardDialog(false);
      resetForm();
    } catch (err) {
      console.error("Failed to save card:", err);
      alert("Failed to save card. Check console for details.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCard = async (cardId: string) => {
    try {
      await deleteCardMutation({ cardId: cardId as Id<"cards"> });
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Failed to delete card:", err);
      alert("Failed to delete card.");
    }
  };

  const themeColor =
    COLOR_THEMES.find((t) => t.value === deck?.colorTheme)?.bg ?? "bg-blue-500";

  return (
    <>
      {/* Deck Info Header */}
      {deck && (
        <div className="flex items-center gap-4 rounded-xl border bg-white p-4 shadow-sm">
          <div className="h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100">
            {deck.coverImageUrl ? (
              <img
                src={deck.coverImageUrl}
                alt={deck.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Image className="h-6 w-6 text-slate-300" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{deck.title}</h3>
              <div className={`h-3 w-3 rounded-full ${themeColor}`} />
            </div>
            <p className="text-sm text-muted-foreground truncate">
              {deck.description}
            </p>
          </div>
          <Badge variant="outline">{deck.totalCards} cards</Badge>
        </div>
      )}

      {/* Add Card Button */}
      <div className="flex justify-end">
        <Button onClick={openCreate} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Card
        </Button>
      </div>

      {/* Card List */}
      <div className="space-y-2">
        {cards?.map((card) => (
          <div
            key={card._id}
            className="flex items-center gap-3 rounded-xl border bg-white p-3 shadow-sm transition-colors hover:bg-slate-50"
          >
            {/* Card Number */}
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
              {card.cardNumber}
            </div>

            {/* Card Image Thumbnail */}
            <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
              {card.imageUrl ? (
                <img
                  src={card.imageUrl}
                  alt={`Card ${card.cardNumber}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Image className="h-4 w-4 text-slate-300" />
                </div>
              )}
            </div>

            {/* Card Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium italic truncate">
                &ldquo;{card.quote}&rdquo;
              </p>
              <div className="flex items-center gap-2">
                {card.author && (
                  <span className="text-xs text-muted-foreground">
                    &mdash; {card.author}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => openEdit(card)}
                title="Edit card"
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => setDeleteConfirm(card._id)}
                title="Delete card"
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </div>
        ))}

        {cards?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Image className="h-12 w-12 text-slate-300 mb-3" />
            <p className="text-muted-foreground">No cards in this deck</p>
            <p className="text-sm text-muted-foreground">
              Add your first card to get started
            </p>
          </div>
        )}
      </div>

      {/* Create/Edit Card Dialog */}
      <Dialog
        open={showCardDialog}
        onOpenChange={(open) => {
          setShowCardDialog(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingCard ? "Edit Card" : "Add New Card"}
            </DialogTitle>
            <DialogDescription>
              {editingCard
                ? "Update the card details below"
                : `Add a new card to ${deck?.title ?? "this deck"}`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://your-cdn.b-cdn.net/cards/card-image.png"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
              {imageUrl && (
                <div className="mt-2 h-32 w-full overflow-hidden rounded-lg border bg-slate-50">
                  <img
                    src={imageUrl}
                    alt="Card preview"
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}
            </div>

            {/* Quote */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Quote *</label>
              <textarea
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="The motivational quote for this card"
                rows={2}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>

            {/* Author */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Author</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="e.g., Albert Einstein"
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description *</label>
              <textarea
                value={cardDescription}
                onChange={(e) => setCardDescription(e.target.value)}
                placeholder="A description or reflection prompt for this card"
                rows={3}
                className="w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCardDialog(false);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveCard}
              disabled={
                !quote.trim() || !cardDescription.trim() || isSaving
              }
            >
              {isSaving
                ? "Saving..."
                : editingCard
                  ? "Save Changes"
                  : "Add Card"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => !open && setDeleteConfirm(null)}
      >
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Delete Card?</DialogTitle>
            <DialogDescription>
              This will permanently remove this card from the deck. This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirm(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteConfirm && handleDeleteCard(deleteConfirm)}
            >
              Delete Card
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
