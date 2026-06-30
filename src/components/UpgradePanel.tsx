import { useState } from "react";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStartCheckout } from "@/lib/checkout";
import { useOwnedEditions } from "@/lib/pro";
import {
  EDITIONS,
  INCLUDED,
  OFFER,
  PURCHASE_OPTIONS,
  type Edition,
  type EditionCode,
} from "@/components/landing/content";
import { EDITION_STORAGE_KEY } from "@/components/landing/useEdition";

function storedEdition(): EditionCode {
  if (typeof localStorage === "undefined") return "en";
  const v = localStorage.getItem(EDITION_STORAGE_KEY);
  return v === "de" || v === "both" ? v : "en";
}

/**
 * In-app purchase card. Reuses the landing offer copy/prices and adapts to what
 * the user already owns: nothing -> pick any edition or the bundle; owns one ->
 * offer the missing edition; owns both -> renders nothing.
 */
export function UpgradePanel({ className = "" }: { className?: string }) {
  const owned = useOwnedEditions();
  const { start, loading, error } = useStartCheckout();

  // Which SKUs to offer given current entitlements.
  const ownsEn = owned.includes("en");
  const ownsDe = owned.includes("de");
  let options: Edition[];
  if (!ownsEn && !ownsDe) {
    options = PURCHASE_OPTIONS; // en / de / both
  } else if (ownsEn && !ownsDe) {
    options = EDITIONS.filter((e) => e.code === "de");
  } else if (ownsDe && !ownsEn) {
    options = EDITIONS.filter((e) => e.code === "en");
  } else {
    return null; // owns both — nothing to sell
  }

  const initial = options.find((o) => o.code === storedEdition()) ?? options[0];
  const [selected, setSelected] = useState<EditionCode>(initial.code);

  const isBundle = selected === "both";
  const editionName =
    selected === "de" ? "Deutsch" : selected === "en" ? "English" : "both";
  const price = isBundle ? OFFER.bundlePrice : OFFER.price;
  const originalPrice = isBundle
    ? OFFER.bundleOriginalPrice
    : OFFER.originalPrice;
  const offerLabel = isBundle ? OFFER.bundleLabel : OFFER.discountLabel;
  const addingSecond = ownsEn || ownsDe;
  const ctaLabel = isBundle
    ? "Get both editions"
    : addingSecond
      ? `Add the ${editionName} edition`
      : `Get the ${editionName} edition`;

  return (
    <div
      className={`relative overflow-hidden rounded-3xl border border-white/15 bg-white/[0.05] p-6 ring-1 ring-white/10 backdrop-blur-xl sm:p-8 ${className}`}
    >
      <div className="relative flex flex-col items-center text-center">
        <span className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white">
          {offerLabel}
        </span>

        <div className="mt-5 flex items-end justify-center gap-3">
          <span className="text-base text-white/40 line-through">
            {originalPrice}
          </span>
          <span className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            {price}
          </span>
        </div>
        <p className="mt-2 text-sm text-white/55">
          one-time payment · lifetime access
        </p>

        {!addingSecond && (
          <ul className="mt-6 grid w-full gap-2.5 text-left sm:grid-cols-2">
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
        )}

        {options.length > 1 && (
          <div className="mt-7 flex flex-col items-center gap-3">
            <span className="text-xs font-medium uppercase tracking-[0.18em] text-white/45">
              Choose your edition
            </span>
            <div className="inline-flex rounded-full border border-white/15 bg-white/5 p-1">
              {options.map((e) => {
                const isSelected = selected === e.code;
                return (
                  <button
                    key={e.code}
                    type="button"
                    onClick={() => setSelected(e.code)}
                    aria-pressed={isSelected}
                    className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                      isSelected
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
        )}

        <Button
          onClick={() => void start(selected)}
          disabled={loading}
          size="lg"
          className="mt-6 w-full gap-2 shadow-xl sm:w-auto sm:px-10"
        >
          {loading ? "Starting checkout…" : ctaLabel}
          <ArrowRight className="h-4 w-4" />
        </Button>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}
        <p className="mt-3 text-xs text-white/40">
          Secure checkout with Stripe. Lifetime access, no subscription.
        </p>
      </div>
    </div>
  );
}
