import { useId } from "react";

/**
 * The DailyCard logo mark: a white card with a sparkle knocked out, on a dark
 * tile. Rendered inline (not via <img>) so it stays crisp and so a "DailyCard"
 * wordmark beside it can use the page's live Inter font. Shared across the
 * landing header/footer, the /login screen, and the app sidebar. ids are
 * per-instance so multiple marks on one page don't collide.
 */
export function BrandMark({ className }: { className?: string }) {
  const raw = useId();
  const uid = raw.replace(/:/g, "");
  const tile = `${uid}-tile`;
  const card = `${uid}-card`;
  const cut = `${uid}-cut`;
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      role="img"
      aria-label="DailyCard"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id={tile} x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#171a22" />
          <stop offset="1" stopColor="#0d0f14" />
        </linearGradient>
        <linearGradient id={card} x1="20" y1="13" x2="44" y2="51" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#dce3ee" />
        </linearGradient>
        <mask id={cut} maskUnits="userSpaceOnUse" x="0" y="0" width="64" height="64">
          <rect x="20" y="13" width="24" height="38" rx="5" fill="#fff" />
          <path
            d="M32 22.5 Q33.9 30.1 41.5 32 Q33.9 33.9 32 41.5 Q30.1 33.9 22.5 32 Q30.1 30.1 32 22.5 Z"
            fill="#000"
          />
        </mask>
      </defs>
      <rect x="1" y="1" width="62" height="62" rx="14" fill={`url(#${tile})`} stroke="#fff" strokeOpacity="0.1" />
      <rect x="20" y="13" width="24" height="38" rx="5" fill={`url(#${card})`} mask={`url(#${cut})`} />
    </svg>
  );
}
