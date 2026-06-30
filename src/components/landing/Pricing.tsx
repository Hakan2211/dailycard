import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal, SectionEyebrow } from "./primitives";
import { useStartCta } from "./useStartCta";
import { useEdition } from "./useEdition";
import { INCLUDED, OFFER, PURCHASE_OPTIONS } from "./content";

export function Pricing() {
  const start = useStartCta();
  const { edition, setEdition } = useEdition();
  const isBundle = edition === "both";
  const editionName = edition === "de" ? "Deutsch" : "English";
  const price = isBundle ? OFFER.bundlePrice : OFFER.price;
  const originalPrice = isBundle ? OFFER.bundleOriginalPrice : OFFER.originalPrice;
  const offerLabel = isBundle ? OFFER.bundleLabel : OFFER.discountLabel;
  const ctaLabel = isBundle ? "Get both editions" : `Get the ${editionName} edition`;

  return (
    <section
      id="pricing"
      className="mx-auto w-full max-w-3xl scroll-mt-20 px-4 py-20 sm:py-28"
    >
      <Reveal className="text-center">
        <SectionEyebrow>One simple price</SectionEyebrow>
        <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Own it for life
        </h2>
        <p className="mt-4 text-white/60">Pay once. Keep everything, forever.</p>
      </Reveal>

      <Reveal className="mt-12">
        <div className="relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] p-8 ring-1 ring-white/10 backdrop-blur-xl sm:p-10">
          {/* Soft platinum glow behind the price. */}
          <div
            aria-hidden
            className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[28rem] max-w-full -translate-x-1/2 rounded-full bg-white/10 blur-3xl"
          />
          <div className="relative flex flex-col items-center text-center">
            <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
              {offerLabel}
            </span>

            <div className="mt-6 flex items-end justify-center gap-3">
              <span className="text-lg text-white/40 line-through">
                {originalPrice}
              </span>
              <span className="text-5xl font-bold tracking-tight text-white sm:text-6xl">
                {price}
              </span>
            </div>
            <p className="mt-2 text-sm text-white/55">
              one-time payment · lifetime access
            </p>

            <ul className="mt-8 grid w-full gap-3 text-left sm:grid-cols-2">
              {INCLUDED.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2.5 text-sm text-white/75"
                >
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/10">
                    <Check className="h-3 w-3 text-white" />
                  </span>
                  {item}
                </li>
              ))}
            </ul>

            {/* Edition picker, synced with the language section above. */}
            <div className="mt-9 flex flex-col items-center gap-3">
              <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
                Choose your edition
              </span>
              <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
                {PURCHASE_OPTIONS.map((e) => {
                  const selected = edition === e.code;
                  return (
                    <button
                      key={e.code}
                      type="button"
                      onClick={() => setEdition(e.code)}
                      aria-pressed={selected}
                      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                        selected
                          ? "bg-white text-[#0a0c10]"
                          : "text-white/60 hover:text-white"
                      }`}
                    >
                      <span aria-hidden>{e.flag}</span> {e.name}
                    </button>
                  );
                })}
              </div>
            </div>

            <Button
              onClick={() => {
                setEdition(edition); // ensure the choice is persisted for checkout
                start();
              }}
              size="lg"
              className="mt-6 w-full gap-2 shadow-xl sm:w-auto sm:px-10"
            >
              {ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Button>
            <p className="mt-3 text-xs text-white/40">
              Choose your edition, then sign in to continue to secure Stripe
              checkout.
            </p>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
