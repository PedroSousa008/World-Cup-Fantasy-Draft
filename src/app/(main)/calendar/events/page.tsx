import { CalendarDays } from "lucide-react";
import { PageHeader, SubNav } from "@/components/ui/PageHeader";
import { Card, EmptyState } from "@/components/ui/Card";

const subNavItems = [
  { href: "/calendar/events", label: "Calendar" },
  { href: "/calendar/games", label: "Games" },
];

export default function CalendarEventsPage() {
  return (
    <>
      <PageHeader
        title="Calendar"
        description="Matchdays, drafts, deadlines, and league events"
      />
      <SubNav items={subNavItems} activeHref="/calendar/events" />
      <Card>
        <EmptyState
          icon={<CalendarDays className="h-12 w-12" />}
          title="No events scheduled"
          description="Draft dates, betting deadlines, and custom events will appear here."
        />
      </Card>
    </>
  );
}
