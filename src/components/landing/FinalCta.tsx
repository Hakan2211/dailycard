import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "./primitives";
import { useStartCta } from "./useStartCta";

export function FinalCta() {
  const start = useStartCta();
  return (
    <section className="mx-auto w-full max-w-3xl px-4 py-24 text-center sm:py-32">
      <Reveal>
        <h2 className="bg-gradient-to-b from-white to-white/55 bg-clip-text text-3xl font-bold tracking-tight text-transparent sm:text-5xl">
          Your next card is waiting.
        </h2>
        <p className="mx-auto mt-5 max-w-lg text-white/60">
          Begin your daily practice today. It takes less than a minute.
        </p>
        <Button onClick={start} size="lg" className="mt-8 gap-2 px-8 shadow-xl">
          Start your journey
          <ArrowRight className="h-4 w-4" />
        </Button>
      </Reveal>
    </section>
  );
}
