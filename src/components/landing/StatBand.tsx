import { Reveal } from "./primitives";
import { STATS } from "./content";

export function StatBand() {
  return (
    <section className="mx-auto w-full max-w-5xl px-4 pb-6">
      <Reveal>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
          {STATS.map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-center ring-1 ring-white/10 backdrop-blur-md"
            >
              <p className="text-3xl font-bold tracking-tight text-white">
                {s.value}
              </p>
              <p className="mt-1 text-xs text-white/50">{s.label}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
