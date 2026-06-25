import { Component, type ReactNode } from "react";

/**
 * Catches any error thrown while creating/rendering the WebGL canvas (e.g.
 * WebGL unavailable) and shows the static gradient fallback instead of crashing
 * the page.
 */
export class StageErrorBoundary extends Component<
  { fallback: ReactNode; children: ReactNode },
  { hasError: boolean }
> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    console.warn("Stage canvas failed; using static fallback.", error);
  }

  render() {
    return this.state.hasError ? this.props.fallback : this.props.children;
  }
}
