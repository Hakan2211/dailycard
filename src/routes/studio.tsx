import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { useEffect } from "react";
import { api } from "../../convex/_generated/api";
import { SidebarLayout } from "@/components/SidebarLayout";
import { StudioEditor } from "@/components/studio/StudioEditor";
import { UpgradePrompt } from "@/components/UpgradePrompt";
import { useProAccess } from "@/lib/pro";

export const Route = createFileRoute("/studio")({
  component: StudioPage,
});

function StudioPage() {
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();
  const { locked } = useProAccess();

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
          title="Card Studio is a Pro feature"
          description="Upgrade to DailyCard Pro to design your own cards, then share and schedule them."
        />
      ) : (
        <StudioEditor />
      )}
    </SidebarLayout>
  );
}
