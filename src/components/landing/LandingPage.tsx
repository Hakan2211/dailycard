import { getMood } from "@/components/stage/moods";
import { LandingNav } from "./LandingNav";
import { Hero } from "./Hero";
import { StatBand } from "./StatBand";
import { FeatureGrid } from "./FeatureGrid";
import { DeckShowcase } from "./DeckShowcase";
import { LanguageSection } from "./LanguageSection";
import { Pricing } from "./Pricing";
import { FinalCta } from "./FinalCta";
import { LandingFooter } from "./LandingFooter";
import { EditionProvider } from "./useEdition";

/**
 * Public marketing page shown at `/` to logged-out visitors. Reuses the app's
 * dark "studio" backdrop (darkStudio mood) so it feels like a doorway into the
 * product. The backdrop is fixed and the studio image fades into near-black so
 * the whole scroll stays cohesive and premium.
 */
export function LandingPage() {
  const studio = getMood(undefined);

  return (
    <EditionProvider>
      <div className="relative min-h-screen overflow-x-clip text-foreground">
      {/* Fixed studio backdrop + dim + vignette (mirrors SidebarLayout). */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10"
        style={{ background: studio.fallbackCss }}
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[#0a0c10]/[0.88]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(120%_90%_at_50%_-10%,transparent_0%,rgba(5,7,10,0.5)_55%,rgba(5,7,10,0.92)_100%)]"
      />
      {/* Soft, slowly-breathing colour blobs so the page reads warm and alive
          instead of pure monochrome, kept low-opacity to stay premium. */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      >
        <div
          className="animate-glow-pulse absolute -left-40 top-[6%] h-[36rem] w-[36rem] rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(124,58,237,0.16), transparent 72%)",
          }}
        />
        <div
          className="animate-glow-pulse absolute -right-44 top-[38%] h-[34rem] w-[34rem] rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(2,132,199,0.15), transparent 72%)",
            animationDelay: "3s",
          }}
        />
        <div
          className="animate-glow-pulse absolute bottom-[-6rem] left-[28%] h-[32rem] w-[32rem] rounded-full blur-[110px]"
          style={{
            background:
              "radial-gradient(closest-side, rgba(217,119,6,0.13), transparent 72%)",
            animationDelay: "6s",
          }}
        />
      </div>

      <LandingNav />
      <main>
        <Hero />
        <StatBand />
        <FeatureGrid />
        <DeckShowcase />
        <LanguageSection />
        <Pricing />
        <FinalCta />
      </main>
      <LandingFooter />
      </div>
    </EditionProvider>
  );
}
