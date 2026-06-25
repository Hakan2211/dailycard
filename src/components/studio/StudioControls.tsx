import { useState } from "react";
import type { ChangeEvent, ReactNode } from "react";
import { useMutation, useConvex } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Loader2 } from "lucide-react";
import {
  FONT_OPTIONS,
  COLOR_SWATCHES,
  GRADIENT_PRESETS,
  TEXT_COLORS,
  LAYOUTS,
  type StudioDesign,
  type BackgroundType,
} from "@/lib/studioDesign";

const BG_TYPES: Array<{ label: string; value: BackgroundType }> = [
  { label: "Color", value: "color" },
  { label: "Gradient", value: "gradient" },
  { label: "Image", value: "image" },
];

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-medium text-muted-foreground">
        {label}
      </label>
      {children}
    </div>
  );
}

function Segmented<T extends string>({
  options,
  value,
  onSelect,
}: {
  options: Array<{ label: string; value: T }>;
  value: T;
  onSelect: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-lg bg-muted p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onSelect(o.value)}
          className={`flex-1 rounded-md px-2 py-1.5 text-xs font-medium transition-all ${
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function StudioControls({
  design,
  onChange,
}: {
  design: StudioDesign;
  onChange: (patch: Partial<StudioDesign>) => void;
}) {
  const generateUploadUrl = useMutation(api.studio.generateUploadUrl);
  const convex = useConvex();
  const [uploading, setUploading] = useState(false);

  async function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await generateUploadUrl();
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();
      const served = await convex.query(api.studio.getStorageUrl, {
        storageId,
      });
      onChange({
        backgroundType: "image",
        backgroundStorageId: storageId,
        backgroundValue: served ?? "",
      });
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  function setBgType(type: BackgroundType) {
    if (type === "color") {
      onChange({ backgroundType: "color", backgroundValue: COLOR_SWATCHES[0] });
    } else if (type === "gradient") {
      onChange({
        backgroundType: "gradient",
        backgroundValue: GRADIENT_PRESETS[0],
      });
    } else {
      onChange({ backgroundType: "image" });
    }
  }

  return (
    <div className="space-y-5">
      <Field label="Title (optional)">
        <Input
          value={design.title ?? ""}
          maxLength={40}
          placeholder="e.g. Daily Wisdom"
          onChange={(e) => onChange({ title: e.target.value })}
        />
      </Field>

      <Field label="Quote">
        <textarea
          value={design.quote}
          rows={3}
          maxLength={240}
          placeholder="Write your quote..."
          onChange={(e) => onChange({ quote: e.target.value })}
          className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        />
      </Field>

      <Field label="Author (optional)">
        <Input
          value={design.author ?? ""}
          maxLength={60}
          placeholder="e.g. Lao Tzu"
          onChange={(e) => onChange({ author: e.target.value })}
        />
      </Field>

      <Field label="Background">
        <Segmented options={BG_TYPES} value={design.backgroundType} onSelect={setBgType} />
      </Field>

      {design.backgroundType === "color" && (
        <div className="flex flex-wrap items-center gap-2">
          {COLOR_SWATCHES.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ backgroundValue: c })}
              className={`h-8 w-8 rounded-full border ${
                design.backgroundValue === c
                  ? "ring-2 ring-ring ring-offset-2"
                  : ""
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
          <input
            type="color"
            value={
              design.backgroundValue.startsWith("#")
                ? design.backgroundValue
                : "#000000"
            }
            onChange={(e) => onChange({ backgroundValue: e.target.value })}
            className="h-8 w-8 cursor-pointer rounded-full border bg-transparent"
            aria-label="Custom color"
          />
        </div>
      )}

      {design.backgroundType === "gradient" && (
        <div className="grid grid-cols-3 gap-2">
          {GRADIENT_PRESETS.map((g) => (
            <button
              key={g}
              onClick={() => onChange({ backgroundValue: g })}
              className={`h-12 rounded-lg border ${
                design.backgroundValue === g ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
              style={{ backgroundImage: g }}
              aria-label="gradient"
            />
          ))}
        </div>
      )}

      {design.backgroundType === "image" && (
        <div className="space-y-2">
          <Input
            value={design.backgroundStorageId ? "" : design.backgroundValue}
            placeholder="Paste image URL..."
            onChange={(e) =>
              onChange({
                backgroundValue: e.target.value,
                backgroundStorageId: undefined,
              })
            }
          />
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" size="sm" disabled={uploading}>
              <label className="cursor-pointer">
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload image
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
              </label>
            </Button>
            {design.backgroundStorageId && (
              <span className="text-xs text-muted-foreground">Uploaded ✓</span>
            )}
          </div>
        </div>
      )}

      <Field label="Font">
        <div className="grid grid-cols-2 gap-2">
          {FONT_OPTIONS.map((f) => (
            <button
              key={f.value}
              onClick={() => onChange({ fontFamily: f.value })}
              style={{ fontFamily: f.value }}
              className={`rounded-md border px-3 py-2 text-sm transition-colors ${
                design.fontFamily === f.value
                  ? "border-ring bg-accent"
                  : "hover:bg-accent/50"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </Field>

      <Field label="Text color">
        <div className="flex items-center gap-2">
          {TEXT_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onChange({ textColor: c })}
              className={`h-8 w-8 rounded-full border ${
                design.textColor === c ? "ring-2 ring-ring ring-offset-2" : ""
              }`}
              style={{ backgroundColor: c }}
              aria-label={c}
            />
          ))}
        </div>
      </Field>

      <Field label="Layout">
        <Segmented
          options={LAYOUTS}
          value={design.layout}
          onSelect={(v) => onChange({ layout: v })}
        />
      </Field>
    </div>
  );
}
