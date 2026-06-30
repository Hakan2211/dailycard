import { Reveal, SectionEyebrow } from "./primitives";
import { FEATURES } from "./content";
import { getCardTheme } from "@/lib/cardTheme";

export function FeatureGrid() {
  return (
    <section
      id="features"
      className="mx-auto w-full max-w-6xl scroll-mt-20 px-4 py-20 sm:py-28"
    >
      <Reveal className="mx-auto max-w-2xl text-center">
        <SectionEyebrow>How it works</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          The heart of your daily practice
        </h2>
        <p className="mt-4 text-white/60">
          Three simple ways to make it a habit. Everything else, from Studio to
          streaks, is included too.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-5 sm:gap-6 md:grid-cols-3">
        {FEATURES.map((f, i) => {
          const t = getCardTheme(f.theme);
          return (
            <Reveal key={f.title} delay={i * 0.08}>
              <article
                className={`group relative h-full overflow-hidden rounded-3xl border border-white/10 bg-white/[0.04] p-7 ring-1 ring-white/10 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:bg-white/[0.06] hover:shadow-2xl sm:p-8 ${t.glow}`}
              >
                {/* Accent colour wash glowing out of the top corner. */}
                <div
                  aria-hidden
                  className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity duration-300 group-hover:opacity-40 ${t.gradient}`}
                />
                <span
                  className={`relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-lg transition-transform duration-300 group-hover:scale-110 ${t.gradient}`}
                >
                  <f.icon className="h-7 w-7" />
                </span>
                <h3 className="relative mt-6 text-xl font-semibold">{f.title}</h3>
                <p className="relative mt-2.5 text-sm leading-relaxed text-white/65">
                  {f.description}
                </p>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
