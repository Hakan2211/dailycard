import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import type { ReactNode } from "react";
import { api } from "../../convex/_generated/api";
import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { getMood } from "@/components/stage/moods";

export function SidebarLayout({
  children,
  title,
}: {
  children: ReactNode;
  title?: string;
}) {
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();

  // Centralized auth guard for all protected routes.
  useEffect(() => {
    if (user === null) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  // Lightweight static "studio" backdrop (no WebGL) so every route shares the
  // immersive routes' atmosphere; the live animated Stage stays exclusive to
  // StageLayout.
  const studio = getMood(undefined);

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="relative" style={{ background: studio.fallbackCss }}>
        {/* Darken the studio backdrop down to the near-black "stage" look so
            every route matches the immersive routes — only a faint hint of the
            studio texture/god-rays survives. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[#0a0c10]/90"
        />
        {/* Soft vignette to deepen the edges (premium, focused feel). */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(120%_100%_at_50%_-10%,transparent_0%,rgba(5,7,10,0.55)_70%,rgba(5,7,10,0.85)_100%)]"
        />
        <header className="sticky top-0 z-10 flex h-14 items-center gap-2 border-b border-white/10 bg-background/50 px-4 backdrop-blur-md">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-1 h-4" />
          <span className="text-sm font-semibold">{title ?? "DailyCard"}</span>
        </header>
        <main className="relative z-10 flex-1">
          <div className="mx-auto w-full max-w-5xl px-4 py-6">{children}</div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
