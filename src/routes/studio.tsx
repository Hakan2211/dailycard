import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { SidebarLayout } from "@/components/SidebarLayout";
import { StudioEditor } from "@/components/studio/StudioEditor";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useProAccess } from "@/lib/pro";
import { useActiveLanguage } from "@/lib/language";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
});

function StudioPage() {
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();
  const { locked } = useProAccess();
  const { language } = useActiveLanguage();

  useEffect(() => {
    if (user === null) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  if (user === null) return null;

  return (
    <SidebarLayout title="Studio">
      {locked ? (
        <UpgradePrompt
          title="Card Studio is a premium feature"
          description="Unlock a DailyCard edition to design your own cards, then share and schedule them."
          edition={language}
          cta="Unlock the Studio"
        />
      ) : (
        <StudioEditor />
      )}
    </SidebarLayout>
  );
}
