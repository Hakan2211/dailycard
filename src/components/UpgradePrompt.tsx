import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Shown where a Pro-gated feature is locked. Billing isn't wired yet, so the
 * CTA is a placeholder — replace `onUpgrade` with a real checkout later.
 */
export function UpgradePrompt({
  title = "This is a Pro feature",
  description = "Upgrade to DailyCard Pro to unlock the Studio, scheduling, the 3D reveal, and every topic.",
}: {
  title?: string;
  description?: string;
}) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-2xl border border-white/10 bg-gradient-to-b from-amber-950/20 to-white/[0.02] p-8 text-center backdrop-blur-sm">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow">
        <Sparkles className="h-7 w-7" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{description}</p>
      <Button
        className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white"
        onClick={() => alert("Billing is coming soon!")}
      >
        <Sparkles className="h-4 w-4" />
        Upgrade to Pro
      </Button>
    </div>
  );
}
