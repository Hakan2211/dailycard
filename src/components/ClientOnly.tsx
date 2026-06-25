import { useEffect, useState, type ReactNode } from "react";

/**
 * Render `children` only after the component has mounted on the client.
 *
 * Uses a render-prop (`children: () => ReactNode`) on purpose: with plain
 * children the subtree's JSX would be constructed during the SSR pass even
 * though it's hidden, and some libraries (notably three.js / R3F) run side
 * effects at element creation. The thunk guarantees the client-only subtree is
 * never built on the server.
 *
 * `fallback` should match the first client paint (e.g. a static gradient) so
 * SSR HTML and hydration agree — no flash, no hydration mismatch.
 */
export function ClientOnly({
  children,
  fallback = null,
}: {
  children: () => ReactNode;
  fallback?: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return <>{mounted ? children() : fallback}</>;
}
