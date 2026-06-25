export type BackgroundType = "color" | "gradient" | "image";
export type LayoutKind = "centered" | "top" | "bottom";

export interface StudioDesign {
  title?: string;
  quote: string;
  author?: string;
  backgroundType: BackgroundType;
  /** hex (color), CSS gradient string (gradient), or image URL (image) */
  backgroundValue: string;
  backgroundStorageId?: string;
  fontFamily: string;
  textColor: string;
  layout: LayoutKind;
}

export const FONT_OPTIONS: Array<{ label: string; value: string }> = [
  { label: "Sans", value: "Inter, system-ui, sans-serif" },
  { label: "Serif", value: "Georgia, 'Times New Roman', serif" },
  { label: "Mono", value: "'Courier New', ui-monospace, monospace" },
  { label: "Rounded", value: "ui-rounded, 'Segoe UI', system-ui, sans-serif" },
];

export const COLOR_SWATCHES = [
  "#0f172a",
  "#1e3a8a",
  "#065f46",
  "#7c2d12",
  "#831843",
  "#4c1d95",
  "#0c4a6e",
  "#ffffff",
];

export const GRADIENT_PRESETS = [
  "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
  "linear-gradient(135deg, #10b981 0%, #064e3b 100%)",
  "linear-gradient(135deg, #f59e0b 0%, #b45309 100%)",
  "linear-gradient(135deg, #ec4899 0%, #be185d 100%)",
  "linear-gradient(135deg, #0ea5e9 0%, #1e3a8a 100%)",
  "linear-gradient(160deg, #1f2937 0%, #111827 100%)",
];

export const TEXT_COLORS = ["#ffffff", "#0f172a", "#fde68a", "#f5f5f4"];

export const LAYOUTS: Array<{ label: string; value: LayoutKind }> = [
  { label: "Centered", value: "centered" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
];

export const DEFAULT_DESIGN: StudioDesign = {
  title: "",
  quote: "The journey of a thousand miles begins with a single step.",
  author: "Lao Tzu",
  backgroundType: "gradient",
  backgroundValue: GRADIENT_PRESETS[0],
  fontFamily: FONT_OPTIONS[0].value,
  textColor: "#ffffff",
  layout: "centered",
};

/** CSS background props for a given design (used by preview + export node). */
export function backgroundStyle(design: StudioDesign): React.CSSProperties {
  if (design.backgroundType === "color") {
    return { backgroundColor: design.backgroundValue };
  }
  if (design.backgroundType === "gradient") {
    return { backgroundImage: design.backgroundValue };
  }
  // image — fit the whole image (matted), never crop
  return {
    backgroundImage: design.backgroundValue
      ? `url("${design.backgroundValue}")`
      : undefined,
    backgroundColor: "#0f172a",
    backgroundSize: "contain",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "center",
  };
}

export function justifyForLayout(layout: LayoutKind): string {
  if (layout === "top") return "flex-start";
  if (layout === "bottom") return "flex-end";
  return "center";
}

/** Map a persisted studioCards doc (optionally with a resolved storage URL). */
export function studioDocToDesign(card: {
  title?: string;
  quote: string;
  author?: string;
  backgroundType: BackgroundType;
  backgroundValue: string;
  backgroundStorageId?: string;
  backgroundStorageUrl?: string | null;
  fontFamily: string;
  textColor: string;
  layout: string;
}): StudioDesign {
  return {
    title: card.title ?? "",
    quote: card.quote,
    author: card.author ?? "",
    backgroundType: card.backgroundType,
    backgroundValue: card.backgroundStorageId
      ? card.backgroundStorageUrl ?? card.backgroundValue
      : card.backgroundValue,
    backgroundStorageId: card.backgroundStorageId,
    fontFamily: card.fontFamily,
    textColor: card.textColor,
    layout: card.layout as LayoutKind,
  };
}

/** Build a shareable design from a drawn curated card. */
export function curatedCardToDesign(opts: {
  quote: string;
  author?: string;
  imageUrl: string;
  deckTitle?: string;
}): StudioDesign {
  return {
    title: opts.deckTitle ?? "",
    quote: opts.quote,
    author: opts.author ?? "",
    backgroundType: "image",
    backgroundValue: opts.imageUrl,
    fontFamily: FONT_OPTIONS[0].value,
    textColor: "#ffffff",
    layout: "bottom",
  };
}
