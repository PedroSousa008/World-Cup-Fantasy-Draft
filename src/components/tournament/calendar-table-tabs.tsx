"use client";

import { SubTabs } from "@/components/layout/sub-tabs";
import { CALENDAR_TABLE_TABS, CALENDAR_TABS, calendarTabHref } from "@/lib/navigation";

export function CalendarTableSectionTabs() {
  return (
    <>
      <SubTabs
        tabs={CALENDAR_TABS}
        activeTab="table"
        basePath="/calendar"
        accent="green"
        hrefForTab={calendarTabHref}
        isTabActive={(tab, path) =>
          tab.slug === "table"
            ? path.startsWith("/calendar/table")
            : path === `/calendar/${tab.slug}` || path.startsWith(`/calendar/${tab.slug}/`)
        }
      />
      <SubTabs tabs={CALENDAR_TABLE_TABS} basePath="/calendar/table" accent="green" />
    </>
  );
}
