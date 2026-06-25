import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

/**
 * Copies a card's ready-to-paste caption (e.g. the Instagram caption) to the
 * clipboard. Useful on desktop, where the Web Share sheet isn't available and
 * sharing falls back to a plain image download — this is how the text travels.
 *
 * Pass `label={null}` for an icon-only button in tight layouts.
 */
export function CopyCaptionButton({
  caption,
  label = "Caption",
  className,
  variant = "outline",
}: {
  caption: string;
  label?: string | null;
  className?: string;
  variant?: React.ComponentProps<typeof Button>["variant"];
}) {
  const [copied, setCopied] = useState(false);
  const iconOnly = label === null;

  async function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(caption);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard access can be blocked (insecure context / permissions); ignore.
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={iconOnly ? "icon" : "sm"}
      className={className}
      onClick={handleCopy}
      title="Copy the caption to paste on Instagram"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {!iconOnly && (copied ? "Copied" : label)}
    </Button>
  );
}
