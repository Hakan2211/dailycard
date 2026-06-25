import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Share2, Loader2 } from "lucide-react";
import { CardExportNode } from "@/components/studio/StudioPreview";
import { exportCardImage } from "@/lib/exportCard";
import { shareImage } from "@/lib/share";
import type { StudioDesign } from "@/lib/studioDesign";

/**
 * Renders a Share button plus a hidden, full-resolution export node for the
 * given design. On click it rasterizes the node and opens the share sheet
 * (or downloads). Use this where there's no already-visible export node.
 */
export function ShareButton({
  design,
  caption,
  filename = "dailycard.png",
  label = "Share this card",
  variant = "outline",
  size = "sm",
  className,
}: {
  design: StudioDesign;
  /** Ready-to-paste caption used as the share-sheet text (e.g. the Instagram
   * caption). Falls back to the quote/author when absent. */
  caption?: string;
  filename?: string;
  label?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
  size?: React.ComponentProps<typeof Button>["size"];
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);

  async function handleShare() {
    if (!ref.current) return;
    setBusy(true);
    try {
      const blob = await exportCardImage(ref.current);
      const fallbackText = design.author
        ? `"${design.quote}" — ${design.author}`
        : design.quote;
      await shareImage(blob, {
        title: "DailyCard",
        text: caption?.trim() ? caption : fallbackText,
        filename,
      });
    } catch (e) {
      console.error("Share failed", e);
      alert(
        "Could not prepare the image to share. External images can block this for security (CORS)."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        type="button"
        variant={variant}
        size={size}
        className={className}
        onClick={(e) => {
          e.stopPropagation();
          void handleShare();
        }}
        disabled={busy}
      >
        {busy ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Share2 className="h-3.5 w-3.5" />
        )}
        {label}
      </Button>

      {/* Hidden full-resolution node used only for rasterization */}
      <div
        aria-hidden
        style={{
          position: "fixed",
          left: -99999,
          top: 0,
          pointerEvents: "none",
        }}
      >
        <CardExportNode ref={ref} design={design} />
      </div>
    </>
  );
}
