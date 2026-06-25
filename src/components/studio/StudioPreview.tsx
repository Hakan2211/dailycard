import { forwardRef, useEffect, useRef, useState } from "react";
import type { Ref } from "react";
import {
  backgroundStyle,
  justifyForLayout,
  type StudioDesign,
} from "@/lib/studioDesign";

export const EXPORT_SIZE = 1080;

/** The full-resolution node that gets rasterized to an image (1080x1080). */
export const CardExportNode = forwardRef<HTMLDivElement, { design: StudioDesign }>(
  function CardExportNode({ design }, ref) {
    const hasImage = design.backgroundType === "image";
    return (
      <div
        ref={ref}
        style={{
          width: EXPORT_SIZE,
          height: EXPORT_SIZE,
          ...backgroundStyle(design),
          color: design.textColor,
          fontFamily: design.fontFamily,
          display: "flex",
          flexDirection: "column",
          justifyContent: justifyForLayout(design.layout),
          padding: 96,
          boxSizing: "border-box",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {hasImage && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(0,0,0,0.35)",
            }}
          />
        )}

        <div style={{ position: "relative", zIndex: 1 }}>
          {design.title ? (
            <div
              style={{
                fontSize: 38,
                fontWeight: 600,
                opacity: 0.85,
                marginBottom: 28,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              {design.title}
            </div>
          ) : null}

          {design.quote ? (
            <blockquote
              style={{
                fontSize: 76,
                lineHeight: 1.18,
                fontWeight: 700,
                margin: 0,
              }}
            >
              &ldquo;{design.quote}&rdquo;
            </blockquote>
          ) : null}

          {design.author ? (
            <div
              style={{
                fontSize: 40,
                marginTop: 40,
                opacity: 0.9,
                fontWeight: 500,
              }}
            >
              &mdash; {design.author}
            </div>
          ) : null}
        </div>

        <div
          style={{
            position: "absolute",
            bottom: 64,
            left: 96,
            zIndex: 1,
            fontSize: 28,
            fontWeight: 600,
            opacity: 0.7,
            letterSpacing: 1,
          }}
        >
          ✦ DailyCard
        </div>
      </div>
    );
  }
);

export function StudioPreview({
  design,
  exportRef,
  displaySize = 380,
  fluid = false,
}: {
  design: StudioDesign;
  exportRef?: Ref<HTMLDivElement>;
  displaySize?: number;
  /** Fill the parent's width (square) instead of a fixed displaySize. */
  fluid?: boolean;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [measured, setMeasured] = useState(0);

  useEffect(() => {
    if (!fluid) return;
    const el = wrapperRef.current;
    if (!el) return;
    const update = () => setMeasured(el.clientWidth);
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [fluid]);

  // In fluid mode the rendered size follows the measured container width.
  const size = fluid ? measured : displaySize;
  const scale = size / EXPORT_SIZE;

  return (
    <div
      ref={wrapperRef}
      className="relative shrink-0 overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/10"
      style={
        fluid
          ? { width: "100%", aspectRatio: "1 / 1" }
          : { width: displaySize, height: displaySize }
      }
    >
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          transform: `scale(${scale})`,
          transformOrigin: "top left",
        }}
      >
        <CardExportNode ref={exportRef ?? null} design={design} />
      </div>
    </div>
  );
}
