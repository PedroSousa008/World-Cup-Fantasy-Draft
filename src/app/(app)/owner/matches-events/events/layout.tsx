import { SubTabs } from "@/components/layout/sub-tabs";
import { OWNER_EVENTS_TABS } from "@/lib/navigation";

export default function OwnerEventsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-6">
      <SubTabs
        tabs={OWNER_EVENTS_TABS}
        basePath="/owner/matches-events/events"
        accent="blue"
      />
      {children}
    </div>
  );
}
