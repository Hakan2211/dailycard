import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartCta } from "./useStartCta";

export function LandingNav() {
  const start = useStartCta();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0c10]/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/15 bg-white/10">
            <Sparkles className="h-5 w-5 text-white" />
          </span>
          <span className="text-base font-semibold tracking-tight">DailyCard</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a href="#features" className="transition hover:text-white">
            Features
          </a>
          <a href="#decks" className="transition hover:text-white">
            Decks
          </a>
          <a href="#pricing" className="transition hover:text-white">
            Pricing
          </a>
        </nav>
        <Button onClick={start} size="sm" className="shadow-lg">
          Sign in
        </Button>
      </div>
    </header>
  );
}
