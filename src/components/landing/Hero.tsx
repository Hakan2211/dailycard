import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./primitives";
import { HeroDeckFan } from "./HeroDeckFan";
import { useStartCta } from "./useStartCta";
import { handleAnchorScroll } from "./smoothScroll";
import { OFFER } from "./content";

export function Hero() {
  const start = useStartCta();
  return (
    <section
      id="top"
      className="relative mx-auto flex w-full max-w-4xl flex-col items-center px-4 pt-20 pb-16 text-center sm:pt-24 sm:pb-24"
    >
      <HeroDeckFan />

      <Reveal className="mt-2 sm:mt-4">
        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs font-medium tracking-wide text-white/65 ring-1 ring-white/10 backdrop-blur-md">
          <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
          A daily ritual for a clearer mind
        </span>
      </Reveal>

      <Reveal delay={0.05}>
        <h1 className="mt-6 bg-gradient-to-b from-white to-white/55 bg-clip-text text-4xl font-bold leading-[1.05] tracking-tight text-transparent sm:text-6xl lg:text-7xl">
          Find your focus,
          <br className="hidden sm:block" /> one card a day.
        </h1>
      </Reveal>

      <Reveal delay={0.1}>
        <p className="mt-6 max-w-2xl text-base text-white/65 sm:text-lg">
          DailyCard turns a few quiet minutes into a daily practice. Draw from{" "}
          {OFFER.deckCount} beautifully crafted decks and {OFFER.cardCount}{" "}
          hand-written cards, and watch your streak grow.
        </p>
      </Reveal>

      <Reveal delay={0.15}>
        <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Button onClick={start} size="lg" className="gap-2 px-7 shadow-xl">
            Start your journey
            <ArrowRight className="h-4 w-4" />
          </Button>
          <Button asChild variant="glass" size="lg" className="px-7">
            <a href="#features" onClick={handleAnchorScroll}>
              See what's inside
            </a>
          </Button>
        </div>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-white/45">
          <span>{OFFER.deckCount} decks</span>
          <span className="text-white/20">•</span>
          <span>{OFFER.cardCount} cards</span>
          <span className="text-white/20">•</span>
          <span>English &amp; German</span>
          <span className="text-white/20">•</span>
          <span>Lifetime access</span>
        </div>
      </Reveal>
    </section>
  );
}
