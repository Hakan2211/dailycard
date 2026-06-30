import type { MouseEvent } from "react";

/**
 * Smoothly scroll to an in-page section when an anchor like `href="#decks"` is
 * clicked. Honours each section's `scroll-mt-*` (so it clears the sticky header)
 * and `prefers-reduced-motion`, and keeps the URL hash in sync. Non-hash links
 * fall through to default browser behaviour.
 */
export function handleAnchorScroll(e: MouseEvent<HTMLAnchorElement>) {
  const href = e.currentTarget.getAttribute("href");
  if (!href || !href.startsWith("#")) return;

  const target = document.getElementById(href.slice(1));
  if (!target) return;

  e.preventDefault();
  const prefersReduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  target.scrollIntoView({
    behavior: prefersReduced ? "auto" : "smooth",
    block: "start",
  });
  history.pushState(null, "", href);
}
