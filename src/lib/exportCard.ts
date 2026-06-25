import { toBlob } from "html-to-image";

/**
 * Rasterize a DOM node (the studio's full-size 1080px card) to a PNG blob.
 *
 * Uses html-to-image so wrapped text, custom fonts, and gradients render
 * faithfully. NOTE: cross-origin images in the node (without proper CORS
 * headers) will taint the canvas and make this throw — prefer Convex-hosted
 * (same-origin-clean) backgrounds for uploads.
 */
export async function exportCardImage(node: HTMLElement): Promise<Blob> {
  const blob = await toBlob(node, {
    pixelRatio: 2,
    cacheBust: true,
  });
  if (!blob) throw new Error("Failed to render card image");
  return blob;
}
