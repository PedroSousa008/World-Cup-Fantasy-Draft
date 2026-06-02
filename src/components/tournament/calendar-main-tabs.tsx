"use client";

import { SubTabs } from "@/components/layout/sub-tabs";
import { CALENDAR_TABS, calendarTabHref } from "@/lib/navigation";

export function CalendarMainTabs({ activeTab }: { activeTab: string }) {
  return (
    <SubTabs
      tabs={CALENDAR_TABS}
      activeTab={activeTab}
      basePath="/calendar"
      accent="green"
      hrefForTab={calendarTabHref}
    />
  );
}
