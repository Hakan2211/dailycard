import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartCheckout } from "@/lib/checkout";
import type { EditionCode } from "@/components/landing/content";

/**
 * Shown where a gated feature/deck is locked. The CTA starts Stripe Checkout for
 * `edition` (defaults to English). For language-specific locks (a German deck)
 * pass the matching edition so the purchase unlocks the right content.
 */
export function UpgradePrompt({
  title = "This is a premium feature",
  description = "Unlock the full DailyCard library: every deck, the Studio, scheduling, and the 3D reveal.",
  edition = "en",
  cta = "Unlock DailyCard",
}: {
  title?: string;
  description?: string;
  edition?: EditionCode;
  cta?: string;
}) {
  const { start, loading, error } = useStartCheckout();

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-amber-950/20 to-white/[0.02] p-8 text-center backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Button
        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white"
        onClick={() => void start(edition)}
        disabled={loading}
      >
        <Sparkles className="h-4 w-4" />
        {loading ? "Starting checkout…" : cta}
      </Button>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  );
}
