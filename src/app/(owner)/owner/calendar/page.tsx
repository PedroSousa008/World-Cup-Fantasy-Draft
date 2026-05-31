import { PageHeader } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";
import { CalendarDays } from "lucide-react";

export default function OwnerCalendarPage() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Schedule matchdays, drafts, deadlines, and custom events"
      />
      <Card>
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="No events scheduled"
          description="Create matchday events, draft dates, betting deadlines, and more."
        />
      </Card>
    </>
  );
}
