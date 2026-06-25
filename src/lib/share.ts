export type ShareResult = "shared" | "downloaded" | "cancelled";

interface ShareOpts {
  title: string;
  text: string;
  filename: string;
}

/**
 * Share an image blob. On capable devices (mostly mobile) this opens the native
 * share sheet with the image file attached — the realistic path to Instagram.
 * Everywhere else it falls back to a download so the user can post manually.
 */
export async function shareImage(
  blob: Blob,
  { title, text, filename }: ShareOpts
): Promise<ShareResult> {
  const file = new File([blob], filename, { type: blob.type || "image/png" });

  const nav = navigator as Navigator & {
    canShare?: (data: { files: File[] }) => boolean;
    share?: (data: {
      files?: File[];
      title?: string;
      text?: string;
    }) => Promise<void>;
  };

  if (nav.canShare?.({ files: [file] }) && nav.share) {
    try {
      await nav.share({ files: [file], title, text });
      return "shared";
    } catch (err) {
      if ((err as DOMException)?.name === "AbortError") return "cancelled";
      // fall through to download
    }
  }

  downloadBlob(blob, filename);
  return "downloaded";
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/**
 * Best-effort deep link to open Instagram's story camera. Works only on devices
 * with the app installed; harmless elsewhere. The user adds the
 * downloaded/shared image once Instagram opens.
 */
export function openInstagramStory() {
  window.location.href = "instagram://story-camera";
}
