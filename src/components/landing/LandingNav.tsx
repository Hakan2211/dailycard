import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/BrandMark";
import { useStartCta } from "./useStartCta";
import { handleAnchorScroll } from "./smoothScroll";

export function LandingNav() {
  const start = useStartCta();
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0a0c10]/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <a
          href="#top"
          onClick={handleAnchorScroll}
          className="flex items-center gap-2"
        >
          <BrandMark className="h-9 w-9" />
          <span className="text-base font-semibold tracking-tight">DailyCard</span>
        </a>
        <nav className="hidden items-center gap-8 text-sm text-white/60 md:flex">
          <a
            href="#features"
            onClick={handleAnchorScroll}
            className="transition hover:text-white"
          >
            Features
          </a>
          <a
            href="#decks"
            onClick={handleAnchorScroll}
            className="transition hover:text-white"
          >
            Decks
          </a>
          <a
            href="#pricing"
            onClick={handleAnchorScroll}
            className="transition hover:text-white"
          >
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
