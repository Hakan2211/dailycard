import { useNavigate } from "@tanstack/react-router";
import { useCallback } from "react";

/**
 * Shared CTA handler for the landing page. Routes to /login (Google or
 * email/password). The chosen edition is already persisted by useEdition, so
 * after sign-in the in-app upgrade panel can pre-select the matching checkout.
 */
export function useStartCta() {
  const navigate = useNavigate();
  return useCallback(() => void navigate({ to: "/login" }), [navigate]);
}
