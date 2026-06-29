import { Sparkles } from "lucide-react";

export function LandingFooter() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0c10]/60 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-6xl flex-col items-center justify-between gap-4 px-4 py-10 text-sm text-white/45 sm:flex-row sm:px-6">
        <div className="flex items-center gap-2 text-white/70">
          <Sparkles className="h-4 w-4" />
          <span className="font-semibold">DailyCard</span>
        </div>
        <nav className="flex items-center gap-6">
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
        <p>© 2026 DailyCard. All rights reserved.</p>
      </div>
    </footer>
  );
}
