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
import { Stage } from "@/components/stage/Stage";
import type { MoodId } from "@/components/stage/moods";

/**
 * Full-bleed, dark, immersive layout for the 3D stage (Daily 3, deck browse).
 * Unlike SidebarLayout it has no max-width / padding chrome: the stage fills the
 * screen behind the content. The sidebar stays expanded (same as every other
 * route) and can be collapsed via the floating menu button for a fully
 * immersive view. Holds the centralized auth guard so stage routes don't repeat it.
 */
export function StageLayout({
  children,
  mood,
}: {
  children: ReactNode;
  mood?: MoodId;
}) {
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) navigate({ to: "/login" });
  }, [user, navigate]);

  if (user === null) return null;

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-black text-white">
        <div className="relative h-svh w-full overflow-hidden bg-black text-white">
          <Stage mood={mood} />

          {/* Floating menu button — opens the same AppSidebar. */}
          <div className="absolute left-4 top-4 z-30">
            <SidebarTrigger className="size-10 rounded-full border border-white/15 bg-black/40 text-white shadow-lg backdrop-blur-md hover:bg-black/60 hover:text-white" />
          </div>

          {/* Foreground content (the cards) — receives all pointer input. */}
          <div className="relative z-20 flex h-full w-full flex-col overflow-y-auto">
            {children}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
