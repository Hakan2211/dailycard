import { Reveal, SectionEyebrow } from "./primitives";
import { FEATURES } from "./content";

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:py-28"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>Everything you get</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          A complete practice, beautifully made
        </h2>
        <p className="mt-4 text-white/60">
          Every feature is included — no add-ons, no tiers. Here's what's waiting
          inside.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {FEATURES.map((f, i) => (
          <Reveal key={f.title} delay={(i % 3) * 0.05}>
            <article className="group h-full rounded-3xl border border-white/10 bg-white/[0.04] p-6 ring-1 ring-white/10 backdrop-blur-md transition hover:-translate-y-1 hover:bg-white/[0.06]">
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white shadow-sm">
                <f.icon className="h-6 w-6" />
              </span>
              <h3 className="mt-5 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/60">
                {f.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
