import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { SidebarLayout } from "@/components/SidebarLayout";
import { CalendarView } from "@/components/CalendarView";
import { CardModal } from "@/components/CardModal";
import { useCallback, useEffect, useState } from "react";

export const Route = createFileRoute("/calendar")({
  component: CalendarPage,
});

function CalendarPage() {
  const user = useQuery(api.users.currentUser);
  const navigate = useNavigate();

  // View modal state (for calendar cards)
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewCards, setViewCards] = useState<Array<{ card: any; deck: any }>>(
    []
  );

  useEffect(() => {
    if (user === null) {
      navigate({ to: "/login" });
    }
  }, [user, navigate]);

  const handleCalendarDateSelect = useCallback(
    (draws: Array<{ card: any; deck: any }>) => {
      setViewCards(draws);
      setViewModalOpen(true);
    },
    []
  );

  if (user === null) return null;

  return (
    <SidebarLayout title="Calendar">
      <CalendarView onDateSelect={handleCalendarDateSelect} />

      {viewCards.length > 0 && (
        <CardModal
          mode="view"
          cards={viewCards}
          open={viewModalOpen}
          onOpenChange={setViewModalOpen}
        />
      )}
    </SidebarLayout>
  );
}
