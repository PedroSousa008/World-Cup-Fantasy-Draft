import { PageHeader } from "@/components/layout/section-page";
import { CalendarTableSectionTabs } from "@/components/tournament/calendar-table-tabs";

export default function CalendarTableLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <CalendarTableSectionTabs />
      <PageHeader
        title="Table"
        description="Group standings and knockout bracket."
      />
      {children}
    </div>
  );
}
